import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

jest.mock('@/actions/standings', () => ({ getStandings: jest.fn(), updateTeamStanding: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

import { getStandings, updateTeamStanding } from '@/actions/standings';
import { toast } from 'sonner';
import { standingsKeys, useSeasonStandings, useStandingsTable, useUpdateTeamStanding } from './use-standings';
import type { RankedTeamStanding, SeasonStandings } from '@/lib/types/standings';

const getStandingsMock = getStandings as jest.Mock;
const updateMock = updateTeamStanding as jest.Mock;

const standing = (
  teamId: string,
  teamName: string,
  schoolName: string,
  abbreviation: string,
  wins: number,
  losses: number,
  rank: number
): RankedTeamStanding => ({
  teamId,
  teamName,
  school: { id: `school-${teamId}`, name: schoolName, abbreviation, logoUrl: null },
  wins,
  losses,
  rank,
  updatedAt: `2026-10-22T01:00:0${rank}+00:00`
});

const COLLEGE = {
  category: { id: 3, sportName: 'Basketball', division: 'men', levels: 'college', name: "Basketball · Men's College" },
  hasResults: true,
  teams: [
    standing('uc', 'Webmasters', 'University of Cebu', 'UC', 5, 1, 1),
    standing('usjr', 'Jaguars', 'University of San Jose-Recoletos', 'USJR', 3, 2, 2),
    standing('swu', 'Cobras', 'Southwestern University', 'SWU', 3, 4, 3),
    standing('cit', 'Wildcats', 'Cebu Institute of Technology', 'CIT', 1, 5, 4)
  ]
};
const HIGH_SCHOOL = {
  category: { id: 9, sportName: 'Basketball', division: 'men', levels: 'high_school', name: "Basketball · Men's High School" },
  hasResults: true,
  teams: [standing('usc', 'Baby Warriors', 'University of San Carlos', 'USC', 2, 0, 1)]
};
const SEASON: SeasonStandings = { seasonId: 26, categories: [COLLEGE, HIGH_SCHOOL] };

let queryClient: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  getStandingsMock.mockResolvedValue({ success: true, data: SEASON });
});

const teamIds = (rows: RankedTeamStanding[]) => rows.map((r) => r.teamId);

async function renderTable() {
  const hook = renderHook(() => useStandingsTable(26), { wrapper });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe('useStandingsTable', () => {
  it('selects the first category and switches categories', async () => {
    const { result } = await renderTable();

    expect(result.current.selectedCategoryId).toBe(3);
    expect(teamIds(result.current.rows)).toEqual(['uc', 'usjr', 'swu', 'cit']);

    act(() => result.current.setSelectedCategoryId(9));
    expect(teamIds(result.current.rows)).toEqual(['usc']);
  });

  it.each([
    ['cebu', ['uc', 'cit']],
    ['usjr', ['usjr']],
    ['COBRAS', ['swu']],
    ['  ', ['uc', 'usjr', 'swu', 'cit']]
  ])('search "%s" matches school name, abbreviation or team name', async (query, expected) => {
    const { result } = await renderTable();

    act(() => result.current.setSearch(query));

    expect(teamIds(result.current.rows)).toEqual(expected);
  });

  it.each([
    ['rank', ['uc', 'usjr', 'swu', 'cit']],
    ['school', ['cit', 'swu', 'uc', 'usjr']],
    ['wins', ['uc', 'usjr', 'swu', 'cit']],
    ['losses', ['cit', 'swu', 'usjr', 'uc']]
  ] as const)('sorts by %s', async (key, expected) => {
    const { result } = await renderTable();

    act(() => result.current.setSortKey(key));

    expect(teamIds(result.current.rows)).toEqual(expected);
  });

  it('falls back to the first category when the selected one disappears', async () => {
    const { result } = await renderTable();
    act(() => result.current.setSelectedCategoryId(9));

    getStandingsMock.mockResolvedValue({ success: true, data: { seasonId: 26, categories: [COLLEGE] } });
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.categories).toHaveLength(1));

    expect(result.current.selectedCategoryId).toBe(3);
  });

  it('exposes a load failure as an error', async () => {
    getStandingsMock.mockResolvedValue({ success: false, code: 'SERVER', error: 'Could not load standings.' });
    const { result } = await renderTable();

    expect(result.current.error?.message).toBe('Could not load standings.');
    expect(result.current.rows).toEqual([]);
  });
});

