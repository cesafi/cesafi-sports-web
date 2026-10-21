jest.mock('@/services/auth', () => ({ AuthService: { checkAuth: jest.fn() } }));
jest.mock('@/services/standings', () => ({
  StandingsService: { getSeasonStandings: jest.fn(), saveRecord: jest.fn() }
}));
jest.mock('@/lib/utils/revalidation', () => ({ RevalidationHelper: { revalidateStandings: jest.fn() } }));

import { getStandings, updateTeamStanding } from './standings';
import { AuthService } from '@/services/auth';
import { StandingsService } from '@/services/standings';
import { RevalidationHelper } from '@/lib/utils/revalidation';

const checkAuth = AuthService.checkAuth as jest.Mock;
const saveRecord = StandingsService.saveRecord as jest.Mock;
const getSeasonStandings = StandingsService.getSeasonStandings as jest.Mock;
const revalidateStandings = RevalidationHelper.revalidateStandings as jest.Mock;

const ADMIN = { authenticated: true, authorized: true, userRole: 'admin' };
const TEAM = '3f1c2b7e-4a5d-4e6f-9a1b-2c3d4e5f6a7b';
const INPUT = { teamId: TEAM, wins: 5, losses: 2, expectedUpdatedAt: null };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('updateTeamStanding', () => {
  it('rejects a signed-out request without saving', async () => {
    checkAuth.mockResolvedValue({ authenticated: false, authorized: false });

    expect(await updateTeamStanding(INPUT)).toEqual({
      success: false,
      code: 'UNAUTHENTICATED',
      error: 'You must be signed in to update standings.'
    });
    expect(saveRecord).not.toHaveBeenCalled();
  });

  it('rejects a league operator without saving', async () => {
    checkAuth.mockResolvedValue({ authenticated: true, authorized: false, userRole: 'league_operator' });

    expect(await updateTeamStanding(INPUT)).toEqual({
      success: false,
      code: 'FORBIDDEN',
      error: 'You do not have permission to update standings.'
    });
    expect(saveRecord).not.toHaveBeenCalled();
  });

  it('asks for the admin role', async () => {
    checkAuth.mockResolvedValue(ADMIN);
    saveRecord.mockResolvedValue({ success: true, data: { teamId: TEAM, wins: 5, losses: 2, updatedAt: 'x' } });

    await updateTeamStanding(INPUT);

    expect(checkAuth).toHaveBeenCalledWith(['admin']);
  });

  it('rejects invalid input with field errors and without saving', async () => {
    checkAuth.mockResolvedValue(ADMIN);

    expect(await updateTeamStanding({ ...INPUT, wins: -1 })).toEqual({
      success: false,
      code: 'VALIDATION',
      error: 'Please fix the highlighted fields.',
      fieldErrors: { wins: ['Wins must be a whole number from 0 to 999.'] }
    });
    expect(saveRecord).not.toHaveBeenCalled();
  });

  it('returns the saved record and revalidates the standings pages once', async () => {
    const saved = { success: true, data: { teamId: TEAM, wins: 5, losses: 2, updatedAt: '2026-10-22T05:00:00+00:00' } };
    checkAuth.mockResolvedValue(ADMIN);
    saveRecord.mockResolvedValue(saved);

    expect(await updateTeamStanding(INPUT)).toBe(saved);
    expect(saveRecord).toHaveBeenCalledWith(INPUT);
    expect(revalidateStandings).toHaveBeenCalledTimes(1);
  });

  it('does not revalidate when saving fails', async () => {
    const conflict = { success: false, code: 'CONFLICT', error: 'changed' };
    checkAuth.mockResolvedValue(ADMIN);
    saveRecord.mockResolvedValue(conflict);

    expect(await updateTeamStanding(INPUT)).toBe(conflict);
    expect(revalidateStandings).not.toHaveBeenCalled();
  });
});

describe('getStandings', () => {
  it('rejects a non-numeric season id without calling the service', async () => {
    expect(await getStandings('26')).toEqual({ success: false, code: 'VALIDATION', error: 'Invalid season.' });
    expect(getSeasonStandings).not.toHaveBeenCalled();
  });

  it('returns the service result for a valid season', async () => {
    const result = { success: true, data: { seasonId: 26, categories: [] } };
    getSeasonStandings.mockResolvedValue(result);

    expect(await getStandings(26)).toBe(result);
    expect(getSeasonStandings).toHaveBeenCalledWith(26);
  });
});
