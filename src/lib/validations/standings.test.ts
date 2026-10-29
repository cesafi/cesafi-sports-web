import { z } from 'zod';
import {
  standingsSearchParamsSchema,
  standingsSeasonIdSchema,
  updateStandingsCutoffSchema,
  updateTeamStandingSchema
} from './standings';

const valid = {
  teamId: '3f1c2b7e-4a5d-4e6f-9a1b-2c3d4e5f6a7b',
  wins: 5,
  losses: 2,
  pointDiff: 0,
  expectedUpdatedAt: null
};

const POINT_DIFF_MESSAGE = '+/− must be a whole number from -9999 to 9999.';

describe('updateTeamStandingSchema', () => {
  it('accepts a first save, a save with a Postgres timestamp, and the 0 and 999 bounds', () => {
    expect(updateTeamStandingSchema.safeParse(valid).success).toBe(true);
    expect(
      updateTeamStandingSchema.safeParse({
        ...valid,
        expectedUpdatedAt: '2026-10-22T03:04:05.123456+00:00'
      }).success
    ).toBe(true);
    expect(updateTeamStandingSchema.safeParse({ ...valid, wins: 0, losses: 999 }).success).toBe(true);
  });

  it.each([
    ['negative wins', { wins: -1 }, 'wins', 'Wins must be a whole number from 0 to 999.'],
    ['decimal losses', { losses: 2.5 }, 'losses', 'Losses must be a whole number from 0 to 999.'],
    ['wins over 999', { wins: 1000 }, 'wins', 'Wins must be a whole number from 0 to 999.'],
    ['string wins', { wins: '5' }, 'wins', 'Wins must be a whole number from 0 to 999.'],
    ['bad team id', { teamId: 'abc' }, 'teamId', 'Invalid team.'],
    ['+/- below -9999', { pointDiff: -10000 }, 'pointDiff', POINT_DIFF_MESSAGE],
    ['+/- over 9999', { pointDiff: 10000 }, 'pointDiff', POINT_DIFF_MESSAGE],
    ['decimal +/-', { pointDiff: 1.5 }, 'pointDiff', POINT_DIFF_MESSAGE],
    ['string +/-', { pointDiff: '5' }, 'pointDiff', POINT_DIFF_MESSAGE],
    ['missing +/-', { pointDiff: undefined }, 'pointDiff', POINT_DIFF_MESSAGE]
  ])('rejects %s', (_label, patch, field, message) => {
    const result = updateTeamStandingSchema.safeParse({ ...valid, ...patch });
    expect(result.success).toBe(false);
    const fieldErrors = z.flattenError(result.error!).fieldErrors as Record<string, string[]>;
    expect(fieldErrors[field]).toEqual([message]);
  });

  it('rejects a malformed timestamp', () => {
    expect(updateTeamStandingSchema.safeParse({ ...valid, expectedUpdatedAt: 'yesterday' }).success).toBe(false);
  });

  it('rejects missing fields', () => {
    const { losses: _omit, ...missing } = valid;
    expect(updateTeamStandingSchema.safeParse(missing).success).toBe(false);
  });

  it('rejects extra fields', () => {
    expect(updateTeamStandingSchema.safeParse({ ...valid, rank: 1 }).success).toBe(false);
  });
});

describe('updateTeamStandingSchema pointDiff', () => {
  it.each([-9999, 0, 9999])('accepts %p', (pointDiff) => {
    expect(updateTeamStandingSchema.safeParse({ ...valid, pointDiff }).success).toBe(true);
  });
});

describe('updateStandingsCutoffSchema', () => {
  const cutoff = { seasonId: 26, sportCategoryId: 3, countedThrough: '2026-10-29' };

  it('accepts a date and null (clear)', () => {
    expect(updateStandingsCutoffSchema.safeParse(cutoff).success).toBe(true);
    expect(updateStandingsCutoffSchema.safeParse({ ...cutoff, countedThrough: null }).success).toBe(true);
  });

  it.each(['2026-13-01', '29/10/2026', ''])('rejects the date %p', (countedThrough) => {
    const result = updateStandingsCutoffSchema.safeParse({ ...cutoff, countedThrough });
    expect(result.success).toBe(false);
    expect(z.flattenError(result.error!).fieldErrors.countedThrough).toEqual(['Enter a valid date.']);
  });

  it('rejects extra fields and a bad season', () => {
    expect(updateStandingsCutoffSchema.safeParse({ ...cutoff, extra: 1 }).success).toBe(false);
    expect(updateStandingsCutoffSchema.safeParse({ ...cutoff, seasonId: 0 }).success).toBe(false);
  });
});

describe('standingsSeasonIdSchema', () => {
  it('accepts a positive integer', () => {
    expect(standingsSeasonIdSchema.safeParse(26).success).toBe(true);
  });

  it.each([0, -1, 1.5, '26'])('rejects %p', (value) => {
    expect(standingsSeasonIdSchema.safeParse(value).success).toBe(false);
  });
});

describe('standingsSearchParamsSchema', () => {
  it('coerces numeric strings', () => {
    expect(standingsSearchParamsSchema.parse({ season: '26', category: '3' })).toEqual({ season: 26, category: 3 });
  });

  it('falls back to undefined on junk or missing values', () => {
    expect(standingsSearchParamsSchema.parse({ season: 'abc', category: '-2' })).toEqual({
      season: undefined,
      category: undefined
    });
    expect(standingsSearchParamsSchema.parse({})).toEqual({ season: undefined, category: undefined });
  });
});