describe('useUpdateTeamStanding', () => {
  const INPUT = { teamId: 'uc', wins: 6, losses: 1, expectedUpdatedAt: '2026-10-22T01:00:01+00:00' };

  async function renderUpdate() {
    const hook = renderHook(() => ({ standings: useSeasonStandings(26), update: useUpdateTeamStanding(26) }), {
      wrapper
    });
    await waitFor(() => expect(hook.result.current.standings.data).toBeDefined());
    return hook;
  }

  it('patches the saved row in the cache, toasts, and refetches the season', async () => {
    const { result } = await renderUpdate();
    updateMock.mockResolvedValue({
      success: true,
      data: { teamId: 'uc', wins: 6, losses: 1, updatedAt: '2026-10-22T09:00:00.000001+00:00' }
    });
    getStandingsMock.mockReturnValue(new Promise(() => {})); // keep the refetch pending

    await act(async () => {
      await result.current.update.mutateAsync({ input: INPUT, teamName: 'Webmasters' });
    });

    const cached = queryClient.getQueryData<SeasonStandings>(standingsKeys.season(26));
    expect(cached?.categories[0].teams[0]).toMatchObject({
      teamId: 'uc',
      wins: 6,
      losses: 1,
      updatedAt: '2026-10-22T09:00:00.000001+00:00'
    });
    expect(toast.success).toHaveBeenCalledWith('Webmasters updated to 6-1');
    expect(getStandingsMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledWith(INPUT);
  });

  it.each(['CONFLICT', 'NOT_FOUND'])('on %s toasts the message and refetches', async (code) => {
    const { result } = await renderUpdate();
    updateMock.mockResolvedValue({ success: false, code, error: 'The latest numbers have been loaded.' });

    await act(async () => {
      await result.current.update.mutateAsync({ input: INPUT, teamName: 'Webmasters' });
    });

    expect(toast.error).toHaveBeenCalledWith('The latest numbers have been loaded.');
    expect(getStandingsMock).toHaveBeenCalledTimes(2);
  });

  it('on VALIDATION shows no toast and resolves with the field errors', async () => {
    const { result } = await renderUpdate();
    const invalid = {
      success: false,
      code: 'VALIDATION',
      error: 'Please fix the highlighted fields.',
      fieldErrors: { wins: ['Wins must be a whole number from 0 to 999.'] }
    };
    updateMock.mockResolvedValue(invalid);

    let returned: unknown;
    await act(async () => {
      returned = await result.current.update.mutateAsync({ input: INPUT, teamName: 'Webmasters' });
    });

    expect(returned).toEqual(invalid);
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('on FORBIDDEN toasts the message without refetching', async () => {
    const { result } = await renderUpdate();
    updateMock.mockResolvedValue({
      success: false,
      code: 'FORBIDDEN',
      error: 'You do not have permission to update standings.'
    });

    await act(async () => {
      await result.current.update.mutateAsync({ input: INPUT, teamName: 'Webmasters' });
    });

    expect(toast.error).toHaveBeenCalledWith('You do not have permission to update standings.');
    expect(getStandingsMock).toHaveBeenCalledTimes(1);
  });

  it('turns a failed request into a SERVER result instead of throwing', async () => {
    const { result } = await renderUpdate();
    updateMock.mockRejectedValue(new Error('fetch failed'));

    let returned: unknown;
    await act(async () => {
      returned = await result.current.update.mutateAsync({ input: INPUT, teamName: 'Webmasters' });
    });

    expect(returned).toEqual({
      success: false,
      code: 'SERVER',
      error: 'Could not save the record. Please try again.'
    });
    expect(toast.error).toHaveBeenCalledWith('Could not save the record. Please try again.');
  });
});
