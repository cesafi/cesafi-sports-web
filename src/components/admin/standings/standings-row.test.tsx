import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { StandingsRow } from './standings-row';
import type { RankedTeamStanding, SavedTeamStanding, StandingsResult } from '@/lib/types/standings';

const TEAM: RankedTeamStanding = {
  teamId: '3f1c2b7e-4a5d-4e6f-9a1b-2c3d4e5f6a7b',
  teamName: 'Webmasters',
  school: { id: 's1', name: 'University of Cebu', abbreviation: 'UC', logoUrl: null },
  starting: { wins: 5, losses: 1, pointDiff: 12 },
  fromMatches: { wins: 2, losses: 0, pointDiff: 24 },
  wins: 7,
  losses: 1,
  pointDiff: 36,
  points: 21,
  rank: 2,
  updatedAt: '2026-10-22T01:00:00+00:00'
};

const SAVED: StandingsResult<SavedTeamStanding> = {
  success: true,
  data: { teamId: TEAM.teamId, wins: 6, losses: 1, pointDiff: 12, updatedAt: '2026-10-22T02:00:00+00:00' }
};

function renderRow(team = TEAM, onSave = jest.fn().mockResolvedValue(SAVED)) {
  const view = render(
    <table>
      <tbody>
        <StandingsRow team={team} onSave={onSave} />
      </tbody>
    </table>
  );
  const rerenderTeam = (next: RankedTeamStanding) =>
    view.rerender(
      <table>
        <tbody>
          <StandingsRow team={next} onSave={onSave} />
        </tbody>
      </table>
    );
  return { onSave, rerenderTeam };
}

const winsInput = () => screen.getByLabelText('Starting wins for Webmasters') as HTMLInputElement;
const lossesInput = () => screen.getByLabelText('Starting losses for Webmasters') as HTMLInputElement;
const pointDiffInput = () => screen.getByLabelText('Starting point difference for Webmasters') as HTMLInputElement;
const POINT_DIFF_MESSAGE = '+/\u2212 must be a whole number from -9999 to 9999.';
const saveButton = () => screen.queryByRole('button', { name: 'Save Webmasters' });
const resetButton = () => screen.queryByRole('button', { name: 'Reset Webmasters' });

describe('StandingsRow', () => {
  it('shows the rank, team, school and saved values', () => {
    renderRow();

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Webmasters')).toBeInTheDocument();
    expect(screen.getByText('University of Cebu')).toBeInTheDocument();
    expect(winsInput().value).toBe('5');
    expect(lossesInput().value).toBe('1');
    expect(pointDiffInput().value).toBe('12');
  });

  it('shows the match results and the totals', () => {
    renderRow();

    expect(screen.getByText('2-0 \u00b7 +24')).toBeInTheDocument();
    expect(screen.getByText('7-1 \u00b7 21 pts \u00b7 +36')).toBeInTheDocument();
  });

  it('shows a dash when no matches have been counted', () => {
    renderRow({ ...TEAM, fromMatches: { wins: 0, losses: 0, pointDiff: 0 }, wins: 5, points: 15, pointDiff: 12 });

    expect(screen.getByText('\u2014')).toBeInTheDocument();
    expect(screen.getByText('5-1 \u00b7 15 pts \u00b7 +12')).toBeInTheDocument();
  });

  it.each(['-12', '+5'])('accepts +/- "%s"', (value) => {
    renderRow();

    fireEvent.change(pointDiffInput(), { target: { value } });

    expect(screen.queryByText(POINT_DIFF_MESSAGE)).toBeNull();
    expect(saveButton()).toBeEnabled();
  });

  it.each(['', '1.5', '10000'])('+/- "%s" shows the error and cannot be saved', (value) => {
    renderRow();

    fireEvent.change(pointDiffInput(), { target: { value } });

    expect(screen.getByText(POINT_DIFF_MESSAGE)).toBeInTheDocument();
    expect(pointDiffInput()).toHaveAttribute('aria-invalid', 'true');
    expect(saveButton()).toBeDisabled();
  });

  it('shows "–" when the category has no results yet', () => {
    renderRow({ ...TEAM, rank: null });

    expect(screen.getByLabelText('Not ranked yet')).toHaveTextContent('–');
  });

  it('shows Save and Reset only after a value changes, and Reset restores the saved values', () => {
    renderRow();
    expect(saveButton()).toBeNull();
    expect(resetButton()).toBeNull();

    fireEvent.change(winsInput(), { target: { value: '7' } });
    expect(saveButton()).toBeEnabled();

    fireEvent.click(resetButton()!);
    expect(winsInput().value).toBe('5');
    expect(saveButton()).toBeNull();
  });

  it.each(['', '-1', '2.5', '1000'])('wins "%s" shows the error and cannot be saved', (value) => {
    const { onSave } = renderRow();

    fireEvent.change(winsInput(), { target: { value } });

    expect(screen.getByText('Wins must be a whole number from 0 to 999.')).toBeInTheDocument();
    expect(winsInput()).toHaveAttribute('aria-invalid', 'true');
    expect(saveButton()).toBeDisabled();
    fireEvent.click(saveButton()!);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves the numbers once and disables Save while saving', async () => {
    let resolveSave!: (r: StandingsResult<SavedTeamStanding>) => void;
    const onSave = jest.fn(() => new Promise<StandingsResult<SavedTeamStanding>>((resolve) => (resolveSave = resolve)));
    renderRow(TEAM, onSave);

    fireEvent.change(winsInput(), { target: { value: '6' } });
    fireEvent.change(lossesInput(), { target: { value: '0' } });
    fireEvent.change(pointDiffInput(), { target: { value: '-12' } });
    fireEvent.click(saveButton()!);
    fireEvent.click(saveButton()!);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ wins: 6, losses: 0, pointDiff: -12 });
    expect(saveButton()).toBeDisabled();

    await act(async () => resolveSave(SAVED));
  });

  it('shows server field errors under the matching input', async () => {
    const onSave = jest.fn().mockResolvedValue({
      success: false,
      code: 'VALIDATION',
      error: 'Please fix the highlighted fields.',
      fieldErrors: { losses: ['Losses must be a whole number from 0 to 999.'] }
    });
    renderRow(TEAM, onSave);

    fireEvent.change(lossesInput(), { target: { value: '3' } });
    await act(async () => {
      fireEvent.click(saveButton()!);
    });

    expect(screen.getByText('Losses must be a whole number from 0 to 999.')).toBeInTheDocument();
    expect(lossesInput()).toHaveAttribute('aria-invalid', 'true');
  });

  it('resets its draft when the saved values change (e.g. after a reload)', () => {
    const { rerenderTeam } = renderRow();
    fireEvent.change(winsInput(), { target: { value: '9' } });

    rerenderTeam({ ...TEAM, starting: { ...TEAM.starting, wins: 6 }, updatedAt: '2026-10-22T03:00:00+00:00' });

    expect(winsInput().value).toBe('6');
    expect(saveButton()).toBeNull();
  });
});
