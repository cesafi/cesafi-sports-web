import { z } from 'zod';
import { MATCH_IMPORT_COLUMNS, MatchImportColumn, ParsedMatchImportRow } from '@/lib/types/match-import';
import { toCsv } from '@/lib/utils/csv';

export const MATCH_IMPORT_MAX_BYTES = 1024 * 1024;
export const MATCH_IMPORT_MAX_ROWS = 500;

// The Philippines has no daylight saving time, so Asia/Manila is always UTC+8.
const MANILA_UTC_OFFSET_HOURS = 8;

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(0?[1-9]|1[0-2]):([0-5]\d) (AM|PM)$/i;
const FORMAT_PATTERN = /^BO([1357])$/i;
const PARTICIPANTS_SEPARATOR = /\s+vs\.?\s+/i;

export function manilaToUtcIso(date: string, time: string): string {
  const [, year, month, day] = DATE_PATTERN.exec(date)!.map(Number);
  const [, rawHour, minute, meridiem] = TIME_PATTERN.exec(time)!;
  const hour12 = Number(rawHour) % 12;
  const hour = meridiem.toUpperCase() === 'PM' ? hour12 + 12 : hour12;
  return new Date(Date.UTC(year, month - 1, day, hour - MANILA_UTC_OFFSET_HOURS, Number(minute))).toISOString();
}

function isRealDate(date: string): boolean {
  const [, year, month, day] = DATE_PATTERN.exec(date)!.map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
  );
}

const requiredCell = (column: MatchImportColumn) =>
  z.string({ message: `${column} is required` }).trim().min(1, { message: `${column} is required` });

export const matchImportRowSchema = z
  .object({
    'Match ID': requiredCell('Match ID').max(100, { message: 'Match ID must be 100 characters or fewer' }),
    'Match Participants': requiredCell('Match Participants').transform((value, ctx) => {
      const teams = value.split(PARTICIPANTS_SEPARATOR).map((team) => team.trim());
      if (teams.length !== 2 || teams.some((team) => team === '')) {
        ctx.addIssue({
          code: 'custom',
          message: 'Match Participants must be exactly two teams written as "A vs. B"'
        });
        return z.NEVER;
      }
      if (teams[0] === teams[1]) {
        ctx.addIssue({ code: 'custom', message: 'Match Participants must be two different teams' });
        return z.NEVER;
      }
      return { teamA: teams[0], teamB: teams[1] };
    }),
    'Match Details': requiredCell('Match Details'),
    'Match Format': requiredCell('Match Format').transform((value, ctx) => {
      const match = FORMAT_PATTERN.exec(value);
      if (!match) {
        ctx.addIssue({ code: 'custom', message: 'Match Format must be BO1, BO3, BO5 or BO7' });
        return z.NEVER;
      }
      return Number(match[1]) as ParsedMatchImportRow['bestOf'];
    }),
    'Scheduled Date': requiredCell('Scheduled Date').superRefine((value, ctx) => {
      if (!DATE_PATTERN.test(value)) {
        ctx.addIssue({ code: 'custom', message: 'Scheduled Date must be YYYY-MM-DD (e.g. 2026-10-17)' });
      } else if (!isRealDate(value)) {
        ctx.addIssue({ code: 'custom', message: `Scheduled Date ${value} is not a real date` });
      }
    }),
    'Start Time': requiredCell('Start Time').regex(TIME_PATTERN, {
      message: 'Start Time must be h:mm AM/PM (e.g. 3:30 PM)'
    }),
    Venue: requiredCell('Venue').max(255, { message: 'Venue must be 255 characters or fewer' })
  })
  .transform(
    (row): Omit<ParsedMatchImportRow, 'row'> => ({
      matchId: row['Match ID'],
      teamA: row['Match Participants'].teamA,
      teamB: row['Match Participants'].teamB,
      bestOf: row['Match Format'],
      scheduledAt: manilaToUtcIso(row['Scheduled Date'], row['Start Time']),
      venue: row.Venue
    })
  );

export const importMatchesInputSchema = z.object({
  stageId: z.number().int().positive(),
  csvText: z.string().min(1).max(MATCH_IMPORT_MAX_BYTES)
});

export function validateImportFile(file: { name: string; size: number }): string | null {
  if (!file.name.toLowerCase().endsWith('.csv')) return 'Please choose a .csv file.';
  if (file.size > MATCH_IMPORT_MAX_BYTES) return 'File is larger than 1 MB.';
  return null;
}

export function buildMatchImportTemplate(): string {
  return toCsv([
    [...MATCH_IMPORT_COLUMNS],
    ['CBL26-COL-001', 'UCLM vs. UPC', 'College - Elimination Round', 'BO1', '2026-10-17', '3:30 PM', 'Cebu Coliseum'],
    ['CBL26-COL-002', 'BC vs. UC', 'College - Elimination Round', 'BO1', '2026-10-17', '5:00 PM', 'Cebu Coliseum']
  ]);
}
