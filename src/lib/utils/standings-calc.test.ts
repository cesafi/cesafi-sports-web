import {
  formatPointDiff,
  isStandingsStage,
  manilaDate,
  POINTS_PER_WIN,
  rankStandings,
  StandingsMatch,
  tallyMatches
} from './standings-calc';

const m = (scheduledAt: string | null, ...participants: [string, number | null][]): StandingsMatch => ({
  scheduledAt,
  participants: participants.map(([teamId, score]) => ({ teamId, score }))
});

const AFTER_CUTOFF = '2026-10-31T07:30:00Z';

describe('isStandingsStage', () => {
  it.each(['Elimination Round', 'elimination_round', 'Group Stage', 'group_stage', 'Round Robin'])(
    'counts %s',
    (stage) => expect(isStandingsStage(stage)).toBe(true)
  );

  it.each(['Play-ins', 'Quarterfinals', 'Semifinals', 'Playoffs', 'Finals', ''])('ignores %p', (stage) =>
    expect(isStandingsStage(stage)).toBe(false)
  );
});

describe('manilaDate', () => {
  it('uses the Manila calendar day', () => {
    expect(manilaDate('2026-10-29T15:30:00Z')).toBe('2026-10-29');
    expect(manilaDate('2026-10-29T16:30:00Z')).toBe('2026-10-30');
  });
});

describe('tallyMatches', () => {
  it('gives the winner a win, the loser a loss, and both the score difference', () => {
    const tally = tallyMatches([m(AFTER_CUTOFF, ['A', 78], ['B', 65])], null);
    expect(tally.get('A')).toEqual({ wins: 1, losses: 0, pointDiff: 13 });
    expect(tally.get('B')).toEqual({ wins: 0, losses: 1, pointDiff: -13 });
  });

  it('adds up several matches per team', () => {
    const tally = tallyMatches(
      [m(AFTER_CUTOFF, ['A', 78], ['B', 65]), m(AFTER_CUTOFF, ['C', 90], ['A', 70])],
      null
    );
    expect(tally.get('A')).toEqual({ wins: 1, losses: 1, pointDiff: -7 });
  });

  it('skips a late-evening game on the cut-off date and counts one after Manila midnight', () => {
    expect(tallyMatches([m('2026-10-29T15:30:00Z', ['A', 80], ['B', 70])], '2026-10-29').has('A')).toBe(false);
    expect(tallyMatches([m('2026-10-29T16:30:00Z', ['A', 80], ['B', 70])], '2026-10-29').get('A')).toEqual({
      wins: 1,
      losses: 0,
      pointDiff: 10
    });
  });

  it('counts every match when there is no cut-off', () => {
    expect(tallyMatches([m('2026-10-17T07:30:00Z', ['A', 80], ['B', 70])], null).get('B')?.losses).toBe(1);
  });

  it('counts a match with no scheduled date even with a cut-off', () => {
    expect(tallyMatches([m(null, ['A', 80], ['B', 70])], '2026-10-29').get('A')?.wins).toBe(1);
  });

  it.each([
    ['still 0-0 (finished before scores were entered)', m(AFTER_CUTOFF, ['A', 0], ['B', 0])],
    ['tied', m(AFTER_CUTOFF, ['A', 70], ['B', 70])],
    ['missing a score', m(AFTER_CUTOFF, ['A', 70], ['B', null])],
    ['one team', m(AFTER_CUTOFF, ['A', 70])],
    ['three teams', m(AFTER_CUTOFF, ['A', 70], ['B', 60], ['C', 50])]
  ])('skips a match that is %s', (_label, match) => {
    expect(tallyMatches([match], null).size).toBe(0);
  });
});

describe('rankStandings', () => {
  const row = (school: string, wins: number, losses: number, pointDiff: number, teamName = `${school} Team`) => ({
    teamName,
    school: { name: school },
    wins,
    losses,
    pointDiff,
    points: POINTS_PER_WIN * wins
  });

  it('orders by points, then fewer losses, then +/- with ranks 1 to n', () => {
    const result = rankStandings([row('CEC', 3, 4, -29), row('UV', 3, 4, 37), row('SHS', 6, 0, 71), row('UCM', 7, 3, 150)]);
    expect(result.teams.map((t) => [t.school.name, t.rank])).toEqual([
      ['UCM', 1],
      ['SHS', 2],
      ['UV', 3],
      ['CEC', 4]
    ]);
    expect(result.hasResults).toBe(true);
  });

  it('orders equal records by school then team name without sharing a rank', () => {
    const result = rankStandings([row('Zeta', 1, 1, 5, 'Team'), row('Alpha', 1, 1, 5, 'Team B'), row('Alpha', 1, 1, 5, 'Team A')]);
    expect(result.teams.map((t) => [t.teamName, t.rank])).toEqual([
      ['Team A', 1],
      ['Team B', 2],
      ['Team', 3]
    ]);
  });

  it('returns null ranks when nobody has played', () => {
    const result = rankStandings([row('B', 0, 0, 0), row('A', 0, 0, 0)]);
    expect(result.hasResults).toBe(false);
    expect(result.teams.map((t) => t.rank)).toEqual([null, null]);
  });

  it('handles an empty category', () => {
    expect(rankStandings([])).toEqual({ teams: [], hasResults: false });
  });
});

describe('formatPointDiff', () => {
  it('signs positive values and uses a true minus for negatives', () => {
    expect(formatPointDiff(100)).toBe('+100');
    expect(formatPointDiff(-1)).toBe('−1');
    expect(formatPointDiff(0)).toBe('0');
  });
});
