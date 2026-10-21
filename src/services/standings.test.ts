/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;
type DbError = { code?: string; message: string };

const tables: Record<string, Row[]> = {};
// Injected failures keyed by `${table}.${operation}`, e.g. 'team_standings.insert'
let failures: Record<string, DbError> = {};
const calls: { table: string; op: string; payload: Row | null; filters: [string, unknown][] }[] = [];

const INSERTED_AT = '2026-10-22T05:00:00.000001+00:00';
const UPDATED_AT = '2026-10-22T06:00:00.000002+00:00';

function from(table: string) {
  const filters: [string, unknown][] = [];
  let op: 'select' | 'insert' | 'update' = 'select';
  let payload: Row | null = null;

  const run = (): { data: Row[] | null; error: DbError | null } => {
    calls.push({ table, op, payload, filters: [...filters] });
    const injected = failures[`${table}.${op}`];
    if (injected) return { data: null, error: injected };

    const rows = (tables[table] ??= []);
    const matches = (row: Row) => filters.every(([col, value]) => row[col] === value);

    if (op === 'insert') {
      const row = { ...payload, created_at: INSERTED_AT, updated_at: INSERTED_AT };
      rows.push(row);
      return { data: [{ ...row }], error: null };
    }
    if (op === 'update') {
      const hit = rows.filter(matches);
      hit.forEach((row) => Object.assign(row, payload, { updated_at: UPDATED_AT }));
      return { data: hit.map((row) => ({ ...row })), error: null };
    }
    return { data: rows.filter(matches).map((row) => ({ ...row })), error: null };
  };

  const builder: any = {
    select: () => builder,
    insert: (data: Row) => ((op = 'insert'), (payload = data), builder),
    update: (data: Row) => ((op = 'update'), (payload = data), builder),
    eq: (col: string, value: unknown) => (filters.push([col, value]), builder),
    single: async () => {
      const res = run();
      if (res.error) return res;
      const data = res.data?.[0] ?? null;
      return { data, error: data ? null : { code: 'PGRST116', message: 'no rows' } };
    },
    maybeSingle: async () => {
      const res = run();
      if (res.error) return res;
      return { data: res.data?.[0] ?? null, error: null };
    },
    then: (resolve: (v: any) => void) => resolve(run())
  };
  return builder;
}

jest.mock('./base', () => ({
  BaseService: class {
    static async getClient() {
      return { from };
    }
  }
}));

import { rankStandings, StandingsService } from './standings';

const category = (id: number, levels: string, division = 'men', sport = 'Basketball') => ({
  id,
  division,
  levels,
  sports: { name: sport }
});
const MEN_COLLEGE = category(3, 'college');
const MEN_HIGH_SCHOOL = category(9, 'high_school');
const WOMEN_VOLLEYBALL = category(20, 'college', 'women', 'Volleyball');

function team(id: string, schoolName: string, cat: Row, record: unknown = null, extra: Row = {}): Row {
  return {
    id,
    name: `${schoolName} Team`,
    season_id: 26,
    is_active: true,
    school: {
      id: `school-${schoolName}`,
      name: schoolName,
      abbreviation: schoolName.slice(0, 3).toUpperCase(),
      logo_url: `https://res.cloudinary.com/demo/${schoolName}.png`
    },
    sports_categories: cat,
    team_standings: record,
    ...extra
  };
}

const row = (school: string, wins: number, losses: number, teamName = `${school} Team`) => ({
  teamName,
  school: { name: school },
  wins,
  losses
});

beforeEach(() => {
  Object.keys(tables).forEach((key) => delete tables[key]);
  failures = {};
  calls.length = 0;
});

describe('rankStandings', () => {
  it('orders by wins then fewer losses with competition ranks', () => {
    const result = rankStandings([row('A', 5, 3), row('B', 5, 0), row('C', 7, 1), row('D', 5, 0)]);
    expect(result.teams.map((t) => [t.school.name, t.rank])).toEqual([
      ['C', 1],
      ['B', 2],
      ['D', 2],
      ['A', 4]
    ]);
    expect(result.hasResults).toBe(true);
  });

  it('ranks a team with no games by the same rule when others have results', () => {
    const result = rankStandings([row('Z', 0, 2), row('Y', 0, 0), row('X', 2, 1)]);
    expect(result.teams.map((t) => [t.school.name, t.rank])).toEqual([
      ['X', 1],
      ['Y', 2],
      ['Z', 3]
    ]);
  });

  it('orders full ties by school then team name and gives them one rank', () => {
    const result = rankStandings([row('Zeta', 1, 1, 'Team'), row('Alpha', 1, 1, 'Team B'), row('Alpha', 1, 1, 'Team A')]);
    expect(result.teams.map((t) => t.teamName)).toEqual(['Team A', 'Team B', 'Team']);
    expect(result.teams.map((t) => t.rank)).toEqual([1, 1, 1]);
  });

  it('returns null ranks in name order when nobody has played', () => {
    const result = rankStandings([row('B', 0, 0), row('A', 0, 0)]);
    expect(result.hasResults).toBe(false);
    expect(result.teams.map((t) => [t.school.name, t.rank])).toEqual([
      ['A', null],
      ['B', null]
    ]);
  });

  it('handles empty input', () => {
    expect(rankStandings([])).toEqual({ teams: [], hasResults: false });
  });
});

