import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import {
  getStandings,
  getStandingsNavigation,
  getGroupStageStandings,
  getBracketStandings,
  getAvailableSeasons,
  getAvailableSports,
  getAvailableCategories
} from '@/actions/standings';

import {
  StandingsResponse,
  StandingsNavigation,
  GroupStageStandings,
  BracketStandings,
  StandingsFilters
} from '@/lib/types/standings';

import { ServiceResponse } from '@/lib/types/base';

// Query key factory for standings
export const standingsKeys = {
  all: ['standings'] as const,
  standings: (filters: StandingsFilters) => [...standingsKeys.all, 'data', filters] as const,
  navigation: (filters: StandingsFilters) => [...standingsKeys.all, 'navigation', filters] as const,
  groupStage: (stageId: number) => [...standingsKeys.all, 'group-stage', stageId] as const,
  bracket: (stageId: number) => [...standingsKeys.all, 'bracket', stageId] as const,
  seasons: () => [...standingsKeys.all, 'seasons'] as const,
  sports: (seasonId: number) => [...standingsKeys.all, 'sports', seasonId] as const,
  categories: (seasonId: number, sportId: number) =>
    [...standingsKeys.all, 'categories', seasonId, sportId] as const
};

/**
 * Hook to get complete standings data with navigation and standings
 */
export function useStandings(
  filters: StandingsFilters,
  queryOptions?: UseQueryOptions<ServiceResponse<StandingsResponse>, Error, StandingsResponse>
) {
  return useQuery({
    queryKey: standingsKeys.standings(filters),
    queryFn: () => getStandings(filters),
    enabled: !!(filters.season_id && filters.sport_id && filters.sport_category_id),
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch standings data.');
      }
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - standings change relatively frequently
    ...queryOptions
  });
}

/**
 * Hook to get standings navigation structure
 */
export function useStandingsNavigation(
  filters: StandingsFilters,
  queryOptions?: UseQueryOptions<ServiceResponse<StandingsNavigation>, Error, StandingsNavigation>
) {
  return useQuery({
    queryKey: standingsKeys.navigation(filters),
    queryFn: () => getStandingsNavigation(filters),
    enabled: !!(filters.season_id && filters.sport_id && filters.sport_category_id),
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch standings navigation.');
      }
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - navigation changes less frequently
    ...queryOptions
  });
}

/**
 * Hook to get group stage standings
 */
export function useGroupStageStandings(
  stageId: number,
  queryOptions?: UseQueryOptions<ServiceResponse<GroupStageStandings>, Error, GroupStageStandings>
) {
  return useQuery({
    queryKey: standingsKeys.groupStage(stageId),
    queryFn: () => getGroupStageStandings(stageId),
    enabled: !!stageId,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch group stage standings.');
      }
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...queryOptions
  });
}

/**
 * Hook to get bracket/tournament standings
 */
export function useBracketStandings(
  stageId: number,
  queryOptions?: UseQueryOptions<ServiceResponse<BracketStandings>, Error, BracketStandings>
) {
  return useQuery({
    queryKey: standingsKeys.bracket(stageId),
    queryFn: () => getBracketStandings(stageId),
    enabled: !!stageId,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch bracket standings.');
      }
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...queryOptions
  });
}

/**
 * Hook to get available seasons
 */
export function useAvailableSeasons(
  queryOptions?: UseQueryOptions<
    ServiceResponse<Array<{ id: number; name: string; start_at: string; end_at: string }>>,
    Error,
    Array<{ id: number; name: string; start_at: string; end_at: string }>
  >
) {
  return useQuery({
    queryKey: standingsKeys.seasons(),
    queryFn: getAvailableSeasons,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch available seasons.');
      }
      return data.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - seasons don't change often
    ...queryOptions
  });
}

/**
 * Hook to get available sports for a season
 */
export function useAvailableSports(
  seasonId: number,
  queryOptions?: UseQueryOptions<
    ServiceResponse<Array<{ id: number; name: string }>>,
    Error,
    Array<{ id: number; name: string }>
  >
) {
  return useQuery({
    queryKey: standingsKeys.sports(seasonId),
    queryFn: () => getAvailableSports(seasonId),
    enabled: !!seasonId,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch available sports.');
      }
      return data.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...queryOptions
  });
}

/**
 * Hook to get available categories for a season and sport
 */
export function useAvailableCategories(
  seasonId: number,
  sportId: number,
  queryOptions?: UseQueryOptions<
    ServiceResponse<Array<{ id: number; division: string; levels: string; display_name: string }>>,
    Error,
    Array<{ id: number; division: string; levels: string; display_name: string }>
  >
) {
  return useQuery({
    queryKey: standingsKeys.categories(seasonId, sportId),
    queryFn: () => getAvailableCategories(seasonId, sportId),
    enabled: !!(seasonId && sportId),
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch available categories.');
      }
      return data.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...queryOptions
  });
}

/**
 * Helper hook to get current standings filters from URL params
 */
export function useStandingsFilters(searchParams: URLSearchParams): StandingsFilters {
  return {
    season_id: searchParams.get('season') ? parseInt(searchParams.get('season')!) : undefined,
    sport_id: searchParams.get('sport') ? parseInt(searchParams.get('sport')!) : undefined,
    sport_category_id: searchParams.get('category')
      ? parseInt(searchParams.get('category')!)
      : undefined,
    stage_id: searchParams.get('stage') ? parseInt(searchParams.get('stage')!) : undefined
  };
}

/**
 * Helper hook to build URL search params from standings filters
 */
export function useStandingsSearchParams(filters: StandingsFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.season_id) params.set('season', filters.season_id.toString());
  if (filters.sport_id) params.set('sport', filters.sport_id.toString());
  if (filters.sport_category_id) params.set('category', filters.sport_category_id.toString());
  if (filters.stage_id) params.set('stage', filters.stage_id.toString());

  return params;
}
