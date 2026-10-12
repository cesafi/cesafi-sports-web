import { BaseService } from './base';
import { SchoolsTeamService } from './schools-teams';
import { matches, matchParticipants } from '@/db/schema';
import {
  MATCH_IMPORT_COLUMNS,
  MatchImportColumn,
  MatchImportResponse,
  MatchImportRowError,
  MatchImportSummary,
  ParsedMatchImportRow
} from '@/lib/types/match-import';
import { MatchInsert } from '@/lib/types/matches';
import { SchoolsTeamWithSchoolDetails } from '@/lib/types/schools-teams';
import { MATCH_IMPORT_MAX_ROWS, matchImportRowSchema } from '@/lib/validations/match-import';
import { createMatchSchema } from '@/lib/validations/matches';
import { CsvParseError, parseCsv } from '@/lib/utils/csv';
import { MatchParticipant, generateMatchDescription, generateMatchName } from '@/lib/utils/match-naming';
import {
  DEFAULT_MATCH_DURATION_MINUTES,
  ScheduledMatchSlot,
  findMatchScheduleConflicts,
  formatMatchScheduleConflicts
} from '@/lib/utils/match-schedule-conflicts';

type RowWithTeams = ParsedMatchImportRow & { teamIds: string[] };
type ResolvedRow = RowWithTeams & { insert: MatchInsert };

interface ImportStage {
  id: number;
  competition_stage: string;
  sports_categories: { division: string; levels: string; sports: { name: string } | null } | null;
}

interface ExistingMatch {
  id: number;
  name: string;
  venue: string;
  scheduled_at: string;
  end_at: string | null;
  match_participants: { team_id: string }[] | null;
}

const STAGE_SELECT =
  'id, competition_stage, sport_category_id, season_id, sports_categories!sport_category_id(division, levels, sports(name))';
// Same lookback as MatchService: catches earlier matches whose end_at runs into a new slot.
const CONFLICT_LOOKBACK_MS = 24 * 60 * 60000;
// Matches the default PostgREST max_rows on hosted Supabase.
const CONFLICT_PAGE_SIZE = 1000;

const isColumn = (value: unknown): value is MatchImportColumn =>
  MATCH_IMPORT_COLUMNS.includes(value as MatchImportColumn);

const pairKey = (row: Pick<ParsedMatchImportRow, 'teamA' | 'teamB' | 'scheduledAt'>) =>
  `${[row.teamA, row.teamB].sort().join('|')}@${new Date(row.scheduledAt).getTime()}`;

