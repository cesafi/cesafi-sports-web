import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getSchoolsTeamsBySchoolId,
  getSchoolsTeamsBySeasonId,
  getSchoolsTeamsBySportCategoryId,
  getSchoolsTeamsBySchoolAndSeason,
  getSchoolsTeamsBySchoolAndSportCategory,
  getTeamsWithFullDetails,
  getActiveTeamsBySchool,
  createSchoolsTeam,
  updateSchoolsTeamById,
  deleteSchoolsTeamById
} from '@/actions/schools-teams';

import {
  SchoolsTeamInsert,
  SchoolsTeamUpdate,
  SchoolsTeam,
  SchoolsTeamWithSportDetails
} from '@/lib/types/schools-teams';

import { ServiceResponse, FilterValue, PaginationOptions } from '@/lib/types/base';
import { useTable } from './use-table';
import { TableFilters } from '@/lib/types/table';
import { toast } from 'sonner';

// Import related query keys for invalidation
import { schoolKeys } from './use-schools';
import { seasonKeys } from './use-seasons';
import { sportKeys } from './use-sports';

export const schoolsTeamKeys = {
  all: ['schools-teams'] as const,
  bySchool: (schoolId: string) => [...schoolsTeamKeys.all, 'bySchool', schoolId] as const,
  bySeason: (seasonId: number) => [...schoolsTeamKeys.all, 'bySeason', seasonId] as const,
  bySportCategory: (sportCategoryId: number) => [...schoolsTeamKeys.all, 'bySportCategory', sportCategoryId] as const,
  bySchoolAndSeason: (schoolId: string, seasonId: number) => [...schoolsTeamKeys.all, 'bySchoolAndSeason', schoolId, seasonId] as const,
  bySchoolAndSportCategory: (schoolId: string, sportCategoryId: number) => [...schoolsTeamKeys.all, 'bySchoolAndSportCategory', schoolId, sportCategoryId] as const,
  withFullDetails: (schoolId: string) => [...schoolsTeamKeys.all, 'withFullDetails', schoolId] as const,
  activeBySchool: (schoolId: string) => [...schoolsTeamKeys.all, 'activeBySchool', schoolId] as const,
  details: (id: string) => [...schoolsTeamKeys.all, id] as const
};

// Context-based fetching hooks
export function useSchoolsTeamsBySchoolId(
  schoolId: string,
  queryOptions?: UseQueryOptions<ServiceResponse<SchoolsTeam[]>, Error, SchoolsTeam[]>
) {
  return useQuery({
    queryKey: schoolsTeamKeys.bySchool(schoolId),
    queryFn: () => getSchoolsTeamsBySchoolId(schoolId),
    enabled: !!schoolId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch schools teams by school ID.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useSchoolsTeamsBySeasonId(
  seasonId: number,
  queryOptions?: UseQueryOptions<ServiceResponse<SchoolsTeam[]>, Error, SchoolsTeam[]>
) {
  return useQuery({
    queryKey: schoolsTeamKeys.bySeason(seasonId),
    queryFn: () => getSchoolsTeamsBySeasonId(seasonId),
    enabled: !!seasonId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch schools teams by season ID.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useSchoolsTeamsBySportCategoryId(
  sportCategoryId: number,
  queryOptions?: UseQueryOptions<ServiceResponse<SchoolsTeam[]>, Error, SchoolsTeam[]>
) {
  return useQuery({
    queryKey: schoolsTeamKeys.bySportCategory(sportCategoryId),
    queryFn: () => getSchoolsTeamsBySportCategoryId(sportCategoryId),
    enabled: !!sportCategoryId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch schools teams by sport category ID.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useSchoolsTeamsBySchoolAndSeason(
  schoolId: string,
  seasonId: number,
  queryOptions?: UseQueryOptions<ServiceResponse<SchoolsTeam[]>, Error, SchoolsTeam[]>
) {
  return useQuery({
    queryKey: schoolsTeamKeys.bySchoolAndSeason(schoolId, seasonId),
    queryFn: () => getSchoolsTeamsBySchoolAndSeason(schoolId, seasonId),
    enabled: !!schoolId && !!seasonId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch schools teams by school and season.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useSchoolsTeamsBySchoolAndSportCategory(
  schoolId: string,
  sportCategoryId: number,
  queryOptions?: UseQueryOptions<ServiceResponse<SchoolsTeam[]>, Error, SchoolsTeam[]>
) {
  return useQuery({
    queryKey: schoolsTeamKeys.bySchoolAndSportCategory(schoolId, sportCategoryId),
    queryFn: () => getSchoolsTeamsBySchoolAndSportCategory(schoolId, sportCategoryId),
    enabled: !!schoolId && !!sportCategoryId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch schools teams by school and sport category.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useTeamsWithFullDetails(
  schoolId: string,
  queryOptions?: UseQueryOptions<ServiceResponse<SchoolsTeam[]>, Error, SchoolsTeam[]>
) {
  return useQuery({
    queryKey: schoolsTeamKeys.withFullDetails(schoolId),
    queryFn: () => getTeamsWithFullDetails(schoolId),
    enabled: !!schoolId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch teams with full details.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useActiveTeamsBySchool(
  schoolId: string,
  queryOptions?: UseQueryOptions<ServiceResponse<SchoolsTeam[]>, Error, SchoolsTeam[]>
) {
  return useQuery({
    queryKey: schoolsTeamKeys.activeBySchool(schoolId),
    queryFn: () => getActiveTeamsBySchool(schoolId),
    enabled: !!schoolId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch active teams by school.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

// Mutation hooks
export function useCreateSchoolsTeam(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SchoolsTeamInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSchoolsTeam,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.all });
        if (variables.school_id) {
          queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.bySchool(variables.school_id) });
        }
        if (variables.season_id) {
          queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.bySeason(variables.season_id) });
        }
        if (variables.sport_category_id) {
          queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.bySportCategory(variables.sport_category_id) });
        }
        // Also invalidate related entity queries
        queryClient.invalidateQueries({ queryKey: schoolKeys.all });
        queryClient.invalidateQueries({ queryKey: seasonKeys.all });
        queryClient.invalidateQueries({ queryKey: sportKeys.all });
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create schools team:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateSchoolsTeam(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SchoolsTeamUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSchoolsTeamById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.details(variables.id) });
        }
        if (variables.school_id) {
          queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.bySchool(variables.school_id) });
        }
        if (variables.season_id) {
          queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.bySeason(variables.season_id) });
        }
        if (variables.sport_category_id) {
          queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.bySportCategory(variables.sport_category_id) });
        }
        // Also invalidate related entity queries
        queryClient.invalidateQueries({ queryKey: schoolKeys.all });
        queryClient.invalidateQueries({ queryKey: seasonKeys.all });
        queryClient.invalidateQueries({ queryKey: sportKeys.all });
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update schools team:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteSchoolsTeam(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSchoolsTeamById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.all });
        queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.details(id) });
        // Also invalidate related entity queries
        queryClient.invalidateQueries({ queryKey: schoolKeys.all });
        queryClient.invalidateQueries({ queryKey: seasonKeys.all });
        queryClient.invalidateQueries({ queryKey: sportKeys.all });
        // CRITICAL: Invalidate match participants since this team might be in matches
        queryClient.invalidateQueries({ queryKey: ['match_participants'] });
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
      mutationOptions?.onSuccess?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete schools team:', error);
      mutationOptions?.onError?.(error, id, context);
    },
    ...mutationOptions
  });
}

