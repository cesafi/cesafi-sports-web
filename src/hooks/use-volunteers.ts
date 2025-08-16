import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedVolunteers,
  getAllVolunteers,
  getVolunteerById,
  getVolunteersByDepartment,
  getVolunteerDepartments,
  createVolunteer,
  updateVolunteerById,
  deleteVolunteerById
} from '@/actions/volunteer';

import {
  VolunteerInsert,
  VolunteerUpdate,
  VolunteersPaginationOptions,
  Volunteer
} from '@/lib/types/volunteers';

import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';

export const volunteerKeys = {
  all: ['volunteers'] as const,
  paginated: (options: VolunteersPaginationOptions) =>
    [...volunteerKeys.all, 'paginated', options] as const,
  details: (id: string) => [...volunteerKeys.all, id] as const,
  byDepartment: (department: string) => [...volunteerKeys.all, 'department', department] as const,
  departments: () => [...volunteerKeys.all, 'departments'] as const
};

export function usePaginatedVolunteers(
  options: VolunteersPaginationOptions,
  queryOptions?: UseQueryOptions<
    ServiceResponse<PaginatedResponse<Volunteer>>,
    Error,
    PaginatedResponse<Volunteer>
  >
) {
  return useQuery({
    queryKey: volunteerKeys.paginated(options),
    queryFn: () => getPaginatedVolunteers(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch paginated volunteers.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllVolunteers(
  queryOptions?: UseQueryOptions<ServiceResponse<Volunteer[]>, Error, Volunteer[]>
) {
  return useQuery({
    queryKey: volunteerKeys.all,
    queryFn: getAllVolunteers,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch all volunteers.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useVolunteerById(
  id: string,
  queryOptions?: UseQueryOptions<ServiceResponse<Volunteer>, Error, Volunteer>
) {
  return useQuery({
    queryKey: volunteerKeys.details(id),
    queryFn: () => getVolunteerById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Volunteer with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useVolunteersByDepartment(
  department: string,
  queryOptions?: UseQueryOptions<ServiceResponse<Volunteer[]>, Error, Volunteer[]>
) {
  return useQuery({
    queryKey: volunteerKeys.byDepartment(department),
    queryFn: () => getVolunteersByDepartment(department),
    enabled: !!department,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Failed to fetch volunteers for department: ${department}.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useVolunteerDepartments(
  queryOptions?: UseQueryOptions<ServiceResponse<string[]>, Error, string[]>
) {
  return useQuery({
    queryKey: volunteerKeys.departments(),
    queryFn: getVolunteerDepartments,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch volunteer departments.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useCreateVolunteer(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, VolunteerInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVolunteer,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: volunteerKeys.all });
        queryClient.invalidateQueries({ queryKey: volunteerKeys.departments() });
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create volunteer:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateVolunteer(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, VolunteerUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVolunteerById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: volunteerKeys.all });
        queryClient.invalidateQueries({ queryKey: volunteerKeys.departments() });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: volunteerKeys.details(variables.id) });
        }
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update volunteer:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteVolunteer(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVolunteerById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: volunteerKeys.all });
        queryClient.invalidateQueries({ queryKey: volunteerKeys.departments() });
        queryClient.invalidateQueries({ queryKey: volunteerKeys.details(id) });
      }
      mutationOptions?.onSuccess?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete volunteer:', error);
      mutationOptions?.onError?.(error, id, context);
    },
    ...mutationOptions
  });
}
