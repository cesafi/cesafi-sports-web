/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const mockTables: Record<string, Row[]> = {};
let mockNextId = 1000;
let mockFailOnMatchInsert: number | null = null;

// Hosted PostgREST caps every response at max_rows (1000) unless the caller pages with .range().
const MOCK_MAX_ROWS = 1000;

function mockFrom(table: string) {
  const filters: ((row: Row) => boolean)[] = [];
  let range: [number, number] | null = null;
  const run = () => {
    const rows = (mockTables[table] ?? [])
      .filter((row) => filters.every((f) => f(row)))
      .map((row) =>
        table === 'matches'
          ? { ...row, match_participants: (mockTables.match_participants ?? []).filter((p) => p.match_id === row.id) }
          : row
      );
    const [from, to] = range ?? [0, MOCK_MAX_ROWS - 1];
    return rows.slice(from, Math.min(to + 1, from + MOCK_MAX_ROWS));
  };

  const builder: any = {
    select: () => builder,
    order: () => builder,
    range: (from: number, to: number) => ((range = [from, to]), builder),
    eq: (col: string, v: any) => (filters.push((r) => r[col] === v), builder),
    in: (col: string, v: any[]) => (filters.push((r) => v.includes(r[col])), builder),
    not: (col: string) => (filters.push((r) => r[col] != null), builder),
    gte: (col: string, v: string) => (filters.push((r) => r[col] >= v), builder),
    lt: (col: string, v: string) => (filters.push((r) => r[col] < v), builder),
    single: async () => {
      const data = run()[0] ?? null;
      return { data, error: data ? null : { code: 'PGRST116', message: 'not found' } };
    },
    then: (resolve: (v: any) => void) => resolve({ data: run(), error: null })
  };
  return builder;
}

// Mirrors a Postgres transaction: inserts become visible only if the callback resolves.
const mockDrizzle = {
  transaction: jest.fn(async (fn: (tx: any) => Promise<any>) => {
    const { matches: matchesTable } = jest.requireActual('@/db/schema');
    const pending: Record<string, Row[]> = { matches: [], match_participants: [] };
    let matchInserts = 0;
    const tx = {
      insert: (table: unknown) => ({
        values: (values: Row | Row[]) => {
          const name = table === matchesTable ? 'matches' : 'match_participants';
          if (name === 'matches' && ++matchInserts === mockFailOnMatchInsert) {
            throw new Error('connection reset');
          }
          const inserted = (Array.isArray(values) ? values : [values]).map((v) => ({ id: mockNextId++, ...v }));
          pending[name].push(...inserted);
          return Object.assign(Promise.resolve(inserted), { returning: async () => inserted });
        }
      })
    };
    const result = await fn(tx);
    mockTables.matches.push(...pending.matches);
    mockTables.match_participants.push(...pending.match_participants);
    return result;
  })
};

jest.mock('./base', () => ({
  BaseService: class {
    static async getClient() {
      return { from: mockFrom };
    }
    static getDrizzle() {
      return mockDrizzle;
    }
    static formatError(err: any, msg: string) {
      return { success: false, error: err?.message ? `${msg}: ${err.message}` : msg };
    }
  }
}));

import {
  MatchImportService,
  findInFileConflicts,
  findInFileDuplicates,
  parseMatchImportCsv
} from './match-import';
import { MATCH_IMPORT_COLUMNS, MatchImportColumn, ParsedMatchImportRow } from '@/lib/types/match-import';
import { toCsv } from '@/lib/utils/csv';
import { generateMatchName } from '@/lib/utils/match-naming';

const HEADER = [...MATCH_IMPORT_COLUMNS];

const BASE_ROW: Record<MatchImportColumn, string> = {
  'Match ID': 'CBL26-COL-001',
  'Match Participants': 'UCLM vs. UPC',
  'Match Details': 'College - Elimination Round',
  'Match Format': 'BO1',
  'Scheduled Date': '2026-10-17',
  'Start Time': '3:30 PM',
  Venue: 'Cebu Coliseum'
};

const cells = (overrides: Partial<Record<MatchImportColumn, string>> = {}, header: string[] = HEADER) =>
  header.map((column) => ({ ...BASE_ROW, ...overrides })[column as MatchImportColumn]);

const TWO_ROWS = [
  cells(),
  cells({ 'Match ID': 'CBL26-COL-002', 'Match Participants': 'BC vs. UC', 'Start Time': '5:00 PM' })
];

const parsedRow = (overrides: Partial<ParsedMatchImportRow> = {}): ParsedMatchImportRow => ({
  row: 2,
  matchId: 'M-1',
  teamA: 'UCLM',
  teamB: 'UPC',
  bestOf: 1,
  scheduledAt: '2026-10-17T07:30:00.000Z',
  venue: 'Cebu Coliseum',
  ...overrides
});