// Table-specific hook for schools teams management
export function useSchoolsTeamsTable(selectedSchoolId: string | null) {
  const {
    tableState,
    setPage,
    setPageSize,
    setSortBy,
    setSearch,
    setFilters,
    resetFilters,
    paginationOptions
  } = useTable<SchoolsTeamWithSportDetails>({
    initialPage: 1,
    initialPageSize: 10,
    initialSortBy: 'created_at',
    initialSortOrder: 'desc',
    pageSizeOptions: [5, 10, 25, 50, 100]
  });

  // Fetch teams for selected school
  const {
    data: teams,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['schools-teams', 'bySchool', selectedSchoolId, paginationOptions],
    queryFn: () => getSchoolsTeamsBySchoolId(selectedSchoolId!),
    enabled: !!selectedSchoolId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch teams for school');
      }
      return data.data;
    }
  });

  // Show table body loading when fetching (for sorting, searching, filtering)
  // but not on initial load
  const tableBodyLoading = isFetching && !isLoading;

  const queryClient = useQueryClient();

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: createSchoolsTeam,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Team created successfully');
        if (selectedSchoolId) {
          queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.bySchool(selectedSchoolId) });
        }
      } else {
        toast.error(result.error || 'Failed to create team');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: (data: SchoolsTeamUpdate) => updateSchoolsTeamById(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Team updated successfully');
        if (selectedSchoolId) {
          queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.bySchool(selectedSchoolId) });
        }
      } else {
        toast.error(result.error || 'Failed to update team');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: deleteSchoolsTeamById,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Team deleted successfully');
        if (selectedSchoolId) {
          queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.bySchool(selectedSchoolId) });
        }
      } else {
        toast.error(result.error || 'Failed to delete team');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Handle search with debouncing
  const handleSearch = (search: string) => {
    setSearch(search);
  };

  // Handle filters
  const handleFilters = (filters: TableFilters) => {
    setFilters(filters);
  };

  // Handle sorting
  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSortBy(sortBy, sortOrder);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
  };

  return {
    // Data
    teams: teams || [],
    totalCount: teams?.length || 0,
    pageCount: Math.ceil((teams?.length || 0) / tableState.pageSize),
    currentPage: tableState.page,
    pageSize: tableState.pageSize,
    loading: isLoading,
    tableBodyLoading,
    error: error?.message || null,

    // Mutations
    createTeam: createTeamMutation.mutate,
    updateTeam: updateTeamMutation.mutate,
    deleteTeam: deleteTeamMutation.mutate,

    // Loading states
    isCreating: createTeamMutation.isPending,
    isUpdating: updateTeamMutation.isPending,
    isDeleting: deleteTeamMutation.isPending,

    // Actions
    refetch,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    onSortChange: handleSort,
    onSearchChange: handleSearch,
    onFiltersChange: handleFilters,
    resetFilters
  };
}
