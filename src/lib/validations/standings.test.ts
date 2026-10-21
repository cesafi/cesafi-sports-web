import { z } from 'zod';
import {
  standingsSearchParamsSchema,
  standingsSeasonIdSchema,
  updateTeamStandingSchema
} from './standings';

const valid = {
  teamId: '3f1c2b7e-4a5d-4e6f-9a1b-2c3d4e5f6a7b',
  wins: 5,
  losses: 2,
  expectedUpdatedAt: null
};

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
    ['bad team id', { teamId: 'abc' }, 'teamId', 'Invalid team.']
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