describe('parseMatchImportCsv', () => {
  it('parses valid rows with spreadsheet row numbers', () => {
    const { rows, errors } = parseMatchImportCsv(toCsv([HEADER, ...TWO_ROWS]));
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ row: 2, matchId: 'CBL26-COL-001', teamA: 'UCLM', teamB: 'UPC' });
    expect(rows[1]).toMatchObject({ row: 3, scheduledAt: '2026-10-17T09:00:00.000Z' });
  });

  it('reads an Excel export (BOM, CRLF, trailing empty rows) like a clean file', () => {
    const clean = parseMatchImportCsv(toCsv([HEADER, ...TWO_ROWS]));
    const excel = parseMatchImportCsv('﻿' + toCsv([HEADER, ...TWO_ROWS]) + ',,,,,,\r\n\r\n');
    expect(excel).toEqual(clean);
  });

  it('reports a missing column', () => {
    const header = HEADER.filter((column) => column !== 'Venue');
    const { rows, errors } = parseMatchImportCsv(toCsv([header, cells({}, header)]));
    expect(rows).toEqual([]);
    expect(errors).toContainEqual({ row: 1, field: 'Venue', message: 'Missing column "Venue"' });
  });

  it('ignores trailing columns without a header (Excel used-range padding)', () => {
    const padded = (row: string[]) => [...row, '', ''];
    const { rows, errors } = parseMatchImportCsv(toCsv([padded(HEADER), ...TWO_ROWS.map(padded)]));
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(2);
  });

  it('rejects a value placed in a column without a header', () => {
    const { rows, errors } = parseMatchImportCsv(toCsv([[...HEADER, ''], [...cells(), 'stray note']]));
    expect(rows).toEqual([]);
    expect(errors).toEqual([
      { row: 2, matchId: 'CBL26-COL-001', message: 'Column 8 has a value but no header' }
    ]);
  });

  it('reports an unknown column', () => {
    const { errors } = parseMatchImportCsv(toCsv([[...HEADER, 'Notes'], [...cells(), 'x']]));
    expect(errors).toContainEqual({ row: 1, message: 'Unknown column "Notes"' });
  });

  it('accepts columns in any order', () => {
    const header = [...HEADER].reverse();
    const { rows, errors } = parseMatchImportCsv(toCsv([header, cells({}, header)]));
    expect(errors).toEqual([]);
    expect(rows[0]).toMatchObject({ matchId: 'CBL26-COL-001', venue: 'Cebu Coliseum' });
  });

  it('reports a row with the wrong number of values', () => {
    const { errors } = parseMatchImportCsv(toCsv([HEADER, cells(), cells().slice(0, 6)]));
    expect(errors).toEqual([{ row: 3, matchId: 'CBL26-COL-001', message: 'Expected 7 values but found 6' }]);
  });

  it('maps validation failures to the row, Match ID and column', () => {
    const { rows, errors } = parseMatchImportCsv(
      toCsv([HEADER, cells(), cells({ 'Match ID': 'BAD-1', 'Scheduled Date': '10/17/2026' })])
    );
    expect(rows).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ row: 3, matchId: 'BAD-1', field: 'Scheduled Date' });
    expect(errors[0].message).toContain('YYYY-MM-DD');
  });

  it('rejects an empty file', () => {
    expect(parseMatchImportCsv('\r\n').errors).toEqual([{ row: 1, message: 'The file is empty.' }]);
  });

  it('rejects a file with only a header', () => {
    expect(parseMatchImportCsv(toCsv([HEADER])).errors).toEqual([
      { row: 1, message: 'The file has no match rows.' }
    ]);
  });

  it('rejects more than 500 rows', () => {
    const many = Array.from({ length: 501 }, (_, i) => cells({ 'Match ID': `M-${i}` }));
    const { rows, errors } = parseMatchImportCsv(toCsv([HEADER, ...many]));
    expect(rows).toEqual([]);
    expect(errors).toEqual([{ row: 1, message: 'Too many rows: 501 (maximum 500).' }]);
  });

  it('reports a malformed file instead of throwing', () => {
    const { rows, errors } = parseMatchImportCsv(toCsv([HEADER]) + '"CBL26-COL-001,UCLM vs. UPC');
    expect(rows).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(2);
    expect(errors[0].message).toContain('Unterminated quoted field');
  });
});

