jest.mock('@/services/auth', () => ({ AuthService: { checkAuth: jest.fn() } }));
jest.mock('@/services/standings', () => ({
  StandingsService: { getSeasonStandings: jest.fn(), saveRecord: jest.fn(), saveCutoff: jest.fn() }
}));
jest.mock('@/lib/utils/revalidation', () => ({ RevalidationHelper: { revalidateStandings: jest.fn() } }));

import { getStandings, updateStandingsCutoff, updateTeamStanding } from './standings';
import { AuthService } from '@/services/auth';
import { StandingsService } from '@/services/standings';
import { RevalidationHelper } from '@/lib/utils/revalidation';

const checkAuth = AuthService.checkAuth as jest.Mock;
const saveRecord = StandingsService.saveRecord as jest.Mock;
const getSeasonStandings = StandingsService.getSeasonStandings as jest.Mock;
const saveCutoff = StandingsService.saveCutoff as jest.Mock;
const revalidateStandings = RevalidationHelper.revalidateStandings as jest.Mock;

const ADMIN = { authenticated: true, authorized: true, userRole: 'admin' };
const TEAM = '3f1c2b7e-4a5d-4e6f-9a1b-2c3d4e5f6a7b';
const INPUT = { teamId: TEAM, wins: 5, losses: 2, pointDiff: -7, expectedUpdatedAt: null };

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

describe('updateStandingsCutoff', () => {
  const CUTOFF = { seasonId: 26, sportCategoryId: 3, countedThrough: '2026-10-29' };
  const SAVED = { success: true, data: CUTOFF };

  it('rejects a signed-out request without saving', async () => {
    checkAuth.mockResolvedValue({ authenticated: false, authorized: false });

    expect(await updateStandingsCutoff(CUTOFF)).toEqual({
      success: false,
      code: 'UNAUTHENTICATED',
      error: 'You must be signed in to update standings.'
    });
    expect(saveCutoff).not.toHaveBeenCalled();
  });

  it('rejects a league operator without saving', async () => {
    checkAuth.mockResolvedValue({ authenticated: true, authorized: false, userRole: 'league_operator' });

    expect(await updateStandingsCutoff(CUTOFF)).toEqual({
      success: false,
      code: 'FORBIDDEN',
      error: 'You do not have permission to update standings.'
    });
    expect(saveCutoff).not.toHaveBeenCalled();
  });

  it('asks for the admin role', async () => {
    checkAuth.mockResolvedValue(ADMIN);
    saveCutoff.mockResolvedValue(SAVED);

    await updateStandingsCutoff(CUTOFF);

    expect(checkAuth).toHaveBeenCalledWith(['admin']);
  });

  it('rejects a bad date with a field error and without saving', async () => {
    checkAuth.mockResolvedValue(ADMIN);

    expect(await updateStandingsCutoff({ ...CUTOFF, countedThrough: 'nope' })).toEqual({
      success: false,
      code: 'VALIDATION',
      error: 'Please fix the highlighted fields.',
      fieldErrors: { countedThrough: ['Enter a valid date.'] }
    });
    expect(saveCutoff).not.toHaveBeenCalled();
  });

  it('saves and revalidates the standings pages once', async () => {
    checkAuth.mockResolvedValue(ADMIN);
    saveCutoff.mockResolvedValue(SAVED);

    expect(await updateStandingsCutoff(CUTOFF)).toBe(SAVED);
    expect(saveCutoff).toHaveBeenCalledWith(CUTOFF);
    expect(revalidateStandings).toHaveBeenCalledTimes(1);
  });

  it('does not revalidate when saving fails', async () => {
    const failure = { success: false, code: 'SERVER', error: 'Could not save the cut-off date. Please try again.' };
    checkAuth.mockResolvedValue(ADMIN);
    saveCutoff.mockResolvedValue(failure);

    expect(await updateStandingsCutoff(CUTOFF)).toBe(failure);
    expect(revalidateStandings).not.toHaveBeenCalled();
  });
});
