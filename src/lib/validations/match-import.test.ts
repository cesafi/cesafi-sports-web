import {
  MATCH_IMPORT_MAX_BYTES,
  buildMatchImportTemplate,
  manilaToUtcIso,
  matchImportRowSchema,
  validateImportFile
} from './match-import';
import { MATCH_IMPORT_COLUMNS, MatchImportColumn } from '@/lib/types/match-import';
import { parseCsv } from '@/lib/utils/csv';

const valid: Record<MatchImportColumn, string> = {
  'Match ID': 'CBL26-COL-001',
  'Match Participants': 'UCLM vs. UPC',
  'Match Details': 'College - Elimination',
  'Match Format': 'bo1',
  'Scheduled Date': '2026-10-17',
  'Start Time': '3:30 PM',
  Venue: ' Cebu Coliseum '
};

function expectRejected(column: MatchImportColumn, value: string, message: string) {
  const result = matchImportRowSchema.safeParse({ ...valid, [column]: value });
  expect(result.success).toBe(false);
  if (result.success) return;
  expect(result.error.issues[0].path).toEqual([column]);
  expect(result.error.issues[0].message).toContain(message);
}

describe('manilaToUtcIso', () => {
  it('converts afternoon Philippine time to UTC', () => {
    expect(manilaToUtcIso('2026-10-17', '3:30 PM')).toBe('2026-10-17T07:30:00.000Z');
  });

  it('treats 12:xx PM as noon', () => {
    expect(manilaToUtcIso('2026-10-17', '12:30 PM')).toBe('2026-10-17T04:30:00.000Z');
  });

  it('treats 12:xx AM as midnight, the previous UTC day', () => {
    expect(manilaToUtcIso('2026-10-17', '12:15 AM')).toBe('2026-10-16T16:15:00.000Z');
  });

  it('rolls morning times back to the previous UTC day', () => {
    expect(manilaToUtcIso('2026-10-17', '7:30 AM')).toBe('2026-10-16T23:30:00.000Z');
  });
});

describe('matchImportRowSchema', () => {
  it('parses a valid row into trimmed, typed values', () => {
    expect(matchImportRowSchema.parse(valid)).toEqual({
      matchId: 'CBL26-COL-001',
      teamA: 'UCLM',
      teamB: 'UPC',
      bestOf: 1,
      scheduledAt: '2026-10-17T07:30:00.000Z',
      venue: 'Cebu Coliseum'
    });
  });

  it('accepts "vs" without a period', () => {
    expect(matchImportRowSchema.parse({ ...valid, 'Match Participants': 'UCLM vs UPC' }).teamB).toBe('UPC');
  });

  it('rejects a single team', () => {
    expectRejected('Match Participants', 'UCLM', 'exactly two teams');
  });

  it('rejects a team playing itself', () => {
    expectRejected('Match Participants', 'UCLM vs. UCLM', 'must be two different teams');
  });

  it('rejects three teams', () => {
    expectRejected('Match Participants', 'A vs. B vs. C', 'exactly two teams');
  });

  it.each(['BO2', 'Best of 1'])('rejects match format %s', (value) => {
    expectRejected('Match Format', value, 'BO1, BO3, BO5 or BO7');
  });

  it('rejects an Excel-style date with the expected format in the message', () => {
    expectRejected('Scheduled Date', '10/17/2026', 'YYYY-MM-DD (e.g. 2026-10-17)');
  });

  it('rejects an impossible calendar date', () => {
    expectRejected('Scheduled Date', '2026-02-30', 'not a real date');
  });

  it.each(['15:30', '13:00 PM', '3:5 PM'])('rejects start time %s', (value) => {
    expectRejected('Start Time', value, 'h:mm AM/PM (e.g. 3:30 PM)');
  });

  it.each(['Match ID', 'Match Details', 'Venue'] as const)('rejects a blank %s', (column) => {
    expectRejected(column, '   ', `${column} is required`);
  });

  it('rejects a Match ID longer than 100 characters', () => {
    expectRejected('Match ID', 'x'.repeat(101), '100 characters');
  });

  it('rejects a Venue longer than 255 characters', () => {
    expectRejected('Venue', 'x'.repeat(256), '255 characters');
  });
});

describe('validateImportFile', () => {
  it('rejects non-CSV files', () => {
    expect(validateImportFile({ name: 'a.xlsx', size: 10 })).toBe('Please choose a .csv file.');
  });

  it('rejects files over 1 MB', () => {
    expect(validateImportFile({ name: 'a.CSV', size: MATCH_IMPORT_MAX_BYTES + 1 })).toBe('File is larger than 1 MB.');
  });

  it('accepts a small CSV', () => {
    expect(validateImportFile({ name: 'a.csv', size: 10 })).toBeNull();
  });
});

describe('buildMatchImportTemplate', () => {
  it('has the required header and two valid example rows', () => {
    const [header, ...rows] = parseCsv(buildMatchImportTemplate());
    expect(header).toEqual([...MATCH_IMPORT_COLUMNS]);
    expect(rows).toHaveLength(2);
    rows.forEach((row) => {
      const record = Object.fromEntries(header.map((column, i) => [column, row[i]]));
      expect(matchImportRowSchema.safeParse(record).success).toBe(true);
    });
  });
});