describe('findInFileDuplicates', () => {
  it('flags a reused Match ID on the later row', () => {
    const errors = findInFileDuplicates([
      parsedRow({ row: 2, matchId: 'M-1' }),
      parsedRow({ row: 5, matchId: 'M-1', teamA: 'BC', teamB: 'UC' })
    ]);
    expect(errors).toEqual([
      { row: 5, matchId: 'M-1', field: 'Match ID', message: 'Duplicate Match ID (first used on row 2)' }
    ]);
  });

  it('flags the same pairing at the same time even with the teams swapped', () => {
    const errors = findInFileDuplicates([
      parsedRow({ row: 2, matchId: 'M-1' }),
      parsedRow({ row: 3, matchId: 'M-2', teamA: 'UPC', teamB: 'UCLM' })
    ]);
    expect(errors).toEqual([
      { row: 3, matchId: 'M-2', field: 'Match Participants', message: 'Duplicate of row 2' }
    ]);
  });

  it('allows the same pairing at a different time', () => {
    const errors = findInFileDuplicates([
      parsedRow({ row: 2, matchId: 'M-1' }),
      parsedRow({ row: 3, matchId: 'M-2', scheduledAt: '2026-10-24T07:30:00.000Z' })
    ]);
    expect(errors).toEqual([]);
  });
});

