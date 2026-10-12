export const MATCH_IMPORT_COLUMNS = [
  'Match ID',
  'Match Participants',
  'Match Details',
  'Match Format',
  'Scheduled Date',
  'Start Time',
  'Venue'
] as const;

export type MatchImportColumn = (typeof MATCH_IMPORT_COLUMNS)[number];

export interface MatchImportRowError {
  /** Spreadsheet line number; the header is row 1. */
  row: number;
  matchId?: string;
  field?: MatchImportColumn;
  message: string;
}

export interface ParsedMatchImportRow {
  row: number;
  matchId: string;
  teamA: string;
  teamB: string;
  bestOf: 1 | 3 | 5 | 7;
  /** UTC ISO string */
  scheduledAt: string;
  venue: string;
}

export interface MatchImportSummary {
  created: number;
  matches: { id: number; name: string; scheduled_at: string }[];
}

export type MatchImportResponse =
  | { success: true; data: MatchImportSummary }
  | { success: false; error: string; rowErrors?: MatchImportRowError[] };
