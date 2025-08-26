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
  SchoolsTeam
} from '@/lib/types/schools-teams';

import { ServiceResponse } from '@/lib/types/base';

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
    enabled: !!(schoolId && seasonId),
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
    enabled: !!(schoolId && sportCategoryId),
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

export function useCreateSchoolsTeam(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SchoolsTeamInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSchoolsTeam,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        // Invalidate schools teams queries
        queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.all });

        // Invalidate related entity queries since teams are relationships
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
        // Invalidate schools teams queries
        queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.details(variables.id) });
        }

        // Invalidate related entity queries since teams are relationships
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
        // Invalidate schools teams queries
        queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.all });
        queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.details(id) });

        // Invalidate related entity queries since teams are relationships
        queryClient.invalidateQueries({ queryKey: schoolKeys.all });
        queryClient.invalidateQueries({ queryKey: seasonKeys.all });
        queryClient.invalidateQueries({ queryKey: sportKeys.all });
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