export function parseMatchImportCsv(csvText: string): {
  rows: ParsedMatchImportRow[];
  errors: MatchImportRowError[];
} {
  let records: string[][];
  try {
    records = parseCsv(csvText);
  } catch (err) {
    const row = err instanceof CsvParseError ? err.line : 1;
    return { rows: [], errors: [{ row, message: err instanceof Error ? err.message : 'Could not read the CSV file.' }] };
  }

  const isBlank = (record: string[]) => record.every((cell) => cell.trim() === '');
  const [headerRecord, ...dataRecords] = records;

  if (!headerRecord || isBlank(headerRecord)) {
    return { rows: [], errors: [{ row: 1, message: 'The file is empty.' }] };
  }

  const header = headerRecord.map((cell) => cell.trim());
  const headerErrors: MatchImportRowError[] = [
    ...MATCH_IMPORT_COLUMNS.filter((column) => !header.includes(column)).map((column) => ({
      row: 1,
      field: column,
      message: `Missing column "${column}"`
    })),
    ...header
      .filter((cell) => cell !== '' && !isColumn(cell))
      .map((cell) => ({ row: 1, message: `Unknown column "${cell}"` }))
  ];
  // Excel pads every row to its used range, leaving header-less columns that must stay empty.
  const unnamedColumns = header.flatMap((cell, i) => (cell === '' ? [i] : []));
  if (headerErrors.length > 0) return { rows: [], errors: headerErrors };

  // Spreadsheet row number = record index + 1 (header is row 1); blank rows keep their number.
  const dataRows = dataRecords
    .map((record, index) => ({ record, row: index + 2 }))
    .filter(({ record }) => !isBlank(record));

  if (dataRows.length === 0) {
    return { rows: [], errors: [{ row: 1, message: 'The file has no match rows.' }] };
  }
  if (dataRows.length > MATCH_IMPORT_MAX_ROWS) {
    return {
      rows: [],
      errors: [{ row: 1, message: `Too many rows: ${dataRows.length} (maximum ${MATCH_IMPORT_MAX_ROWS}).` }]
    };
  }

  const matchIdIndex = header.indexOf('Match ID');
  const rows: ParsedMatchImportRow[] = [];
  const errors: MatchImportRowError[] = [];

  for (const { record, row } of dataRows) {
    const matchId = record[matchIdIndex]?.trim() || undefined;

    if (record.length !== header.length) {
      errors.push({ row, matchId, message: `Expected ${header.length} values but found ${record.length}` });
      continue;
    }

    const strayColumn = unnamedColumns.find((i) => record[i].trim() !== '');
    if (strayColumn !== undefined) {
      errors.push({ row, matchId, message: `Column ${strayColumn + 1} has a value but no header` });
      continue;
    }

    const result = matchImportRowSchema.safeParse(
      Object.fromEntries(header.flatMap((column, i) => (column === '' ? [] : [[column, record[i]]])))
    );
    if (result.success) {
      rows.push({ row, ...result.data });
    } else {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        errors.push({ row, matchId, ...(isColumn(field) ? { field } : {}), message: issue.message });
      });
    }
  }

  return { rows, errors };
}

export function findInFileDuplicates(rows: ParsedMatchImportRow[]): MatchImportRowError[] {
  const firstRowByMatchId = new Map<string, number>();
  const firstRowByPairing = new Map<string, number>();
  const errors: MatchImportRowError[] = [];

  for (const row of rows) {
    const idRow = firstRowByMatchId.get(row.matchId);
    if (idRow !== undefined) {
      errors.push({
        row: row.row,
        matchId: row.matchId,
        field: 'Match ID',
        message: `Duplicate Match ID (first used on row ${idRow})`
      });
    } else {
      firstRowByMatchId.set(row.matchId, row.row);
    }

    const key = pairKey(row);
    const pairingRow = firstRowByPairing.get(key);
    if (pairingRow !== undefined) {
      errors.push({
        row: row.row,
        matchId: row.matchId,
        field: 'Match Participants',
        message: `Duplicate of row ${pairingRow}`
      });
    } else {
      firstRowByPairing.set(key, row.row);
    }
  }

  return errors;
}

const toSlot = (row: RowWithTeams): ScheduledMatchSlot => ({
  id: row.row,
  name: `row ${row.row}`,
  venue: row.venue,
  scheduled_at: row.scheduledAt,
  end_at: null,
  team_ids: row.teamIds
});

export function findInFileConflicts(rows: RowWithTeams[]): MatchImportRowError[] {
  return rows.flatMap((row, index) => {
    const conflicts = findMatchScheduleConflicts(toSlot(row), rows.slice(0, index).map(toSlot));
    return conflicts.length > 0
      ? [{ row: row.row, matchId: row.matchId, message: formatMatchScheduleConflicts(conflicts) }]
      : [];
  });
}

const sameTeams = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');

const toParticipant = (team: SchoolsTeamWithSchoolDetails): MatchParticipant => ({
  id: team.id,
  name: team.name,
  schools: { name: team.school.name, abbreviation: team.school.abbreviation }
});

