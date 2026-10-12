jest.mock('@/services/auth', () => ({ AuthService: { checkAuth: jest.fn() } }));
jest.mock('@/services/match-import', () => ({ MatchImportService: { importFromCsv: jest.fn() } }));
jest.mock('@/lib/utils/revalidation', () => ({ RevalidationHelper: { revalidateMatches: jest.fn() } }));

import { importMatchesFromCsv } from './match-import';
import { AuthService } from '@/services/auth';
import { MatchImportService } from '@/services/match-import';
import { RevalidationHelper } from '@/lib/utils/revalidation';
import { MATCH_IMPORT_MAX_BYTES } from '@/lib/validations/match-import';

const checkAuth = AuthService.checkAuth as jest.Mock;
const importFromCsv = MatchImportService.importFromCsv as jest.Mock;
const revalidateMatches = RevalidationHelper.revalidateMatches as jest.Mock;

const ADMIN = { authenticated: true, authorized: true, userRole: 'admin' };
const CSV = 'Match ID,Match Participants\nM-1,A vs. B';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('importMatchesFromCsv', () => {
  it('rejects a signed-out request without importing', async () => {
    checkAuth.mockResolvedValue({ authenticated: false, authorized: false });
    expect(await importMatchesFromCsv(10, CSV)).toEqual({
      success: false,
      error: 'You must be signed in to import matches.'
    });
    expect(importFromCsv).not.toHaveBeenCalled();
  });

  it('rejects a league operator without importing', async () => {
    checkAuth.mockResolvedValue({ authenticated: true, authorized: false, userRole: 'league_operator' });
    expect(await importMatchesFromCsv(10, CSV)).toEqual({
      success: false,
      error: 'You do not have permission to import matches.'
    });
    expect(importFromCsv).not.toHaveBeenCalled();
  });

  it('asks for the admin role', async () => {
    checkAuth.mockResolvedValue(ADMIN);
    importFromCsv.mockResolvedValue({ success: true, data: { created: 1, matches: [] } });
    await importMatchesFromCsv(10, CSV);
    expect(checkAuth).toHaveBeenCalledWith(['admin']);
  });

  it.each([
    ['a zero stage id', 0, CSV],
    ['a string stage id', '5', CSV],
    ['empty CSV text', 10, ''],
    ['oversized CSV text', 10, 'x'.repeat(MATCH_IMPORT_MAX_BYTES + 1)]
  ])('rejects %s without importing', async (_label, stageId, csvText) => {
    checkAuth.mockResolvedValue(ADMIN);
    expect(await importMatchesFromCsv(stageId, csvText)).toEqual({
      success: false,
      error: 'Invalid import request.'
    });
    expect(importFromCsv).not.toHaveBeenCalled();
  });

  it('returns the import result and refreshes match pages on success', async () => {
    const result = { success: true, data: { created: 2, matches: [] } };
    checkAuth.mockResolvedValue(ADMIN);
    importFromCsv.mockResolvedValue(result);

    expect(await importMatchesFromCsv(10, CSV)).toBe(result);
    expect(importFromCsv).toHaveBeenCalledWith(10, CSV);
    expect(revalidateMatches).toHaveBeenCalledTimes(1);
  });

  it('does not refresh pages when the import fails', async () => {
    const result = { success: false, error: 'Validation failed', rowErrors: [] };
    checkAuth.mockResolvedValue(ADMIN);
    importFromCsv.mockResolvedValue(result);

    expect(await importMatchesFromCsv(10, CSV)).toBe(result);
    expect(revalidateMatches).not.toHaveBeenCalled();
  });
});
