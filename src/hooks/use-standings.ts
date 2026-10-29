'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getStandings, updateStandingsCutoff, updateTeamStanding } from '@/actions/standings';
import {
  RankedTeamStanding,
  SavedStandingsCutoff,
  SavedTeamStanding,
  SeasonStandings,
  StandingsResult,
  StandingsSortKey
} from '@/lib/types/standings';
import { UpdateStandingsCutoffInput, UpdateTeamStandingInput } from '@/lib/validations/standings';
import { formatPointDiff } from '@/lib/utils/standings-calc';

const SAVE_FAILED = 'Could not save the record. Please try again.';
const CUTOFF_SAVE_FAILED = 'Could not save the cut-off date. Please try again.';

export const standingsKeys = {
  all: ['standings'] as const,
  season: (seasonId: number) => ['standings', 'season', seasonId] as const
};

export function useSeasonStandings(seasonId?: number) {
  return useQuery({
    queryKey: standingsKeys.season(seasonId ?? 0),
    queryFn: async (): Promise<SeasonStandings> => {
      const result = await getStandings(seasonId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!seasonId
  });
}

interface UpdateTeamStandingVariables {
  input: UpdateTeamStandingInput;
  teamName: string;
}

const patchTeam = (season: SeasonStandings, saved: SavedTeamStanding): SeasonStandings => ({
  ...season,
  categories: season.categories.map((category) => ({
    ...category,
    teams: category.teams.map((team) =>
      team.teamId === saved.teamId
        ? {
            ...team,
            starting: { wins: saved.wins, losses: saved.losses, pointDiff: saved.pointDiff },
            updatedAt: saved.updatedAt
          }
        : team
    )
  }))
});

/**
 * Saves one team's starting record. Always resolves with a StandingsResult so rows can show field
 * errors. On success the cached row gets the new updatedAt immediately, so a quick second save does
 * not look stale; totals and ranks refresh when the season refetches.
 */
export function useUpdateTeamStanding(seasonId: number) {
  const queryClient = useQueryClient();
  const key = standingsKeys.season(seasonId);

  return useMutation<StandingsResult<SavedTeamStanding>, Error, UpdateTeamStandingVariables>({
    mutationFn: async ({ input }) => {
      try {
        return await updateTeamStanding(input);
      } catch {
        return { success: false, code: 'SERVER', error: SAVE_FAILED };
      }
    },
    onSuccess: (result, { teamName }) => {
      if (result.success) {
        queryClient.setQueryData<SeasonStandings>(key, (current) => current && patchTeam(current, result.data));
        const { wins, losses, pointDiff } = result.data;
        toast.success(`${teamName} starting record saved: ${wins}-${losses}, ${formatPointDiff(pointDiff)}`);
        queryClient.invalidateQueries({ queryKey: key });
        return;
      }

      if (result.code === 'VALIDATION') return;

      toast.error(result.error);
      if (result.code === 'CONFLICT' || result.code === 'NOT_FOUND') {
        queryClient.invalidateQueries({ queryKey: key });
      }
    }
  });
}

/** Sets or clears a category's cut-off date. Always resolves with a StandingsResult. */
export function useUpdateStandingsCutoff(seasonId: number) {
  const queryClient = useQueryClient();

  return useMutation<StandingsResult<SavedStandingsCutoff>, Error, UpdateStandingsCutoffInput>({
    mutationFn: async (input) => {
      try {
        return await updateStandingsCutoff(input);
      } catch {
        return { success: false, code: 'SERVER', error: CUTOFF_SAVE_FAILED };
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.data.countedThrough ? 'Cut-off saved' : 'Cut-off cleared');
        queryClient.invalidateQueries({ queryKey: standingsKeys.season(seasonId) });
        return;
      }

      if (result.code !== 'VALIDATION') toast.error(result.error);
    }
  });
}

const SORTERS: Record<StandingsSortKey, ((a: RankedTeamStanding, b: RankedTeamStanding) => number) | null> = {
  rank: null, // the service already returns rows in rank order
  school: (a, b) => a.school.name.localeCompare(b.school.name) || a.teamName.localeCompare(b.teamName),
  wins: (a, b) => b.wins - a.wins,
  losses: (a, b) => b.losses - a.losses
};

/** Admin table view-model: category selection, search and display sort. Ranks come from the server. */
export function useStandingsTable(seasonId?: number) {
  const query = useSeasonStandings(seasonId);
  const [requestedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<StandingsSortKey>('rank');

  const categories = useMemo(() => query.data?.categories ?? [], [query.data]);

  const selectedCategoryId = categories.some((c) => c.category.id === requestedCategoryId)
    ? requestedCategoryId
    : (categories[0]?.category.id ?? null);

  const rows = useMemo(() => {
    const teams = categories.find((c) => c.category.id === selectedCategoryId)?.teams ?? [];
    const needle = search.trim().toLowerCase();
    const filtered = needle
      ? teams.filter((t) =>
          [t.school.name, t.school.abbreviation, t.teamName].some((value) => value.toLowerCase().includes(needle))
        )
      : teams;
    const sorter = SORTERS[sortKey];
    return sorter ? [...filtered].sort(sorter) : filtered;
  }, [categories, selectedCategoryId, search, sortKey]);

  return {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    search,
    setSearch,
    sortKey,
    setSortKey,
    rows,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}