describe('StandingsService.getSeasonStandings', () => {
  it('maps missing records to 0-0 and keeps only active teams of the season', async () => {
    tables.schools_teams = [
      team('t1', 'Alpha', MEN_COLLEGE, { wins: 3, losses: 1, updated_at: '2026-10-22T01:00:00.000001+00:00' }),
      team('t2', 'Beta', MEN_COLLEGE, null),
      team('t3', 'Gamma', MEN_COLLEGE, null, { is_active: false }),
      team('t4', 'Delta', MEN_COLLEGE, null, { season_id: 25 })
    ];

    const result = await StandingsService.getSeasonStandings(26);

    expect(result).toEqual({
      success: true,
      data: {
        seasonId: 26,
        categories: [
          {
            category: { id: 3, sportName: 'Basketball', division: 'men', levels: 'college', name: "Basketball · Men's College" },
            hasResults: true,
            teams: [
              {
                teamId: 't1',
                teamName: 'Alpha Team',
                school: {
                  id: 'school-Alpha',
                  name: 'Alpha',
                  abbreviation: 'ALP',
                  logoUrl: 'https://res.cloudinary.com/demo/Alpha.png'
                },
                wins: 3,
                losses: 1,
                rank: 1,
                updatedAt: '2026-10-22T01:00:00.000001+00:00'
              },
              {
                teamId: 't2',
                teamName: 'Beta Team',
                school: {
                  id: 'school-Beta',
                  name: 'Beta',
                  abbreviation: 'BET',
                  logoUrl: 'https://res.cloudinary.com/demo/Beta.png'
                },
                wins: 0,
                losses: 0,
                rank: 2,
                updatedAt: null
              }
            ]
          }
        ]
      }
    });
  });

  it('maps team_standings given as an object, a one-element array, an empty array or null', async () => {
    const stamp = '2026-10-22T01:00:00+00:00';
    tables.schools_teams = [
      team('t1', 'Alpha', MEN_COLLEGE, { wins: 4, losses: 0, updated_at: stamp }),
      team('t2', 'Beta', MEN_COLLEGE, [{ wins: 3, losses: 0, updated_at: stamp }]),
      team('t3', 'Gamma', MEN_COLLEGE, []),
      team('t4', 'Delta', MEN_COLLEGE, null)
    ];

    const result = await StandingsService.getSeasonStandings(26);

    if (!result.success) throw new Error(result.error);
    expect(result.data.categories[0].teams.map((t) => [t.teamId, t.wins, t.updatedAt])).toEqual([
      ['t1', 4, stamp],
      ['t2', 3, stamp],
      ['t4', 0, null],
      ['t3', 0, null]
    ]);
  });

  it('groups by category, ranks each independently, and orders by sport name then category id', async () => {
    tables.schools_teams = [
      team('v1', 'Alpha', WOMEN_VOLLEYBALL, { wins: 0, losses: 2, updated_at: '2026-10-22T01:00:00+00:00' }),
      team('h1', 'Beta', MEN_HIGH_SCHOOL, { wins: 1, losses: 4, updated_at: '2026-10-22T01:00:00+00:00' }),
      team('c1', 'Gamma', MEN_COLLEGE, { wins: 9, losses: 0, updated_at: '2026-10-22T01:00:00+00:00' }),
      team('c2', 'Alpha', MEN_COLLEGE, null)
    ];

    const result = await StandingsService.getSeasonStandings(26);

    if (!result.success) throw new Error(result.error);
    expect(
      result.data.categories.map((c) => [c.category.name, c.teams.map((t) => [t.teamId, t.rank])])
    ).toEqual([
      ["Basketball · Men's College", [['c1', 1], ['c2', 2]]],
      ["Basketball · Men's High School", [['h1', 1]]],
      ["Volleyball · Women's College", [['v1', 1]]]
    ]);
  });

  it('maps an empty school logo to null', async () => {
    tables.schools_teams = [
      team('t1', 'Alpha', MEN_COLLEGE, null, {
        school: { id: 'school-Alpha', name: 'Alpha', abbreviation: 'ALP', logo_url: '' }
      })
    ];

    const result = await StandingsService.getSeasonStandings(26);

    if (!result.success) throw new Error(result.error);
    expect(result.data.categories[0].teams[0].school.logoUrl).toBeNull();
  });

  it('returns an empty category list when the season has no active teams', async () => {
    tables.schools_teams = [team('t1', 'Alpha', MEN_COLLEGE, null, { is_active: false })];
    expect(await StandingsService.getSeasonStandings(26)).toEqual({
      success: true,
      data: { seasonId: 26, categories: [] }
    });
  });

  it('returns a generic SERVER error without database details', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    failures['schools_teams.select'] = { code: '42P01', message: 'relation "public.team_standings" does not exist' };

    expect(await StandingsService.getSeasonStandings(26)).toEqual({
      success: false,
      code: 'SERVER',
      error: 'Could not load standings.'
    });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
