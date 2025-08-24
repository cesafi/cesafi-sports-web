import { useState, useCallback, useMemo } from 'react';
import { PaginationOptions } from '@/lib/types/base';
import { TableState, TableFilters, UseTableOptions, UseTableReturn, BaseEntity } from '@/lib/types/table';

export function useTable<T extends BaseEntity>(options: UseTableOptions<T> = {}): UseTableReturn<T> {
  const {
    initialPage = 1,
    initialPageSize = 5,
    initialSortBy,
    initialSortOrder = 'asc',
    initialFilters = {}
  } = options;

  const [tableState, setTableState] = useState<TableState>({
    page: initialPage,
    pageSize: initialPageSize,
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
    filters: initialFilters
  });

  const setPage = useCallback((page: number) => {
    setTableState(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setTableState(prev => ({ ...prev, pageSize, page: 1 })); // Reset to first page when changing page size
  }, []);

  const setSortBy = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setTableState(prev => ({ ...prev, sortBy, sortOrder, page: 1 })); // Reset to first page when sorting
  }, []);

  const setSearch = useCallback((search: string) => {
    setTableState(prev => ({ 
      ...prev, 
      filters: { ...prev.filters, search },
      page: 1 // Reset to first page when searching
    }));
  }, []);

  const setFilters = useCallback((filters: TableFilters) => {
    setTableState(prev => ({ 
      ...prev, 
      filters: { ...prev.filters, ...filters },
      page: 1 // Reset to first page when filtering
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setTableState(prev => ({
      ...prev,
      filters: {},
      page: 1
    }));
  }, []);

  const paginationOptions = useMemo((): PaginationOptions<TableFilters> => ({
    page: tableState.page,
    pageSize: tableState.pageSize,
    searchQuery: tableState.filters.search,
    sortBy: tableState.sortBy,
    sortOrder: tableState.sortOrder,
    filters: tableState.filters
  }), [tableState]);

  const tableProps = useMemo(() => ({
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    onSortChange: setSortBy,
    onSearchChange: setSearch,
    onFiltersChange: setFilters
  }), [setPage, setPageSize, setSortBy, setSearch, setFilters]);

  return {
    tableState,
    setPage,
    setPageSize,
    setSortBy,
    setSearch,
    setFilters,
    resetFilters,
    paginationOptions,
    tableProps
  };
}
