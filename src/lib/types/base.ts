export type NonNullPrimitive = string | number | boolean;

export type FilterPrimitive = NonNullPrimitive | null;

export interface RangeOrEqualityFilter {
  gte?: FilterPrimitive;
  lte?: FilterPrimitive;
  eq?: FilterPrimitive;
}

export type FilterValue = FilterPrimitive | FilterPrimitive[] | RangeOrEqualityFilter;

export interface PaginationOptions<
  TFilters = Record<string, FilterValue>
> {
  page: number;
  pageSize: number;
  searchQuery?: string;
  searchableFields?: string[];
  filters?: TFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
}

export type ServiceResponse<T> =
  | {
      success: true;
      data: T;
      id?: string | number;
    }
  | {
      success: false;
      error: string;
      validationErrors?: Record<string, string[]>;
    };
