import { useQuery, useMutation, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { getSportStatMappingsAction, updateSportStatMappingsAction } from '@/actions/statistics';
import { SportStatMapping } from '@/db/schema/sport-stat-mappings';
import { ServiceResponse } from '@/lib/types/base';

export const statisticsKeys = {
  all: ['statistics'] as const,
  mappingsBySport: (sportId: number) => [...statisticsKeys.all, 'mappings', sportId] as const,
};

export function useSportStatMappings(
  sportId: number,
  queryOptions?: UseQueryOptions<ServiceResponse<SportStatMapping[]>, Error, SportStatMapping[]>
) {
  return useQuery({
    queryKey: statisticsKeys.mappingsBySport(sportId),
    queryFn: () => getSportStatMappingsAction(sportId),
    enabled: !!sportId,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : 'Failed to fetch stat mappings.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useUpdateSportStatMappings(
  mutationOptions?: UseMutationOptions<
    ServiceResponse<SportStatMapping[]>, 
    Error, 
    { sportId: number; mappings: Array<{ stat_column: string; label: string }> }
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sportId, mappings }) => updateSportStatMappingsAction(sportId, mappings),
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: statisticsKeys.mappingsBySport(variables.sportId) });
      }
      (mutationOptions?.onSuccess as any)?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update stat mappings:', error);
      (mutationOptions?.onError as any)?.(error, variables, context);
    },
    ...mutationOptions
  });
}
