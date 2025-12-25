import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedSports,
  getAllSports,
  getSportById,
  createSport,
  updateSportById,
  deleteSportById
} from '@/actions/sports';

import {
  getSportCategoriesBySportId,
  getSportCategoriesByDivision,
  getSportCategoriesByLevel,
  getSportCategoriesBySportAndDivision,
  getSportCategoriesBySportAndLevel,
  getCategoriesWithSportDetails,
  getAllSportCategories,
  getUniqueDivisions,
  getUniqueLevels,
  createSportCategory,
  updateSportCategoryById,
  deleteSportCategoryById
} from '@/actions/sport-categories';

import { SportInsert, SportUpdate, SportsPaginationOptions, Sport, SportCategory, SportCategoryInsert, SportCategoryUpdate } from '@/lib/types/sports';
import { PaginatedResponse, ServiceResponse, FilterValue, PaginationOptions } from '@/lib/types/base';

// Custom response type for the sports action that wraps data in an extra layer
type SportsPaginatedResponse = {
  success: boolean;
  error?: string;
  data?: {
    data: Sport[];
    totalCount: number;
    pageCount: number;
    currentPage: number;
  };
};
import { useTable } from './use-table';
import { TableFilters } from '@/lib/types/table';
import { toast } from 'sonner';

export const sportKeys = {
  all: ['sports'] as const,
  paginated: (options: SportsPaginationOptions) =>
    [...sportKeys.all, 'paginated', options] as const,
  details: (id: number) => [...sportKeys.all, id] as const
};

export const sportCategoryKeys = {
  all: ['sport-categories'] as const,
  bySport: (sportId: number) => [...sportCategoryKeys.all, 'by-sport', sportId] as const,
  byDivision: (division: 'men' | 'women' | 'mixed') => [...sportCategoryKeys.all, 'by-division', division] as const,
  byLevel: (level: 'elementary' | 'high_school' | 'college') => [...sportCategoryKeys.all, 'by-level', level] as const,
  bySportAndDivision: (sportId: number, division: 'men' | 'women' | 'mixed') => [...sportCategoryKeys.all, 'by-sport-and-division', sportId, division] as const,
  bySportAndLevel: (sportId: number, level: 'elementary' | 'high_school' | 'college') => [...sportCategoryKeys.all, 'by-sport-and-level', sportId, level] as const,
  withDetails: ['sport-categories', 'with-details'] as const,
  uniqueDivisions: ['sport-categories', 'unique-divisions'] as const,
  uniqueLevels: ['sport-categories', 'unique-levels'] as const,
  details: (id: number) => [...sportCategoryKeys.all, id] as const
};

// Basic sport operations
export function usePaginatedSports(
  options: SportsPaginationOptions,
  queryOptions?: UseQueryOptions<
    SportsPaginatedResponse,
    Error,
    PaginatedResponse<Sport>
  >
) {
  return useQuery({
    queryKey: sportKeys.paginated(options),
    queryFn: () => getPaginatedSports(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch paginated sports.');
      }
      // The action returns data wrapped in an extra layer
      return data.data!;
    },
    ...queryOptions
  });
}

