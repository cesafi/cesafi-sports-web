import type { CategoryStandings } from '@/lib/types/standings';

interface SeasonRange {
  id: number;
  start_at: string;
  end_at: string;
}

/** The season whose dates contain `now`, else the one that started most recently. */
export function pickDefaultSeasonId(seasons: SeasonRange[], now: Date): number | null {
  const time = now.getTime();
  const current = seasons.find(
    (s) => new Date(s.start_at).getTime() <= time && time <= new Date(s.end_at).getTime()
  );
  if (current) return current.id;

  const latest = [...seasons].sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())[0];
  return latest?.id ?? null;
}

/** A requested season is honoured only if it exists; otherwise the default applies. */
export function resolveSeasonId(seasons: SeasonRange[], requested: number | undefined, now: Date): number | null {
  if (requested !== undefined && seasons.some((s) => s.id === requested)) return requested;
  return pickDefaultSeasonId(seasons, now);
}

/** A requested category is honoured only if it has teams this season; otherwise All (null). */
export function resolveCategoryId(categories: CategoryStandings[], requested: number | undefined): number | null {
  if (requested !== undefined && categories.some((c) => c.category.id === requested)) return requested;
  return null;
}
