/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;
type DbError = { code?: string; message: string };

const tables: Record<string, Row[]> = {};
// Injected failures keyed by `${table}.${operation}`, e.g. 'team_standings.insert'
let failures: Record<string, DbError> = {};
const calls: { table: string; op: string; payload: Row | null; filters: [string, unknown][] }[] = [];

const INSERTED_AT = '2026-10-22T05:00:00.000001+00:00';
const UPDATED_AT = '2026-10-22T06:00:00.000002+00:00';

// Dotted columns filter on an embedded row (object or one-element array), like PostgREST `!inner`.
const valueAt = (row: Row, column: string): unknown =>
  column.split('.').reduce<unknown>((value, key) => {
    const node = Array.isArray(value) ? value[0] : value;
    return node == null ? undefined : (node as Row)[key];
  }, row);

function from(table: string) {
  const filters: [string, unknown][] = [];
  let op: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  let payload: Row | null = null;
  let conflictColumns: string[] = [];

  const run = (): { data: Row[] | null; error: DbError | null } => {
    calls.push({ table, op, payload, filters: [...filters] });
    const injected = failures[`${table}.${op}`];
    if (injected) return { data: null, error: injected };

    const rows = (tables[table] ??= []);
    const matches = (row: Row) => filters.every(([col, value]) => valueAt(row, col) === value);

    if (op === 'upsert') {
      const existing = rows.find((row) => conflictColumns.every((col) => row[col] === payload![col]));
      if (existing) Object.assign(existing, payload, { updated_at: UPDATED_AT });
      else rows.push({ ...payload, created_at: INSERTED_AT, updated_at: INSERTED_AT });
      return { data: null, error: null };
    }
    if (op === 'delete') {
      tables[table] = rows.filter((row) => !matches(row));
      return { data: null, error: null };
    }
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
    upsert: (data: Row, options: { onConflict: string }) => (
      (op = 'upsert'), (payload = data), (conflictColumns = options.onConflict.split(',')), builder
    ),
    delete: () => ((op = 'delete'), builder),
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

import { StandingsService } from './standings';

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

const ZERO = { wins: 0, losses: 0, pointDiff: 0 };
const AFTER_CUTOFF = '2026-10-31T07:30:00+00:00';
const BEFORE_CUTOFF = '2026-10-25T07:30:00+00:00';

function match(
  id: number,
  catId: number,
  stage: string,
  at: string | null,
  participants: [string, number | null][],
  status = 'finished',
  extra: Row = {}
): Row {
  return {
    id,
    status,
    scheduled_at: at,
    sports_seasons_stages: { season_id: 26, sport_category_id: catId, competition_stage: stage },
    match_participants: participants.map(([team_id, match_score]) => ({ team_id, match_score })),
    ...extra
  };
}

const cutoff = (sportCategoryId: number, countedThrough: string) => ({
  season_id: 26,
  sport_category_id: sportCategoryId,
  counted_through: countedThrough
});

beforeEach(() => {
  Object.keys(tables).forEach((key) => delete tables[key]);
  failures = {};
  calls.length = 0;
});

describe('StandingsService.getSeasonStandings', () => {
  it('maps missing records to 0-0 and keeps only active teams of the season', async () => {
    tables.schools_teams = [
      team('t1', 'Alpha', MEN_COLLEGE, { wins: 3, losses: 1, point_diff: 12, updated_at: '2026-10-22T01:00:00.000001+00:00' }),
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
            countedThrough: null,
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
                starting: { wins: 3, losses: 1, pointDiff: 12 },
                fromMatches: ZERO,
                wins: 3,
                losses: 1,
                pointDiff: 12,
                points: 9,
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
                starting: ZERO,
                fromMatches: ZERO,
                wins: 0,
                losses: 0,
                pointDiff: 0,
                points: 0,
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

  it('adds finished matches after the cut-off to the starting record', async () => {
    tables.schools_teams = [
      team('a', 'Alpha', MEN_COLLEGE, { wins: 9, losses: 1, point_diff: 100, updated_at: '2026-10-22T01:00:00+00:00' }),
      team('b', 'Beta', MEN_COLLEGE, { wins: 7, losses: 3, point_diff: 83, updated_at: '2026-10-22T01:00:00+00:00' })
    ];
    tables.matches = [match(1, 3, 'Elimination Round', AFTER_CUTOFF, [['a', 80], ['b', 70]])];
    tables.standings_cutoffs = [cutoff(3, '2026-10-29')];

    const result = await StandingsService.getSeasonStandings(26);

    if (!result.success) throw new Error(result.error);
    const [category] = result.data.categories;
    expect(category.countedThrough).toBe('2026-10-29');
    expect(category.teams[0]).toMatchObject({
      teamId: 'a',
      starting: { wins: 9, losses: 1, pointDiff: 100 },
      fromMatches: { wins: 1, losses: 0, pointDiff: 10 },
      wins: 10,
      losses: 1,
      pointDiff: 110,
      points: 30,
      rank: 1
    });
    expect(category.teams[1]).toMatchObject({ teamId: 'b', wins: 7, losses: 4, pointDiff: 73, points: 21 });
  });

  it('skips matches dated on or before the cut-off', async () => {
    tables.schools_teams = [team('a', 'Alpha', MEN_COLLEGE), team('b', 'Beta', MEN_COLLEGE)];
    tables.matches = [match(1, 3, 'Elimination Round', BEFORE_CUTOFF, [['a', 80], ['b', 70]])];
    tables.standings_cutoffs = [cutoff(3, '2026-10-29')];

    const result = await StandingsService.getSeasonStandings(26);

    if (!result.success) throw new Error(result.error);
    expect(result.data.categories[0].teams.map((t) => t.fromMatches)).toEqual([ZERO, ZERO]);
    expect(result.data.categories[0].hasResults).toBe(false);
  });

  it('ignores unfinished matches, playoff stages, other categories and other seasons', async () => {
    tables.schools_teams = [team('a', 'Alpha', MEN_COLLEGE), team('b', 'Beta', MEN_COLLEGE)];
    tables.matches = [
      match(1, 3, 'Elimination Round', AFTER_CUTOFF, [['a', 80], ['b', 70]], 'upcoming'),
      match(2, 3, 'Playoffs', AFTER_CUTOFF, [['a', 80], ['b', 70]]),
      match(3, 9, 'Elimination Round', AFTER_CUTOFF, [['a', 80], ['b', 70]]),
      match(4, 3, 'Elimination Round', AFTER_CUTOFF, [['a', 80], ['b', 70]], 'finished', {
        sports_seasons_stages: { season_id: 25, sport_category_id: 3, competition_stage: 'Elimination Round' }
      })
    ];

    const result = await StandingsService.getSeasonStandings(26);

    if (!result.success) throw new Error(result.error);
    expect(result.data.categories[0].teams.map((t) => t.fromMatches)).toEqual([ZERO, ZERO]);
  });

  it('reads the stage whether it is embedded as an object or a one-element array', async () => {
    tables.schools_teams = [team('a', 'Alpha', MEN_COLLEGE), team('b', 'Beta', MEN_COLLEGE)];
    tables.matches = [
      match(1, 3, 'Elimination Round', AFTER_CUTOFF, [['a', 80], ['b', 70]]),
      match(2, 3, 'Elimination Round', AFTER_CUTOFF, [['a', 60], ['b', 70]], 'finished', {
        sports_seasons_stages: [{ season_id: 26, sport_category_id: 3, competition_stage: 'Elimination Round' }]
      }),
      match(3, 3, 'Elimination Round', AFTER_CUTOFF, [], 'finished')
    ];

    const result = await StandingsService.getSeasonStandings(26);

    if (!result.success) throw new Error(result.error);
    expect(result.data.categories[0].teams.find((t) => t.teamId === 'a')?.fromMatches).toEqual({
      wins: 1,
      losses: 1,
      pointDiff: 0
    });
  });

  it('still counts the result for a team whose opponent is not an active team of the category', async () => {
    tables.schools_teams = [team('a', 'Alpha', MEN_COLLEGE), team('gone', 'Gone', MEN_COLLEGE, null, { is_active: false })];
    tables.matches = [match(1, 3, 'Elimination Round', AFTER_CUTOFF, [['a', 80], ['gone', 70]])];

    const result = await StandingsService.getSeasonStandings(26);

    if (!result.success) throw new Error(result.error);
    expect(result.data.categories[0].teams).toHaveLength(1);
    expect(result.data.categories[0].teams[0]).toMatchObject({ teamId: 'a', wins: 1, losses: 0, pointDiff: 10 });
  });

  it('returns SERVER when the matches query fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    tables.schools_teams = [team('a', 'Alpha', MEN_COLLEGE)];
    failures['matches.select'] = { code: '42P01', message: 'relation "public.matches" does not exist' };

    expect(await StandingsService.getSeasonStandings(26)).toEqual({
      success: false,
      code: 'SERVER',
      error: 'Could not load standings.'
    });
    consoleError.mockRestore();
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

describe('StandingsService.saveRecord', () => {
  const TEAM = '3f1c2b7e-4a5d-4e6f-9a1b-2c3d4e5f6a7b';
  const LOADED_AT = '2026-10-22T01:00:00.123456+00:00';
  const CONFLICT_MESSAGE = "Someone else updated this team's record. The latest numbers have been loaded.";

  it('inserts when there is no record yet', async () => {
    tables.team_standings = [];

    const result = await StandingsService.saveRecord({ teamId: TEAM, wins: 5, losses: 2, pointDiff: -12, expectedUpdatedAt: null });

    expect(result).toEqual({ success: true, data: { teamId: TEAM, wins: 5, losses: 2, pointDiff: -12, updatedAt: INSERTED_AT } });
    expect(calls.find((c) => c.op === 'insert')?.payload).toEqual({ team_id: TEAM, wins: 5, losses: 2, point_diff: -12 });
  });

  it('updates when updated_at matches the loaded value', async () => {
    tables.team_standings = [{ team_id: TEAM, wins: 1, losses: 1, point_diff: 0, updated_at: LOADED_AT }];

    const result = await StandingsService.saveRecord({ teamId: TEAM, wins: 5, losses: 2, pointDiff: -12, expectedUpdatedAt: LOADED_AT });

    expect(result).toEqual({ success: true, data: { teamId: TEAM, wins: 5, losses: 2, pointDiff: -12, updatedAt: UPDATED_AT } });
    const update = calls.find((c) => c.op === 'update');
    expect(update?.payload).toEqual({ wins: 5, losses: 2, point_diff: -12 });
    expect(update?.filters).toEqual([
      ['team_id', TEAM],
      ['updated_at', LOADED_AT]
    ]);
  });

  it('reports CONFLICT and changes nothing when the record changed since it was loaded', async () => {
    tables.team_standings = [{ team_id: TEAM, wins: 4, losses: 0, updated_at: '2026-10-22T02:00:00+00:00' }];

    const result = await StandingsService.saveRecord({ teamId: TEAM, wins: 5, losses: 2, pointDiff: -12, expectedUpdatedAt: LOADED_AT });

    expect(result).toEqual({ success: false, code: 'CONFLICT', error: CONFLICT_MESSAGE });
    expect(tables.team_standings[0]).toMatchObject({ wins: 4, losses: 0 });
  });

  it('reports NOT_FOUND when the update hits nothing and no record exists', async () => {
    tables.team_standings = [];

    const result = await StandingsService.saveRecord({ teamId: TEAM, wins: 5, losses: 2, pointDiff: -12, expectedUpdatedAt: LOADED_AT });

    expect(result).toEqual({ success: false, code: 'NOT_FOUND', error: 'This team no longer exists.' });
  });

  it.each([
    ['23505', 'CONFLICT', CONFLICT_MESSAGE],
    ['23503', 'NOT_FOUND', 'This team no longer exists.'],
    ['23514', 'VALIDATION', 'Please fix the highlighted fields.']
  ])('maps insert error %s to %s', async (dbCode, code, error) => {
    failures['team_standings.insert'] = { code: dbCode, message: 'violates constraint "team_standings_pkey"' };

    const result = await StandingsService.saveRecord({ teamId: TEAM, wins: 5, losses: 2, pointDiff: -12, expectedUpdatedAt: null });

    expect(result).toEqual({ success: false, code, error });
  });

  it('reports a generic SERVER error for anything else, without database details', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    failures['team_standings.update'] = { code: '57014', message: 'canceling statement due to statement timeout' };

    const result = await StandingsService.saveRecord({ teamId: TEAM, wins: 5, losses: 2, pointDiff: -12, expectedUpdatedAt: LOADED_AT });

    expect(result).toEqual({ success: false, code: 'SERVER', error: 'Could not save the record. Please try again.' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('StandingsService.saveCutoff', () => {
  const INPUT = { seasonId: 26, sportCategoryId: 3, countedThrough: '2026-10-29' };

  it('creates the cut-off for a category', async () => {
    const result = await StandingsService.saveCutoff(INPUT);

    expect(result).toEqual({ success: true, data: INPUT });
    expect(tables.standings_cutoffs).toEqual([
      expect.objectContaining({ season_id: 26, sport_category_id: 3, counted_through: '2026-10-29' })
    ]);
  });

  it('replaces an existing cut-off', async () => {
    tables.standings_cutoffs = [cutoff(3, '2026-10-29'), cutoff(9, '2026-10-29')];

    await StandingsService.saveCutoff({ ...INPUT, countedThrough: '2026-11-15' });

    expect(tables.standings_cutoffs.map((c) => [c.sport_category_id, c.counted_through])).toEqual([
      [3, '2026-11-15'],
      [9, '2026-10-29']
    ]);
  });

  it('deletes the cut-off when cleared', async () => {
    tables.standings_cutoffs = [cutoff(3, '2026-10-29'), cutoff(9, '2026-10-29')];

    const result = await StandingsService.saveCutoff({ ...INPUT, countedThrough: null });

    expect(result).toEqual({ success: true, data: { ...INPUT, countedThrough: null } });
    expect(tables.standings_cutoffs.map((c) => c.sport_category_id)).toEqual([9]);
  });

  it('reports NOT_FOUND when the season or category is gone', async () => {
    failures['standings_cutoffs.upsert'] = { code: '23503', message: 'violates foreign key constraint' };

    expect(await StandingsService.saveCutoff(INPUT)).toEqual({
      success: false,
      code: 'NOT_FOUND',
      error: 'This season or category no longer exists.'
    });
  });

  it('reports a generic SERVER error for anything else', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    failures['standings_cutoffs.delete'] = { code: '57014', message: 'statement timeout' };

    expect(await StandingsService.saveCutoff({ ...INPUT, countedThrough: null })).toEqual({
      success: false,
      code: 'SERVER',
      error: 'Could not save the cut-off date. Please try again.'
    });
    consoleError.mockRestore();
  });
});
