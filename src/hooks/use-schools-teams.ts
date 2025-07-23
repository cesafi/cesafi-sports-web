import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedSchoolsTeams,
  getAllSchoolsTeams,
  getSchoolsTeamById,
  createSchoolsTeam,
  updateSchoolsTeamById,
  deleteSchoolsTeamById
} from '@/actions/schools-teams';

import {
  SchoolsTeamInsert,
  SchoolsTeamUpdate,
  SchoolsTeamPaginationOptions,
  SchoolsTeam
} from '@/lib/types/schools-teams';

import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';

// Import related query keys for invalidation
import { schoolKeys } from './use-schools';
import { seasonKeys } from './use-seasons';
import { sportKeys } from './use-sports';

export const schoolsTeamKeys = {
  all: ['schools-teams'] as const,
  paginated: (options: SchoolsTeamPaginationOptions) =>
    [...schoolsTeamKeys.all, 'paginated', options] as const,
  details: (id: string) => [...schoolsTeamKeys.all, id] as const
};

export function usePaginatedSchoolsTeams(
  options: SchoolsTeamPaginationOptions,
  queryOptions?: UseQueryOptions<
    ServiceResponse<PaginatedResponse<SchoolsTeam>>,
    Error,
    PaginatedResponse<SchoolsTeam>
  >
) {
  return useQuery({
    queryKey: schoolsTeamKeys.paginated(options),
    queryFn: () => getPaginatedSchoolsTeams(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch paginated schools teams.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllSchoolsTeams(
  queryOptions?: UseQueryOptions<ServiceResponse<SchoolsTeam[]>, Error, SchoolsTeam[]>
) {
  return useQuery({
    queryKey: schoolsTeamKeys.all,
    queryFn: getAllSchoolsTeams,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch all schools teams.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useSchoolsTeamById(
  id: string,
  queryOptions?: UseQueryOptions<ServiceResponse<SchoolsTeam>, Error, SchoolsTeam>
) {
  return useQuery({
    queryKey: schoolsTeamKeys.details(id),
    queryFn: () => getSchoolsTeamById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Schools team with ID ${id} not found.`);
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
