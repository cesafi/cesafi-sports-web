jest.mock('@/services/matches', () => ({ MatchService: {} }));
jest.mock('@/lib/utils/revalidation', () => ({ RevalidationHelper: {} }));
jest.mock('./seasons', () => ({ getAllSeasons: jest.fn() }));

import { getAvailableSeasons } from './matches';
import { getAllSeasons } from './seasons';

const getAllSeasonsMock = getAllSeasons as jest.Mock;

const season = (id: number, start_at: string) => ({
  id,
  start_at,
  end_at: '2030-01-01T00:00:00+00:00',
  created_at: '2026-01-01T00:00:00+00:00',
  updated_at: '2026-01-01T00:00:00+00:00'
});

describe('getAvailableSeasons', () => {
  it('lists every season, newest start first', async () => {
    getAllSeasonsMock.mockResolvedValue({
      success: true,
      data: [season(24, '2024-08-01T00:00:00+00:00'), season(26, '2026-08-01T00:00:00+00:00'), season(25, '2025-08-01T00:00:00+00:00')]
    });

    const result = await getAvailableSeasons();

    if (!result.success) throw new Error(result.error);
    expect(result.data.map((s) => s.id)).toEqual([26, 25, 24]);
  });

  it('passes a failure through unchanged', async () => {
    const failure = { success: false, error: 'Failed to fetch seasons' };
    getAllSeasonsMock.mockResolvedValue(failure);

    expect(await getAvailableSeasons()).toBe(failure);
  });
});
