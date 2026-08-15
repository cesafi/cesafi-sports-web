import {
  NonNullPrimitive,
  PaginatedResponse,
  PaginationOptions,
  RangeOrEqualityFilter,
  ServiceResponse,
  FilterValue
} from '../lib/types/base';

import { AdminSupabaseClient } from '../lib/supabase/admin';
import { getSupabaseClient } from '../lib/supabase/client';
import { getSupabaseServer } from '../lib/supabase/server';
import { createAdminClient } from '../lib/supabase/admin';
import { db } from '../db';

export abstract class BaseService {
  protected static getDrizzle() {
    return db;
  }

  protected static async getClient() {
    const isServer = typeof window === 'undefined';

    if (isServer) {
      return getSupabaseServer();
    } else {
      return getSupabaseClient();
    }
  }

  protected static async getAdminClient(): Promise<AdminSupabaseClient> {
    return createAdminClient();
  }

  protected static formatError<T>(error: unknown, fallbackMessage: string): ServiceResponse<T> {
    let errorMessage = fallbackMessage;

    if (error && typeof error === 'object') {
      const err = error as Record<string, any>;
      
      // Handle Postgres / Supabase errors (PostgrestError)
      if (err.code && err.message) {
        let details = err.details ? ` - ${err.details}` : '';
        let hint = err.hint ? ` (Hint: ${err.hint})` : '';
        errorMessage = `${fallbackMessage}: ERR CODE ${err.code}: ${err.message}${details}${hint}`;
      } else if (err.message) {
        errorMessage = `${fallbackMessage}: ${err.message}`;
      }
    } else if (typeof error === 'string') {
      errorMessage = `${fallbackMessage}: ${error}`;
    }

    return {
      success: false,
      error: errorMessage
    };
  }

  private static applyFiltersToQuery<TFilters extends Record<string, FilterValue>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: any,
    filters: TFilters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any {
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'search') return;

      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          const nonNullValues = value.filter((item): item is NonNullPrimitive => item !== null);

          if (nonNullValues.length > 0) {
            query = query.in(key, nonNullValues);
          }
        } else if (typeof value === 'object' && value !== null) {
          const { gte, lte, eq } = value as RangeOrEqualityFilter;

          if (gte !== undefined) query = query.gte(key, gte);
          if (lte !== undefined) query = query.lte(key, lte);
          if (eq !== undefined && eq !== null) query = query.eq(key, eq);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    return query;
  }

  protected static async getPaginatedData<
    T,
    TableName extends string,
    TFilters extends Record<string, FilterValue> = Record<string, FilterValue>
  >(
    tableName: TableName,
    options: PaginationOptions<TFilters>,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<T>>> {
    try {
      const { page, pageSize, filters, searchQuery, searchableFields, sortBy, sortOrder } = options;

      const supabase = await this.getClient();

      const offset = (page - 1) * pageSize;

      let query = supabase.from(tableName).select(selectQuery, { count: 'exact' });

      if (filters) {
        // Apply filters using a more type-safe approach
        query = this.applyFiltersToQuery(query, filters);
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
      return this.formatError(error, `Failed to fetch paginated ${String(tableName)}`);
    }
  }

  protected static async getDrizzlePaginatedData<
    T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TTable extends any,
    TFilters extends Record<string, FilterValue> = Record<string, FilterValue>
  >(
    table: TTable,
    options: PaginationOptions<TFilters>
  ): Promise<ServiceResponse<PaginatedResponse<T>>> {
    try {
      const { page, pageSize, filters, searchQuery, searchableFields, sortBy, sortOrder } = options;
      
      const db = this.getDrizzle();
      const offset = (page - 1) * pageSize;
      
      const { sql, eq, inArray, gte, lte, or, ilike, and, desc, asc } = await import('drizzle-orm');

      const conditions = [];

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (key === 'search') return;
          const col = (table as any)[key];
          if (!col) return;

          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              const nonNullValues = value.filter(item => item !== null);
              if (nonNullValues.length > 0) {
                conditions.push(inArray(col, nonNullValues));
              }
            } else if (typeof value === 'object' && value !== null) {
              const { gte: gteVal, lte: lteVal, eq: eqVal } = value as RangeOrEqualityFilter;
              if (gteVal !== undefined) conditions.push(gte(col, gteVal));
              if (lteVal !== undefined) conditions.push(lte(col, lteVal));
              if (eqVal !== undefined && eqVal !== null) conditions.push(eq(col, eqVal));
            } else {
              conditions.push(eq(col, value));
            }
          }
        });
      }

      if (searchQuery && searchQuery.trim() && searchableFields && searchableFields.length > 0) {
        const searchConditions = searchableFields.map(field => {
          const col = (table as any)[field];
          if (!col) return null;
          
          const numericValue = Number(searchQuery);
          if (!isNaN(numericValue) && col.dataType === 'number') {
            return or(eq(col, numericValue), ilike(col, `%${searchQuery}%`));
          } else {
            return ilike(col, `%${searchQuery}%`);
          }
        }).filter(Boolean);
        
        if (searchConditions.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          conditions.push(or(...(searchConditions as any)));
        }
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      let orderByClause = undefined;
      if (sortBy && (table as any)[sortBy]) {
        orderByClause = sortOrder === 'desc' ? desc((table as any)[sortBy]) : asc((table as any)[sortBy]);
      }

      // Execute queries
      const dataQuery = db.select().from(table as any);
      if (whereClause) dataQuery.where(whereClause);
      if (orderByClause) dataQuery.orderBy(orderByClause);
      dataQuery.limit(pageSize).offset(offset);

      const countQuery = db.select({ count: sql<number>`count(*)` }).from(table as any);
      if (whereClause) countQuery.where(whereClause);

      const [data, countResult] = await Promise.all([
        dataQuery,
        countQuery
      ]);

      const totalCount = Number(countResult[0]?.count || 0);
      const pageCount = Math.ceil(totalCount / pageSize);

      return {
        success: true,
        data: {
          data: data as unknown as T[],
          totalCount,
          pageCount,
          currentPage: page
        }
      };
    } catch (error) {
      console.error('BaseService.getDrizzlePaginatedData error:', error);
      return this.formatError(error, 'Failed to fetch paginated data');
    }
  }
}
