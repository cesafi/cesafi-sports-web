import { findInFileConflicts, findInFileDuplicates, parseMatchImportCsv } from './match-import';
import { MATCH_IMPORT_COLUMNS, MatchImportColumn, ParsedMatchImportRow } from '@/lib/types/match-import';
import { toCsv } from '@/lib/utils/csv';

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
