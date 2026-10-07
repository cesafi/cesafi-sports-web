import {
  getCalendarRange,
  getNextSchedulePageParam,
  getPreviousSchedulePageParam,
  matchesScheduleFilters,
  SchedulePage
} from './schedule-pagination';

const page = (overrides: Partial<SchedulePage>): SchedulePage => ({
  matches: [],
  direction: 'future',
  hasMore: false,
  nextCursor: null,
  prevCursor: null,
  ...overrides
});

describe('getNextSchedulePageParam', () => {
  it('continues into the future from the around-today page', () => {
    const around = page({ direction: 'around', hasMoreFuture: true, futureCursor: '2026-10-20T10:00:00.000Z' });
    expect(getNextSchedulePageParam(around)).toEqual({ direction: 'future', cursor: '2026-10-20T10:00:00.000Z' });
  });

  it('stops when the around-today page has no more future matches', () => {
    const around = page({ direction: 'around', hasMoreFuture: false, futureCursor: '2026-10-20T10:00:00.000Z' });
    expect(getNextSchedulePageParam(around)).toBeUndefined();
  });

  it('pages forward from the newest match of a future page', () => {
    const future = page({ direction: 'future', hasMore: true, nextCursor: '2026-11-02T10:00:00.000Z' });
    expect(getNextSchedulePageParam(future)).toEqual({ direction: 'future', cursor: '2026-11-02T10:00:00.000Z' });
  });

  it('stops at the last future page', () => {
    expect(getNextSchedulePageParam(page({ direction: 'future', hasMore: false, nextCursor: 'x' }))).toBeUndefined();
  });

  it('returns undefined for a failed page', () => {
    expect(getNextSchedulePageParam(undefined)).toBeUndefined();
  });
});

describe('getPreviousSchedulePageParam', () => {
  it('continues into the past from the oldest match of the around-today page', () => {
    const around = page({ direction: 'around', hasMorePast: true, pastCursor: '2026-09-01T10:00:00.000Z' });
    expect(getPreviousSchedulePageParam(around)).toEqual({ direction: 'past', cursor: '2026-09-01T10:00:00.000Z' });
  });

  it('pages backward from the OLDEST match of a past page (prevCursor), not the newest', () => {
    const past = page({
      direction: 'past',
      hasMore: true,
      nextCursor: '2026-08-31T10:00:00.000Z', // newest in the desc-ordered slice
      prevCursor: '2026-08-20T10:00:00.000Z' // oldest in the slice
    });
    expect(getPreviousSchedulePageParam(past)).toEqual({ direction: 'past', cursor: '2026-08-20T10:00:00.000Z' });
  });

  it('stops at the oldest past page', () => {
    expect(getPreviousSchedulePageParam(page({ direction: 'past', hasMore: false, prevCursor: 'x' }))).toBeUndefined();
  });

  it('never pages backward from a future page', () => {
    expect(getPreviousSchedulePageParam(page({ direction: 'future', hasMore: true, prevCursor: 'x' }))).toBeUndefined();
  });
});

describe('getCalendarRange', () => {
  it('covers exactly the selected month in month view (local time)', () => {
    const { from, to } = getCalendarRange(new Date(2026, 9, 15), 'month');
    expect(new Date(from)).toEqual(new Date(2026, 9, 1, 0, 0, 0, 0));
    expect(new Date(to)).toEqual(new Date(2026, 9, 31, 23, 59, 59, 999));
  });

  it('handles February in a leap year', () => {
    const { to } = getCalendarRange(new Date(2028, 1, 1), 'month');
    expect(new Date(to)).toEqual(new Date(2028, 1, 29, 23, 59, 59, 999));
  });

  it('covers the visible Sunday–Saturday week in week view, even across months', () => {
    // Wed 2026-09-30 → week Sun 2026-09-27 .. Sat 2026-10-03
    const { from, to } = getCalendarRange(new Date(2026, 8, 30), 'week');
    expect(new Date(from)).toEqual(new Date(2026, 8, 27, 0, 0, 0, 0));
    expect(new Date(to)).toEqual(new Date(2026, 9, 3, 23, 59, 59, 999));
  });
});

describe('matchesScheduleFilters', () => {
  const match = {
    status: 'ongoing',
    sports_seasons_stages: {
      season_id: 3,
      competition_stage: 'elimination_round',
      sports_categories: { division: 'men', sports: { id: 7 } }
    },
    match_participants: [
      { schools_teams: { school: { abbreviation: 'USC' } } },
      { schools_teams: { school: { abbreviation: 'UV' } } }
    ]
  };
  const all = { season: 'all', sport: 'all', division: 'all', stage: 'all', school: 'all', status: 'all' };

  it('passes everything when no filters are applied', () => {
    expect(matchesScheduleFilters(match as never, all)).toBe(true);
  });

  it.each([
    [{ season: '3' }, true],
    [{ season: '4' }, false],
    [{ sport: '7' }, true],
    [{ sport: '8' }, false],
    [{ division: 'men' }, true],
    [{ division: 'women' }, false],
    [{ stage: 'elimination_round' }, true],
    [{ stage: 'playoffs' }, false],
    [{ school: 'UV' }, true],
    [{ school: 'CIT-U' }, false],
    [{ status: 'live' }, true],
    [{ status: 'upcoming' }, false]
  ])('applies %j → %s', (override, expected) => {
    expect(matchesScheduleFilters(match as never, { ...all, ...override })).toBe(expected);
  });
});
