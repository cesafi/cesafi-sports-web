import {
  MATCH_IMPORT_COLUMNS,
  MatchImportColumn,
  MatchImportRowError,
  ParsedMatchImportRow
} from '@/lib/types/match-import';
import { MATCH_IMPORT_MAX_ROWS, matchImportRowSchema } from '@/lib/validations/match-import';
import { CsvParseError, parseCsv } from '@/lib/utils/csv';
import {
  ScheduledMatchSlot,
  findMatchScheduleConflicts,
  formatMatchScheduleConflicts
} from '@/lib/utils/match-schedule-conflicts';

type RowWithTeams = ParsedMatchImportRow & { teamIds: string[] };

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
    ...header.filter((cell) => !isColumn(cell)).map((cell) => ({ row: 1, message: `Unknown column "${cell}"` }))
  ];
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

    const result = matchImportRowSchema.safeParse(Object.fromEntries(header.map((column, i) => [column, record[i]])));
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
