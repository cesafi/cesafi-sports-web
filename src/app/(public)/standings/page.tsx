import type { Metadata } from 'next';
import { getAllSeasons } from '@/actions/seasons';
import { getStandings } from '@/actions/standings';
import { StandingsView } from '@/components/standings/standings-view';
import { standingsSearchParamsSchema } from '@/lib/validations/standings';
import { resolveCategoryId, resolveSeasonId } from '@/lib/utils/standings-selection';

export const metadata: Metadata = {
  title: 'League Standings | CESAFI Sports League',
  description: 'Team standings for the CESAFI Sports League: wins, losses and rankings for every category.'
};

interface StandingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StandingsPage({ searchParams }: StandingsPageProps) {
  const params = standingsSearchParamsSchema.parse(await searchParams);

  const seasonsResult = await getAllSeasons();
  const seasons = seasonsResult.success ? seasonsResult.data : [];
  const seasonId = resolveSeasonId(seasons, params.season, new Date());

  const standingsResult = seasonId === null ? null : await getStandings(seasonId);
  const standings = standingsResult?.success ? standingsResult.data : null;
  const loadFailed = !seasonsResult.success || (standingsResult !== null && !standingsResult.success);
  const categoryId = standings ? resolveCategoryId(standings.categories, params.category) : null;

  const seasonIds = [...seasons]
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())
    .map((season) => season.id);

  return (
    <StandingsView
      seasonIds={seasonIds}
      seasonId={seasonId}
      standings={standings}
      categoryId={categoryId}
      loadFailed={loadFailed}
    />
  );
}
