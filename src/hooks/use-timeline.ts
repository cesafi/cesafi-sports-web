import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedTimeline,
  getAllTimeline,
  getTimelineById,
  getTimelineHighlights,
  getTimelineByCategory,
  createTimeline,
  updateTimelineById,
  deleteTimelineById,
  reorderTimeline
} from '@/actions/timeline';

import { 
  TimelineInsert, 
  TimelineUpdate, 
  TimelinePaginationOptions, 
  Timeline 
} from '@/lib/types/timeline';
import { ServiceResponse } from '@/lib/types/base';

// Query key factory
export const timelineKeys = {
  all: ['timeline'] as const,
  paginated: (options: TimelinePaginationOptions) =>
    [...timelineKeys.all, 'paginated', options] as const,
  details: (id: number) => [...timelineKeys.all, id] as const,
  highlights: () => [...timelineKeys.all, 'highlights'] as const,
  byCategory: (category: string) => [...timelineKeys.all, 'category', category] as const
};

// Data fetching hooks
export function usePaginatedTimeline(
  options: TimelinePaginationOptions,
  queryOptions?: UseQueryOptions<
    {
      success: boolean;
      error?: string;
      data?: { data: Timeline[]; totalCount: number; pageCount: number; currentPage: number };
    },
    Error,
    { data: Timeline[]; totalCount: number; pageCount: number; currentPage: number }
  >
) {
  return useQuery({
    queryKey: timelineKeys.paginated(options),
    queryFn: () => getPaginatedTimeline(options),
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch paginated timeline.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllTimeline(
  queryOptions?: UseQueryOptions<ServiceResponse<Timeline[]>, Error, Timeline[]>
) {
  return useQuery({
    queryKey: timelineKeys.all,
    queryFn: getAllTimeline,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : 'Failed to fetch all timeline.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useTimelineById(
  id: number,
  queryOptions?: UseQueryOptions<ServiceResponse<Timeline>, Error, Timeline>
) {
  return useQuery({
    queryKey: timelineKeys.details(id),
    queryFn: () => getTimelineById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : `Timeline with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useTimelineHighlights(
  queryOptions?: UseQueryOptions<ServiceResponse<Timeline[]>, Error, Timeline[]>
) {
  return useQuery({
    queryKey: timelineKeys.highlights(),
    queryFn: getTimelineHighlights,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : 'Failed to fetch timeline highlights.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useTimelineByCategory(
  category: string,
  queryOptions?: UseQueryOptions<ServiceResponse<Timeline[]>, Error, Timeline[]>
) {
  return useQuery({
    queryKey: timelineKeys.byCategory(category),
    queryFn: () => getTimelineByCategory(category),
    enabled: !!category,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : `Failed to fetch timeline for category ${category}.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

// Mutation hooks with cache invalidation
export function useCreateTimeline(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, TimelineInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTimeline,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: timelineKeys.all });
      }
      (mutationOptions?.onSuccess as any)?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create timeline:', error);
      (mutationOptions?.onError as any)?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateTimeline(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, TimelineUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTimelineById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: timelineKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: timelineKeys.details(variables.id) });
        }
      }
      (mutationOptions?.onSuccess as any)?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update timeline:', error);
      (mutationOptions?.onError as any)?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteTimeline(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, number>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTimelineById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: timelineKeys.all });
        queryClient.invalidateQueries({ queryKey: timelineKeys.details(id) });
      }
      (mutationOptions?.onSuccess as any)?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete timeline:', error);
      (mutationOptions?.onError as any)?.(error, id, context);
    },
    ...mutationOptions
  });
}

export function useReorderTimeline(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, number[]>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderTimeline,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: timelineKeys.all });
      }
      (mutationOptions?.onSuccess as any)?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to reorder timeline:', error);
      (mutationOptions?.onError as any)?.(error, variables, context);
    },
    ...mutationOptions
  });
}
