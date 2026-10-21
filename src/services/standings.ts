import { BaseService } from './base';
import { formatCategoryName } from '@/lib/utils/sports';
import {
  CategoryStandings,
  RankedTeamStanding,
  SavedTeamStanding,
  SeasonStandings,
  StandingsErrorCode,
  StandingsResult
} from '@/lib/types/standings';
import { UpdateTeamStandingInput } from '@/lib/validations/standings';

interface RankableStanding {
  wins: number;
  losses: number;
  teamName: string;
  school: { name: string };
}

interface StandingRecordRow {
  wins: number;
  losses: number;
  updated_at: string;
}

interface SeasonTeamRow {
  id: string;
  name: string;
  school: { id: string; name: string; abbreviation: string; logo_url: string | null };
  sports_categories: { id: number; division: string; levels: string; sports: { name: string } };
  team_standings: StandingRecordRow | StandingRecordRow[] | null;
}

const SEASON_TEAMS_SELECT = `
  id,
  name,
  school:schools!inner(id, name, abbreviation, logo_url),
  sports_categories!sport_category_id!inner(id, division, levels, sports!inner(name)),
  team_standings(wins, losses, updated_at)
`;

const isBetter = (a: RankableStanding, b: RankableStanding) =>
  a.wins > b.wins || (a.wins === b.wins && a.losses < b.losses);

/**
 * Ranks one category: most wins first, then fewest losses. Teams share a rank only when wins
 * and losses are both equal (competition ranking: 1, 1, 3). Full ties are listed by school, then
 * team name. When nobody has played, ranks are null.
 */
export function rankStandings<T extends RankableStanding>(
  rows: T[]
): { teams: (T & { rank: number | null })[]; hasResults: boolean } {
  const hasResults = rows.some((r) => r.wins + r.losses > 0);
  const sorted = [...rows].sort(
    (a, b) =>
      b.wins - a.wins ||
      a.losses - b.losses ||
      a.school.name.localeCompare(b.school.name) ||
      a.teamName.localeCompare(b.teamName)
  );

  const teams = sorted.map((team) => ({
    ...team,
    rank: hasResults ? 1 + rows.filter((other) => isBetter(other, team)).length : null
  }));

  return { teams, hasResults };
}

const SAVE_ERRORS: Record<Exclude<StandingsErrorCode, 'UNAUTHENTICATED' | 'FORBIDDEN'>, string> = {
  CONFLICT: "Someone else updated this team's record. The latest numbers have been loaded.",
  NOT_FOUND: 'This team no longer exists.',
  VALIDATION: 'Please fix the highlighted fields.',
  SERVER: 'Could not save the record. Please try again.'
};

// Postgres error codes the save path can explain to the user
const PG_ERROR_CODES: Record<string, keyof typeof SAVE_ERRORS> = {
  '23505': 'CONFLICT', // unique: someone else created the record first
  '23503': 'NOT_FOUND', // foreign key: the team was deleted
  '23514': 'VALIDATION' // check: negative wins/losses
};

const saveFailure = (code: keyof typeof SAVE_ERRORS): StandingsResult<never> => ({
  success: false,
  code,
  error: SAVE_ERRORS[code]
});

const toSaved = (row: StandingRecordRow & { team_id: string }): SavedTeamStanding => ({
  teamId: row.team_id,
  wins: row.wins,
  losses: row.losses,
  updatedAt: row.updated_at
});

const SAVED_COLUMNS = 'team_id, wins, losses, updated_at';

// A one-to-one embed may arrive as an object, an array or null depending on PostgREST's detection.
const firstRecord = (embedded: SeasonTeamRow['team_standings']): StandingRecordRow | null =>
  Array.isArray(embedded) ? (embedded[0] ?? null) : (embedded ?? null);

export class StandingsService extends BaseService {
  static async getSeasonStandings(seasonId: number): Promise<StandingsResult<SeasonStandings>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('schools_teams')
        .select(SEASON_TEAMS_SELECT)
        .eq('season_id', seasonId)
        .eq('is_active', true);

      if (error) throw error;

      const byCategory = new Map<number, { category: CategoryStandings['category']; teams: Omit<RankedTeamStanding, 'rank'>[] }>();

      for (const row of (data ?? []) as unknown as SeasonTeamRow[]) {
        const cat = row.sports_categories;
        if (!byCategory.has(cat.id)) {
          byCategory.set(cat.id, {
            category: {
              id: cat.id,
              sportName: cat.sports.name,
              division: cat.division,
              levels: cat.levels,
              name: `${cat.sports.name} · ${formatCategoryName(cat.division, cat.levels)}`
            },
            teams: []
          });
        }

        const record = firstRecord(row.team_standings);
        byCategory.get(cat.id)!.teams.push({
          teamId: row.id,
          teamName: row.name,
          school: {
            id: row.school.id,
            name: row.school.name,
            abbreviation: row.school.abbreviation,
            logoUrl: row.school.logo_url || null
          },
          wins: record?.wins ?? 0,
          losses: record?.losses ?? 0,
          updatedAt: record?.updated_at ?? null
        });
      }

      const categories: CategoryStandings[] = [...byCategory.values()]
        .sort((a, b) => a.category.sportName.localeCompare(b.category.sportName) || a.category.id - b.category.id)
        .map(({ category, teams }) => ({ category, ...rankStandings(teams) }));

      return { success: true, data: { seasonId, categories } };
    } catch (err) {
      console.error('StandingsService.getSeasonStandings error:', err);
      return { success: false, code: 'SERVER', error: 'Could not load standings.' };
    }
  }

  /**
   * Saves a team's totals only if nobody changed them since they were loaded: a first save inserts
   * (expectedUpdatedAt null); later saves update only while updated_at still matches.
   */
  static async saveRecord(input: UpdateTeamStandingInput): Promise<StandingsResult<SavedTeamStanding>> {
    const { teamId, wins, losses, expectedUpdatedAt } = input;

    try {
      const supabase = await this.getClient();

      if (expectedUpdatedAt === null) {
        const { data, error } = await supabase
          .from('team_standings')
          .insert({ team_id: teamId, wins, losses })
          .select(SAVED_COLUMNS)
          .single();

        if (error) {
          const known = error.code ? PG_ERROR_CODES[error.code] : undefined;
          if (known) return saveFailure(known);
          throw error;
        }
        return { success: true, data: toSaved(data) };
      }

      const { data: updated, error: updateError } = await supabase
        .from('team_standings')
        .update({ wins, losses })
        .eq('team_id', teamId)
        .eq('updated_at', expectedUpdatedAt)
        .select(SAVED_COLUMNS);

      if (updateError) throw updateError;
      if (updated && updated.length > 0) return { success: true, data: toSaved(updated[0]) };

      const { data: existing, error: lookupError } = await supabase
        .from('team_standings')
        .select('team_id')
        .eq('team_id', teamId)
        .maybeSingle();

      if (lookupError) throw lookupError;
      return saveFailure(existing ? 'CONFLICT' : 'NOT_FOUND');
    } catch (err) {
      console.error('StandingsService.saveRecord error:', err);
      return saveFailure('SERVER');
    }
  }
}