export class MatchImportService extends BaseService {
  static async importFromCsv(stageId: number, csvText: string): Promise<MatchImportResponse> {
    try {
      const parsed = parseMatchImportCsv(csvText);
      const errors = [...parsed.errors, ...findInFileDuplicates(parsed.rows)];
      // A row that fails one check is left out of the later checks, so each row reports its first problem.
      const passing = <T extends { row: number }>(rows: T[]) => {
        const failed = new Set(errors.map((e) => e.row));
        return rows.filter((r) => !failed.has(r.row));
      };

      const parsedRows = passing(parsed.rows);
      if (parsedRows.length === 0) return this.validationFailure(errors);

      const supabase = await this.getClient();

      const { data: stage, error: stageError } = await supabase
        .from('sports_seasons_stages')
        .select(STAGE_SELECT)
        .eq('id', stageId)
        .single();
      if (stageError && stageError.code !== 'PGRST116') throw stageError;
      if (!stage) return { success: false, error: 'Selected league stage was not found.' };

      const teamsResult = await SchoolsTeamService.getTeamsForStage(stageId);
      if (!teamsResult.success) return { success: false, error: teamsResult.error };

      // The untyped client infers embeds as arrays; a many-to-one embed is returned as a single object.
      const resolved = this.resolveRows(parsedRows, stage as unknown as ImportStage, teamsResult.data, stageId, errors);

      errors.push(...findInFileConflicts(passing(resolved)));
      let candidates = passing(resolved);

      if (candidates.length > 0) {
        errors.push(...(await this.findDatabaseDuplicates(candidates, stageId)));
        candidates = passing(candidates);
      }
      if (candidates.length > 0) {
        errors.push(...(await this.findDatabaseConflicts(candidates)));
      }

      if (errors.length > 0) return this.validationFailure(errors);

      const created = await this.getDrizzle().transaction(async (tx) => {
        const inserted: MatchImportSummary['matches'] = [];
        for (const row of resolved) {
          const [match] = await tx
            .insert(matches)
            .values(row.insert as typeof matches.$inferInsert)
            .returning({ id: matches.id, name: matches.name, scheduled_at: matches.scheduled_at });
          await tx.insert(matchParticipants).values(row.teamIds.map((team_id) => ({ match_id: match.id, team_id })));
          inserted.push({ id: match.id, name: match.name, scheduled_at: match.scheduled_at ?? row.scheduledAt });
        }
        return inserted;
      });

      return { success: true, data: { created: created.length, matches: created } };
    } catch (err) {
      return this.formatError(err, 'Failed to import matches.');
    }
  }

  private static validationFailure(errors: MatchImportRowError[]): MatchImportResponse {
    return {
      success: false,
      error: 'Validation failed',
      rowErrors: [...errors].sort((a, b) => a.row - b.row)
    };
  }

  private static resolveRows(
    rows: ParsedMatchImportRow[],
    stage: ImportStage,
    teams: SchoolsTeamWithSchoolDetails[],
    stageId: number,
    errors: MatchImportRowError[]
  ): ResolvedRow[] {
    const teamsByAbbreviation = new Map<string, SchoolsTeamWithSchoolDetails[]>();
    teams.forEach((team) => {
      const list = teamsByAbbreviation.get(team.school.abbreviation) ?? [];
      teamsByAbbreviation.set(team.school.abbreviation, [...list, team]);
    });
    const validTeams = [...teamsByAbbreviation.keys()].sort().join(', ');

    const sportName = stage.sports_categories?.sports?.name || 'Unknown Sport';
    const division = stage.sports_categories?.division || 'mixed';
    const level = stage.sports_categories?.levels || 'college';

    return rows.flatMap((row) => {
      const rowTeams: SchoolsTeamWithSchoolDetails[] = [];
      for (const abbreviation of [row.teamA, row.teamB]) {
        const found = teamsByAbbreviation.get(abbreviation) ?? [];
        if (found.length === 1) {
          rowTeams.push(found[0]);
          continue;
        }
        errors.push({
          row: row.row,
          matchId: row.matchId,
          field: 'Match Participants',
          message:
            found.length === 0
              ? `Team "${abbreviation}" is not in this stage. Valid teams: ${validTeams}`
              : `Team "${abbreviation}" is ambiguous: ${found.length} active teams in this stage`
        });
      }
      if (rowTeams.length !== 2) return [];

      const participants = rowTeams.map(toParticipant);
      const result = createMatchSchema.safeParse({
        name: generateMatchName(participants),
        description: generateMatchDescription(participants, stage.competition_stage, sportName, division, level),
        venue: row.venue,
        best_of: row.bestOf,
        stage_id: stageId,
        status: 'upcoming',
        scheduled_at: row.scheduledAt,
        start_at: null,
        end_at: null
      });

      if (!result.success) {
        result.error.issues.forEach((issue) =>
          errors.push({
            row: row.row,
            matchId: row.matchId,
            ...(issue.path[0] === 'venue' ? { field: 'Venue' as const } : {}),
            message: issue.message
          })
        );
        return [];
      }

      return [{ ...row, teamIds: rowTeams.map((t) => t.id), insert: result.data as MatchInsert }];
    });
  }

