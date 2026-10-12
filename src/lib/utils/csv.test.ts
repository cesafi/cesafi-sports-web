import { parseCsv, toCsv } from './csv';

describe('parseCsv', () => {
  it('splits CRLF records and ignores the final line break', () => {
    expect(parseCsv('a,b\r\n1,2\r\n')).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('splits LF records', () => {
    expect(parseCsv('a,b\n1,2')).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('strips a leading UTF-8 BOM (Excel exports)', () => {
    expect(parseCsv('﻿a,b\n1,2')).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('keeps commas inside quotes and unescapes doubled quotes', () => {
    expect(parseCsv('x\n"Cebu, Coliseum","say ""hi"""')).toEqual([['x'], ['Cebu, Coliseum', 'say "hi"']]);
  });

  it('keeps line breaks inside quoted fields', () => {
    expect(parseCsv('x\n"line1\nline2"')).toEqual([['x'], ['line1\nline2']]);
  });

  it('keeps empty fields', () => {
    expect(parseCsv('a,,c')).toEqual([['a', '', 'c']]);
  });

  it('returns no rows for empty text', () => {
    expect(parseCsv('')).toEqual([]);
  });

  it('rejects an unterminated quoted field with its line number', () => {
    expect(() => parseCsv('a\n"open')).toThrow('Unterminated quoted field starting on line 2');
  });
});

describe('toCsv', () => {
  it('quotes only fields that need it and ends rows with CRLF', () => {
    expect(toCsv([['a', 'b,c'], ['say "hi"', '']])).toBe('a,"b,c"\r\n"say ""hi""",\r\n');
  });

  it('round-trips through parseCsv', () => {
    expect(parseCsv(toCsv([['A vs. B', '3:30 PM']]))).toEqual([['A vs. B', '3:30 PM']]);
  });
});
