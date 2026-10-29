import { BaseService } from './base';
import { formatCategoryName } from '@/lib/utils/sports';
import {
  isStandingsStage,
  POINTS_PER_WIN,
  rankStandings,
  StandingsMatch,
  tallyMatches
} from '@/lib/utils/standings-calc';
import {
  CategoryStandings,
  RankedTeamStanding,
  SavedStandingsCutoff,
  SavedTeamStanding,
  SeasonStandings,
  StandingLine,
  StandingsErrorCode,
  StandingsResult
} from '@/lib/types/standings';
import { UpdateStandingsCutoffInput, UpdateTeamStandingInput } from '@/lib/validations/standings';

interface StandingRecordRow {
  wins: number;
  losses: number;
  point_diff: number;
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
  team_standings(wins, losses, point_diff, updated_at)
`;

interface StageRow {
  season_id: number;
  sport_category_id: number;
  competition_stage: string;
}

interface FinishedMatchRow {
  scheduled_at: string | null;
  sports_seasons_stages: StageRow | StageRow[] | null;
  match_participants: { team_id: string; match_score: number | null }[] | null;
}

const FINISHED_MATCHES_SELECT = `
  scheduled_at,
  sports_seasons_stages!inner(season_id, sport_category_id, competition_stage),
  match_participants(team_id, match_score)
`;

const ZERO_LINE: StandingLine = { wins: 0, losses: 0, pointDiff: 0 };

/** A team with its starting record, before match results and ranking are added. */
type SeasonTeam = Pick<RankedTeamStanding, 'teamId' | 'teamName' | 'school' | 'starting' | 'updatedAt'>;

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
  pointDiff: row.point_diff,
  updatedAt: row.updated_at
});

const SAVED_COLUMNS = 'team_id, wins, losses, point_diff, updated_at';

// An embed may arrive as an object, an array or null depending on PostgREST's relationship detection.
const firstRecord = <T>(embedded: T | T[] | null): T | null =>
  Array.isArray(embedded) ? (embedded[0] ?? null) : (embedded ?? null);

/** Finished round-robin matches of the season, grouped by category. */
function groupMatchesByCategory(rows: FinishedMatchRow[]): Map<number, StandingsMatch[]> {
  const byCategory = new Map<number, StandingsMatch[]>();
  for (const row of rows) {
    const stage = firstRecord(row.sports_seasons_stages);
    if (!stage || !isStandingsStage(stage.competition_stage)) continue;

    const list = byCategory.get(stage.sport_category_id) ?? [];
    list.push({
      scheduledAt: row.scheduled_at,
      participants: (row.match_participants ?? []).map((p) => ({ teamId: p.team_id, score: p.match_score }))
    });
    byCategory.set(stage.sport_category_id, list);
  }
  return byCategory;
}

const CUTOFF_ERRORS = {
  NOT_FOUND: 'This season or category no longer exists.',
  SERVER: 'Could not save the cut-off date. Please try again.'
} as const;

export class StandingsService extends BaseService {
  static async getSeasonStandings(seasonId: number): Promise<StandingsResult<SeasonStandings>> {
    try {
      const supabase = await this.getClient();
      const [teamsResult, matchesResult, cutoffsResult] = await Promise.all([
        supabase.from('schools_teams').select(SEASON_TEAMS_SELECT).eq('season_id', seasonId).eq('is_active', true),
        supabase
          .from('matches')
          .select(FINISHED_MATCHES_SELECT)
          .eq('status', 'finished')
          .eq('sports_seasons_stages.season_id', seasonId),
        supabase.from('standings_cutoffs').select('sport_category_id, counted_through').eq('season_id', seasonId)
      ]);

      if (teamsResult.error) throw teamsResult.error;
      if (matchesResult.error) throw matchesResult.error;
      if (cutoffsResult.error) throw cutoffsResult.error;

      const data = teamsResult.data;
      const matchesByCategory = groupMatchesByCategory((matchesResult.data ?? []) as unknown as FinishedMatchRow[]);
      const cutoffs = new Map(
        ((cutoffsResult.data ?? []) as { sport_category_id: number; counted_through: string }[]).map((c) => [
          c.sport_category_id,
          c.counted_through
        ])
      );

      const byCategory = new Map<number, { category: CategoryStandings['category']; teams: SeasonTeam[] }>();

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
          starting: record
            ? { wins: record.wins, losses: record.losses, pointDiff: record.point_diff ?? 0 }
            : ZERO_LINE,
          updatedAt: record?.updated_at ?? null
        });
      }

      const categories: CategoryStandings[] = [...byCategory.values()]
        .sort((a, b) => a.category.sportName.localeCompare(b.category.sportName) || a.category.id - b.category.id)
        .map(({ category, teams }) => {
          const countedThrough = cutoffs.get(category.id) ?? null;
          const tally = tallyMatches(matchesByCategory.get(category.id) ?? [], countedThrough);
          const totals = teams.map((team) => {
            const fromMatches = tally.get(team.teamId) ?? ZERO_LINE;
            const wins = team.starting.wins + fromMatches.wins;
            return {
              ...team,
              fromMatches,
              wins,
              losses: team.starting.losses + fromMatches.losses,
              pointDiff: team.starting.pointDiff + fromMatches.pointDiff,
              points: POINTS_PER_WIN * wins
            };
          });
          return { category, countedThrough, ...rankStandings(totals) };
        });

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
    const { teamId, wins, losses, pointDiff, expectedUpdatedAt } = input;

    try {
      const supabase = await this.getClient();

      if (expectedUpdatedAt === null) {
        const { data, error } = await supabase
          .from('team_standings')
          .insert({ team_id: teamId, wins, losses, point_diff: pointDiff })
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
        .update({ wins, losses, point_diff: pointDiff })
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

  /** Sets (upsert) or clears (delete) a category's cut-off. Last write wins. */
  static async saveCutoff(input: UpdateStandingsCutoffInput): Promise<StandingsResult<SavedStandingsCutoff>> {
    const { seasonId, sportCategoryId, countedThrough } = input;

    try {
      const supabase = await this.getClient();
      const { error } =
        countedThrough === null
          ? await supabase
              .from('standings_cutoffs')
              .delete()
              .eq('season_id', seasonId)
              .eq('sport_category_id', sportCategoryId)
          : await supabase
              .from('standings_cutoffs')
              .upsert(
                { season_id: seasonId, sport_category_id: sportCategoryId, counted_through: countedThrough },
                { onConflict: 'season_id,sport_category_id' }
              );

      if (error) {
        if (error.code === '23503') return { success: false, code: 'NOT_FOUND', error: CUTOFF_ERRORS.NOT_FOUND };
        throw error;
      }
      return { success: true, data: { seasonId, sportCategoryId, countedThrough } };
    } catch (err) {
      console.error('StandingsService.saveCutoff error:', err);
      return { success: false, code: 'SERVER', error: CUTOFF_ERRORS.SERVER };
    }
  }
}