  private static async findDatabaseDuplicates(rows: ResolvedRow[], stageId: number): Promise<MatchImportRowError[]> {
    const supabase = await this.getClient();
    const times = [...new Set(rows.map((r) => r.scheduledAt))];
    const { data, error } = await supabase
      .from('matches')
      .select('id, name, scheduled_at, match_participants(team_id)')
      .eq('stage_id', stageId)
      .in('scheduled_at', times);
    if (error) throw error;

    const existing = (data ?? []) as ExistingMatch[];
    return rows.flatMap((row) => {
      const time = new Date(row.scheduledAt).getTime();
      const match = existing.find(
        (m) =>
          new Date(m.scheduled_at).getTime() === time &&
          sameTeams((m.match_participants ?? []).map((p) => p.team_id), row.teamIds)
      );
      return match
        ? [
            {
              row: row.row,
              matchId: row.matchId,
              field: 'Match Participants' as const,
              message: `Already exists: "${match.name}" (Match #${match.id})`
            }
          ]
        : [];
    });
  }

  private static async findDatabaseConflicts(rows: ResolvedRow[]): Promise<MatchImportRowError[]> {
    const supabase = await this.getClient();
    const times = rows.map((r) => new Date(r.scheduledAt).getTime());
    const windowStart = new Date(Math.min(...times) - CONFLICT_LOOKBACK_MS).toISOString();
    const windowEnd = new Date(Math.max(...times) + DEFAULT_MATCH_DURATION_MINUTES * 60000).toISOString();

    // A season-long file spans months of every sport, so page past PostgREST's max_rows cap.
    const data: ExistingMatch[] = [];
    for (let from = 0; ; from += CONFLICT_PAGE_SIZE) {
      const { data: page, error } = await supabase
        .from('matches')
        .select('id, name, venue, scheduled_at, end_at, match_participants(team_id)')
        .not('scheduled_at', 'is', null)
        .gte('scheduled_at', windowStart)
        .lt('scheduled_at', windowEnd)
        .order('id')
        .range(from, from + CONFLICT_PAGE_SIZE - 1);
      if (error) throw error;
      data.push(...((page ?? []) as ExistingMatch[]));
      if (!page || page.length < CONFLICT_PAGE_SIZE) break;
    }

    const existing: ScheduledMatchSlot[] = data.map((m) => ({
      id: m.id,
      name: m.name,
      venue: m.venue,
      scheduled_at: m.scheduled_at,
      end_at: m.end_at,
      team_ids: (m.match_participants ?? []).map((p) => p.team_id)
    }));

    return rows.flatMap((row) => {
      const conflicts = findMatchScheduleConflicts(
        { venue: row.venue, scheduled_at: row.scheduledAt, end_at: null, team_ids: row.teamIds },
        existing
      );
      return conflicts.length > 0
        ? [{ row: row.row, matchId: row.matchId, message: formatMatchScheduleConflicts(conflicts) }]
        : [];
    });
  }
}