export function useAllSports(
  queryOptions?: UseQueryOptions<ServiceResponse<Sport[]>, Error, Sport[]>
) {
  return useQuery({
    queryKey: sportKeys.all,
    queryFn: getAllSports,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : 'Failed to fetch all sports.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllSportCategories(
  queryOptions?: UseQueryOptions<ServiceResponse<SportCategory[]>, Error, SportCategory[]>
) {
  return useQuery({
    queryKey: sportCategoryKeys.all,
    queryFn: getAllSportCategories,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : 'Failed to fetch all sport categories.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useSportById(
  id: number,
  queryOptions?: UseQueryOptions<ServiceResponse<Sport>, Error, Sport>
) {
  return useQuery({
    queryKey: sportKeys.details(id),
    queryFn: () => getSportById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : `Sport with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

// Sport mutations
export function useCreateSport(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SportInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSport,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: sportKeys.all });
      }
      (mutationOptions?.onSuccess as any)?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create sport:', error);
      (mutationOptions?.onError as any)?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateSport(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SportUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSportById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: sportKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: sportKeys.details(variables.id) });
        }
      }
      (mutationOptions?.onSuccess as any)?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update sport:', error);
      (mutationOptions?.onError as any)?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteSport(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, number>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSportById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: sportKeys.all });
        queryClient.invalidateQueries({ queryKey: sportKeys.details(id) });
        // CRITICAL: Invalidate related entities that depend on this sport
        queryClient.invalidateQueries({ queryKey: sportCategoryKeys.all });
        queryClient.invalidateQueries({ queryKey: ['schools-teams'] });
        queryClient.invalidateQueries({ queryKey: ['sports-seasons-stages'] });
        queryClient.invalidateQueries({ queryKey: ['matches'] });
        queryClient.invalidateQueries({ queryKey: ['match_participants'] });
      }
      (mutationOptions?.onSuccess as any)?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete sport:', error);
      (mutationOptions?.onError as any)?.(error, id, context);
    },
    ...mutationOptions
  });
}

// Sport category operations
export function useSportCategoriesBySportId(
  sportId: number,
  queryOptions?: UseQueryOptions<ServiceResponse<SportCategory[]>, Error, SportCategory[]>
) {
  return useQuery({
    queryKey: sportCategoryKeys.bySport(sportId),
    queryFn: () => getSportCategoriesBySportId(sportId),
    enabled: !!sportId,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : `Failed to fetch sport categories for sport ${sportId}.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useSportCategoriesByDivision(
  division: 'men' | 'women' | 'mixed',
  queryOptions?: UseQueryOptions<ServiceResponse<SportCategory[]>, Error, SportCategory[]>
) {
  return useQuery({
    queryKey: sportCategoryKeys.byDivision(division),
    queryFn: () => getSportCategoriesByDivision(division),
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : `Failed to fetch sport categories for division ${division}.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useSportCategoriesByLevel(
  level: 'elementary' | 'high_school' | 'college',
  queryOptions?: UseQueryOptions<ServiceResponse<SportCategory[]>, Error, SportCategory[]>
) {
  return useQuery({
    queryKey: sportCategoryKeys.byLevel(level),
    queryFn: () => getSportCategoriesByLevel(level),
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : `Failed to fetch sport categories for level ${level}.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useSportCategoriesBySportAndDivision(
  sportId: number,
  division: 'men' | 'women' | 'mixed',
  queryOptions?: UseQueryOptions<ServiceResponse<SportCategory[]>, Error, SportCategory[]>
) {
  return useQuery({
    queryKey: sportCategoryKeys.bySportAndDivision(sportId, division),
    queryFn: () => getSportCategoriesBySportAndDivision(sportId, division),
    enabled: !!sportId && !!division,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : `Failed to fetch sport categories for sport ${sportId} and division ${division}.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useSportCategoriesBySportAndLevel(
  sportId: number,
  level: 'elementary' | 'high_school' | 'college',
  queryOptions?: UseQueryOptions<ServiceResponse<SportCategory[]>, Error, SportCategory[]>
) {
  return useQuery({
    queryKey: sportCategoryKeys.bySportAndLevel(sportId, level),
    queryFn: () => getSportCategoriesBySportAndLevel(sportId, level),
    enabled: !!sportId && !!level,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : `Failed to fetch sport categories for sport ${sportId} and level ${level}.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useCategoriesWithSportDetails(
  queryOptions?: UseQueryOptions<ServiceResponse<SportCategory[]>, Error, SportCategory[]>
) {
  return useQuery({
    queryKey: sportCategoryKeys.withDetails,
    queryFn: getCategoriesWithSportDetails,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : 'Failed to fetch sport categories with details.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useUniqueDivisions(
  queryOptions?: UseQueryOptions<ServiceResponse<string[]>, Error, string[]>
) {
  return useQuery({
    queryKey: sportCategoryKeys.uniqueDivisions,
    queryFn: getUniqueDivisions,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : 'Failed to fetch unique divisions.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useUniqueLevels(
  queryOptions?: UseQueryOptions<ServiceResponse<string[]>, Error, string[]>
) {
  return useQuery({
    queryKey: sportCategoryKeys.uniqueLevels,
    queryFn: getUniqueLevels,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : 'Failed to fetch unique levels.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

// Sport category mutations
export function useCreateSportCategory(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SportCategoryInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSportCategory,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: sportCategoryKeys.all });
        queryClient.invalidateQueries({ queryKey: sportCategoryKeys.bySport(variables.sport_id) });
      }
      (mutationOptions?.onSuccess as any)?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create sport category:', error);
      (mutationOptions?.onError as any)?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateSportCategory(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SportCategoryUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSportCategoryById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: sportCategoryKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: sportCategoryKeys.details(variables.id) });
        }
      }
      (mutationOptions?.onSuccess as any)?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update sport category:', error);
      (mutationOptions?.onError as any)?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteSportCategory(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, number>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSportCategoryById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: sportCategoryKeys.all });
        queryClient.invalidateQueries({ queryKey: sportCategoryKeys.details(id) });
        // CRITICAL: Invalidate related entities that depend on this sport category
        queryClient.invalidateQueries({ queryKey: ['schools-teams'] });
        queryClient.invalidateQueries({ queryKey: ['sports-seasons-stages'] });
        queryClient.invalidateQueries({ queryKey: ['matches'] });
        queryClient.invalidateQueries({ queryKey: ['match_participants'] });
      }
      (mutationOptions?.onSuccess as any)?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete sport category:', error);
      (mutationOptions?.onError as any)?.(error, id, context);
    },
    ...mutationOptions
  });
}

import { useEntityTable } from './use-entity-table';

// Table-specific hook for sports
export function useSportsTable() {
  const {
    data: sports,
    create: createSportMutation,
    update: updateSportMutation,
    delete: deleteSportMutation,
    ...rest
  } = useEntityTable<Sport, SportInsert, SportUpdate>({
    queryKey: ['sports'],
    fetchAction: (options) => 
        getPaginatedSports(options).then(res => ({
            ...res,
            data: res.data 
        })),
    createAction: createSport,
    updateAction: (data) => updateSportById(data),
    deleteAction: deleteSportById,
    entityName: 'Sport',
    defaultSort: { by: 'name', order: 'asc' }
  });

  return {
    sports,
    createSport: createSportMutation,
    updateSport: updateSportMutation,
    deleteSport: deleteSportMutation,
    ...rest
  };
}