describe('findInFileConflicts', () => {
  const withTeams = (overrides: Partial<ParsedMatchImportRow>, teamIds: string[]) => ({
    ...parsedRow(overrides),
    teamIds
  });

  it('flags two rows at the same venue that overlap', () => {
    const errors = findInFileConflicts([
      withTeams({ row: 2, matchId: 'M-1' }, ['uclm', 'upc']),
      withTeams({ row: 3, matchId: 'M-2', scheduledAt: '2026-10-17T07:40:00.000Z' }, ['bc', 'uc'])
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ row: 3, matchId: 'M-2' });
    expect(errors[0].message).toContain('row 2');
    expect(errors[0].message).toContain('same venue');
  });

  it('allows the same venue 90 minutes apart', () => {
    const errors = findInFileConflicts([
      withTeams({ row: 2, matchId: 'M-1' }, ['uclm', 'upc']),
      withTeams({ row: 3, matchId: 'M-2', scheduledAt: '2026-10-17T09:00:00.000Z' }, ['bc', 'uc'])
    ]);
    expect(errors).toEqual([]);
  });

  it('flags a team booked in two overlapping matches at different venues', () => {
    const errors = findInFileConflicts([
      withTeams({ row: 2, matchId: 'M-1' }, ['uclm', 'upc']),
      withTeams({ row: 3, matchId: 'M-2', venue: 'UV Gym', scheduledAt: '2026-10-17T07:40:00.000Z' }, ['uclm', 'uc'])
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('same team');
  });
});

describe('MatchImportService.importFromCsv', () => {
  const team = (id: string, abbreviation: string, overrides: Row = {}) => ({
    id,
    name: 'Varsity',
    sport_category_id: 3,
    season_id: 1,
    is_active: true,
    school: { name: `${abbreviation} University`, abbreviation },
    ...overrides
  });

  beforeEach(() => {
    mockFailOnMatchInsert = null;
    mockDrizzle.transaction.mockClear();
    mockTables.sports_seasons_stages = [
      {
        id: 10,
        competition_stage: 'group_stage',
        sport_category_id: 3,
        season_id: 1,
        sports_categories: { division: 'men', levels: 'college', sports: { name: 'Basketball' } }
      },
      { id: 11, competition_stage: 'group_stage', sport_category_id: null, season_id: 1, sports_categories: null }
    ];
    mockTables.schools_teams = [
      team('t-uclm', 'UCLM'),
      team('t-upc', 'UPC'),
      team('t-bc', 'BC'),
      team('t-uc', 'UC'),
      team('t-hs-uc', 'UC', { sport_category_id: 4 })
    ];
    mockTables.matches = [];
    mockTables.match_participants = [];
  });

  const csv = (...rows: string[][]) => toCsv([HEADER, ...rows]);
  const rowErrors = (res: Awaited<ReturnType<typeof MatchImportService.importFromCsv>>) =>
    res.success ? [] : (res.rowErrors ?? []);

  it('creates every match with two participants in one transaction', async () => {
    const res = await MatchImportService.importFromCsv(10, csv(...TWO_ROWS));

    expect(res).toMatchObject({ success: true, data: { created: 2 } });
    expect(mockDrizzle.transaction).toHaveBeenCalledTimes(1);
    expect(mockTables.matches).toHaveLength(2);
    expect(mockTables.matches[0]).toMatchObject({
      stage_id: 10,
      status: 'upcoming',
      best_of: 1,
      venue: 'Cebu Coliseum',
      scheduled_at: '2026-10-17T07:30:00.000Z',
      name: generateMatchName([
        { id: 't-uclm', name: 'Varsity', schools: { name: 'UCLM University', abbreviation: 'UCLM' } },
        { id: 't-upc', name: 'Varsity', schools: { name: 'UPC University', abbreviation: 'UPC' } }
      ])
    });
    expect(mockTables.matches[0].description).toContain('Basketball');
    expect(mockTables.match_participants).toHaveLength(4);
    expect(mockTables.match_participants.filter((p) => p.match_id === mockTables.matches[0].id).map((p) => p.team_id)).toEqual([
      't-uclm',
      't-upc'
    ]);
  });

  it('lists the stage teams when an abbreviation is not in the stage', async () => {
    const res = await MatchImportService.importFromCsv(10, csv(cells({ 'Match Participants': 'SHS-ADC vs. UC' })));
    expect(res.success).toBe(false);
    expect(rowErrors(res)).toEqual([
      {
        row: 2,
        matchId: 'CBL26-COL-001',
        field: 'Match Participants',
        message: 'Team "SHS-ADC" is not in this stage. Valid teams: BC, UC, UCLM, UPC'
      }
    ]);
    expect(mockTables.matches).toEqual([]);
  });

  it('rejects an abbreviation shared by two active teams in the stage', async () => {
    mockTables.schools_teams.push(team('t-uc-b', 'UC', { name: 'Team B' }));
    const res = await MatchImportService.importFromCsv(10, csv(cells({ 'Match Participants': 'BC vs. UC' })));
    expect(rowErrors(res)[0].message).toBe('Team "UC" is ambiguous: 2 active teams in this stage');
  });

  it('rejects an unknown stage', async () => {
    const res = await MatchImportService.importFromCsv(99, csv(cells()));
    expect(res).toEqual({ success: false, error: 'Selected league stage was not found.' });
  });

  it('passes on the team lookup error for a stage without a sport category', async () => {
    const res = await MatchImportService.importFromCsv(11, csv(cells()));
    expect(res).toEqual({ success: false, error: 'Stage must have both sport category and season defined.' });
  });

  it('rejects every row when the same file is imported twice', async () => {
    await MatchImportService.importFromCsv(10, csv(...TWO_ROWS));
    const res = await MatchImportService.importFromCsv(10, csv(...TWO_ROWS));

    expect(res.success).toBe(false);
    expect(rowErrors(res).map((e) => e.row)).toEqual([2, 3]);
    rowErrors(res).forEach((e) => expect(e.message).toMatch(/^Already exists: ".+" \(Match #\d+\)$/));
    expect(mockTables.matches).toHaveLength(2);
    expect(mockTables.match_participants).toHaveLength(4);
  });

  it('rejects a row that overlaps an existing match at the same venue in another stage', async () => {
    mockTables.matches.push({
      id: 1,
      name: 'USJR vs UV (High School)',
      stage_id: 20,
      venue: 'Cebu Coliseum',
      scheduled_at: '2026-10-17T07:00:00.000Z',
      end_at: '2026-10-17T08:30:00.000Z'
    });
    const res = await MatchImportService.importFromCsv(10, csv(cells()));
    expect(res.success).toBe(false);
    expect(rowErrors(res)[0].message).toContain('USJR vs UV (High School) (same venue)');
    expect(mockTables.matches).toHaveLength(1);
  });

  it('finds a conflict even when more than 1000 matches fall in the time window', async () => {
    for (let i = 0; i < 1000; i++) {
      mockTables.matches.push({
        id: i + 1,
        name: `Other sport #${i}`,
        stage_id: 30,
        venue: 'Other Gym',
        scheduled_at: '2026-10-17T00:00:00.000Z',
        end_at: null
      });
    }
    mockTables.matches.push({
      id: 5000,
      name: 'USJR vs UV (High School)',
      stage_id: 20,
      venue: 'Cebu Coliseum',
      scheduled_at: '2026-10-17T07:00:00.000Z',
      end_at: '2026-10-17T08:30:00.000Z'
    });

    const res = await MatchImportService.importFromCsv(10, csv(cells()));
    expect(res.success).toBe(false);
    expect(rowErrors(res)[0]?.message).toContain('USJR vs UV (High School) (same venue)');
  });

  it('reports errors from different checks together', async () => {
    const res = await MatchImportService.importFromCsv(
      10,
      csv(
        cells({ 'Scheduled Date': '10/17/2026' }),
        cells({ 'Match ID': 'CBL26-COL-002', 'Match Participants': 'XYZ vs. UC', 'Start Time': '5:00 PM' })
      )
    );
    expect(res).toMatchObject({ success: false, error: 'Validation failed' });
    expect(rowErrors(res).map((e) => [e.row, e.field])).toEqual([
      [2, 'Scheduled Date'],
      [3, 'Match Participants']
    ]);
    expect(mockDrizzle.transaction).not.toHaveBeenCalled();
  });

  it('rolls back everything when the database fails mid-import', async () => {
    mockFailOnMatchInsert = 2;
    const res = await MatchImportService.importFromCsv(10, csv(...TWO_ROWS));
    expect(res.success).toBe(false);
    expect(!res.success && res.error).toContain('Failed to import matches.');
    expect(mockTables.matches).toEqual([]);
    expect(mockTables.match_participants).toEqual([]);
  });
});
