import {
  NonNullPrimitive,
  PaginatedResponse,
  PaginationOptions,
  RangeOrEqualityFilter,
  ServiceResponse
} from '../lib/types/base';
import { Database } from '../../database.types';
import { AdminSupabaseClient } from '../lib/supabase/admin';
import { createClient as createBrowserClient } from '../lib/supabase/client';
import { createClient as createServerClient } from '../lib/supabase/server';
import { createAdminClient } from '../lib/supabase/admin';

export abstract class BaseService {
  protected static async getClient() {
    const isServer = typeof window === 'undefined';

    if (isServer) {
      return createServerClient();
    } else {
      return createBrowserClient();
    }
  }

  protected static async getAdminClient(): Promise<AdminSupabaseClient> {
    return createAdminClient();
  }

  protected static formatError<T>(error: unknown, message: string): ServiceResponse<T> {
    return {
      success: false,
      error: error instanceof Error ? error.message : message
    };
  }

  protected static async getPaginatedData<T, TableName extends keyof Database['public']['Tables']>(
    tableName: TableName,
    options: PaginationOptions,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<T>>> {
    try {
      const { page, pageSize, filters, searchQuery, searchableFields, sortBy, sortOrder } = options;

      const supabase = await this.getClient();

      const offset = (page - 1) * pageSize;

      let query = supabase.from(tableName).select(selectQuery, { count: 'exact' });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (key === 'search') return;

          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              const nonNullValues = value.filter((item): item is NonNullPrimitive => item !== null);

              if (nonNullValues.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                query = query.in(key, nonNullValues as any[]);
              }
            } else if (typeof value === 'object' && value !== null) {
              const { gte, lte, eq } = value as RangeOrEqualityFilter;

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (gte !== undefined) query = query.gte(key, gte as any);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (lte !== undefined) query = query.lte(key, lte as any);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (eq !== undefined) query = query.eq(key, eq as any);
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              query = query.eq(key, value as any);
            }
          }
        });
      }

      if (searchQuery && searchQuery.trim() && searchableFields && searchableFields.length > 0) {
        const searchConditions = searchableFields.map((field) => {
          const numericValue = Number(searchQuery);
          if (!isNaN(numericValue)) {
            return `or(${field}.eq.${numericValue},${field}.ilike.%${searchQuery}%)`;
          } else {
            return `${field}.ilike.%${searchQuery}%`;
          }
        });
        query = query.or(searchConditions.join(','));
      }

      if (sortBy) {
        query = query.order(sortBy, { ascending: sortOrder !== 'desc' });
      }

      const { data, error, count } = await query.range(offset, offset + pageSize - 1);

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      const totalCount = count || 0;
      const pageCount = Math.ceil(totalCount / pageSize);

      const result = {
        success: true as const,
        data: {
          data: data as T[],
          totalCount,
          pageCount,
          currentPage: page
        }
      };
      return result;
    } catch (error) {
      console.error('BaseService.getPaginatedData error:', error);
      return this.formatError(error, `Failed to fetch paginated ${tableName}`);
    }
  }
}
