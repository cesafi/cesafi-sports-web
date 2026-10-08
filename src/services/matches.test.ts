/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const tables: Record<string, Row[]> = {};

function from(table: string) {
  const filters: ((row: Row) => boolean)[] = [];
  let patch: Row | null = null;
  let inserted: Row | null = null;

  const run = () => {
    const rows = tables[table] ?? [];
    if (inserted) {
      const row = { id: rows.length + 1000, ...inserted };
      rows.push(row);
      return [row];
    }
    const matched = rows.filter((row) => filters.every((f) => f(row)));
    if (patch) matched.forEach((row) => Object.assign(row, patch));
    return matched.map((row) => ({
      ...row,
      match_participants: (tables.match_participants ?? []).filter((p) => p.match_id === row.id)
    }));
  };

  const builder: any = {
    select: () => builder,
    update: (data: Row) => ((patch = data), builder),
    insert: (data: Row) => ((inserted = data), builder),
    not: (col: string) => (filters.push((r) => r[col] != null), builder),
    eq: (col: string, v: any) => (filters.push((r) => r[col] === v), builder),
    neq: (col: string, v: any) => (filters.push((r) => r[col] !== v), builder),
    in: (col: string, v: any[]) => (filters.push((r) => v.includes(r[col])), builder),
    gte: (col: string, v: string) => (filters.push((r) => r[col] >= v), builder),
    lt: (col: string, v: string) => (filters.push((r) => r[col] < v), builder),
    lte: (col: string, v: string) => (filters.push((r) => r[col] <= v), builder),
    order: () => builder,
    single: async () => {
      const data = run()[0] ?? null;
      return { data, error: data ? null : { code: 'PGRST116' } };
    },
    then: (resolve: (v: any) => void) => resolve({ data: run(), error: null })
  };
  return builder;
}

jest.mock('./base', () => ({
  BaseService: class {
    static async getClient() {
      return { from };
    }
    static formatError(err: any, msg: string) {
      return { success: false, error: err?.message ?? msg };
    }
  }
}));

import { MatchService } from './matches';

const at = (time: string) => `2026-10-10T${time}:00.000Z`;

beforeEach(() => {
  tables.sports_seasons_stages = [{ id: 1 }, { id: 2 }];
  tables.schools_teams = ['usjr-u15', 'db-u15', 'uspf-u15', 'cec-u15', 'uspf-col', 'usjr-col'].map((id) => ({ id }));
  tables.matches = [
    { id: 1, name: 'USJR vs DB (U15)', stage_id: 1, venue: 'USJR Gym', scheduled_at: at('09:00'), end_at: at('10:00') },
    { id: 2, name: 'USPF vs CEC (U15)', stage_id: 1, venue: 'CEC Gym', scheduled_at: at('09:00'), end_at: at('10:00') },
    { id: 3, name: 'USPF vs USJR (College)', stage_id: 2, venue: 'USC Gym', scheduled_at: at('13:00'), end_at: at('14:00') }
  ];
  tables.match_participants = [
    { match_id: 1, team_id: 'usjr-u15' },
    { match_id: 1, team_id: 'db-u15' },
    { match_id: 2, team_id: 'uspf-u15' },
    { match_id: 2, team_id: 'cec-u15' },
    { match_id: 3, team_id: 'uspf-col' },
    { match_id: 3, team_id: 'usjr-col' }
  ];
});

describe('MatchService schedule conflicts', () => {
  it('allows moving the College match to overlap U15 matches at a different venue', async () => {
    const res = await MatchService.updateById({ id: 3, scheduled_at: at('09:00'), end_at: at('10:00') });
    expect(res).toMatchObject({ success: true });
  });

  it('allows re-saving a match without changing its schedule (no self-conflict)', async () => {
    const res = await MatchService.updateById({
      id: 1,
      name: 'USJR vs DB (U15)',
      venue: 'USJR Gym',
      scheduled_at: at('09:00'),
      end_at: at('10:00')
    });
    expect(res).toMatchObject({ success: true });
  });

  it('blocks updating a match into the same venue at an overlapping time', async () => {
    const res = await MatchService.updateById({ id: 3, venue: 'USJR Gym', scheduled_at: at('09:30'), end_at: at('10:30') });
    expect(res.success).toBe(false);
    expect(!res.success && res.error).toContain('USJR vs DB (U15) (same venue)');
  });

  it('blocks a venue-only change that collides with another match', async () => {
    tables.matches[2].scheduled_at = at('09:00');
    tables.matches[2].end_at = at('10:00');
    const res = await MatchService.updateById({ id: 3, venue: 'CEC Gym' });
    expect(res.success).toBe(false);
  });

  it('allows back-to-back at the same venue', async () => {
    const res = await MatchService.updateById({ id: 3, venue: 'USJR Gym', scheduled_at: at('10:00'), end_at: at('11:00') });
    expect(res).toMatchObject({ success: true });
  });

  it('blocks creating a match for a team record that is already playing elsewhere', async () => {
    const res = await MatchService.insertWithParticipants(
      { name: 'USJR vs CEC (U15)', description: '', stage_id: 1, venue: 'Other Gym', scheduled_at: at('09:30'), end_at: at('10:30') },
      ['usjr-u15', 'cec-u15']
    );
    expect(res.success).toBe(false);
    expect(!res.success && res.error).toContain('same team');
  });

  it('allows creating a College match for USPF while USPF U15 plays elsewhere', async () => {
    const res = await MatchService.insertWithParticipants(
      { name: 'USPF vs USJR (College) G2', description: '', stage_id: 2, venue: 'USC Gym', scheduled_at: at('09:00'), end_at: at('10:00') },
      ['uspf-col', 'usjr-col']
    );
    expect(res).toMatchObject({ success: true });
  });
});

describe('MatchService schedule range', () => {
  it('returns saved times untouched and leaves display formatting to the viewer', async () => {
    const res = await MatchService.getScheduleMatchesByDate({ date_from: at('00:00'), date_to: at('23:59') });

    if (!res.success) throw new Error(res.error);
    const matches = res.data.sortedDateKeys.flatMap((key) => res.data.groupedMatches[key]);
    expect(matches.map((m) => m.scheduled_at)).toEqual([at('09:00'), at('09:00'), at('13:00')]);
    // A server action runs in the server's timezone, so any time string it builds is wrong for the viewer
    matches.forEach((m) => {
      expect(m.displayTime).toBeUndefined();
      expect(m.displayDate).toBeUndefined();
    });
  });
});
