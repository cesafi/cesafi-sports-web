export class CsvParseError extends Error {
  constructor(
    message: string,
    public readonly line: number
  ) {
    super(message);
    this.name = 'CsvParseError';
  }
}

/**
 * Minimal RFC 4180 CSV parser: quoted fields, doubled-quote escapes, CRLF/LF line endings
 * and a leading UTF-8 BOM (as written by Excel).
 */
export function parseCsv(text: string): string[][] {
  const input = text.startsWith('﻿') ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let quoteLine = 0;
  let line = 1;

  const endRecord = () => {
    row.push(field);
    rows.push(row);
    row = [];
    field = '';
  };

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        if (char === '\n') line++;
        field += char;
      }
      continue;
    }

    if (char === '"' && field === '') {
      inQuotes = true;
      quoteLine = line;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i++;
      endRecord();
      line++;
    } else {
      field += char;
    }
  }

  if (inQuotes) {
    throw new CsvParseError(`Unterminated quoted field starting on line ${quoteLine}`, quoteLine);
  }

  // A trailing line break does not start another record
  if (field !== '' || row.length > 0) endRecord();

  return rows;
}

const needsQuotes = /[",\r\n]/;

export function toCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row.map((value) => (needsQuotes.test(value) ? `"${value.replace(/"/g, '""')}"` : value)).join(',')
    )
    .map((line) => `${line}\r\n`)
    .join('');
}
