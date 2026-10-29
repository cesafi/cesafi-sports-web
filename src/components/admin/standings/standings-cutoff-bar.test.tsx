import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { StandingsCutoffBar } from './standings-cutoff-bar';
import type { SavedStandingsCutoff, StandingsResult } from '@/lib/types/standings';

const saved = (countedThrough: string | null): StandingsResult<SavedStandingsCutoff> => ({
  success: true,
  data: { seasonId: 26, sportCategoryId: 3, countedThrough }
});

function renderBar(countedThrough: string | null = '2026-10-29', onSave = jest.fn().mockResolvedValue(saved(null))) {
  const view = render(<StandingsCutoffBar countedThrough={countedThrough} onSave={onSave} />);
  const rerenderWith = (next: string | null) =>
    view.rerender(<StandingsCutoffBar countedThrough={next} onSave={onSave} />);
  return { onSave, rerenderWith };
}

const dateInput = () => screen.getByLabelText('Starting record covers games through') as HTMLInputElement;
const saveButton = () => screen.getByRole('button', { name: 'Save cut-off date' });
const clearButton = () => screen.getByRole('button', { name: 'Clear cut-off date' });

describe('StandingsCutoffBar', () => {
  it('shows the saved date and explains what it does', () => {
    renderBar();

    expect(dateInput().value).toBe('2026-10-29');
    expect(
      screen.getByText(
        'Finished matches on or before this date are already in the starting record and are not added again. Leave empty to count every finished match.'
      )
    ).toBeInTheDocument();
  });

  it('enables Save only for a new, non-empty date and saves it', async () => {
    const { onSave } = renderBar();
    expect(saveButton()).toBeDisabled();

    fireEvent.change(dateInput(), { target: { value: '' } });
    expect(saveButton()).toBeDisabled();

    fireEvent.change(dateInput(), { target: { value: '2026-11-15' } });
    expect(saveButton()).toBeEnabled();
    await act(async () => {
      fireEvent.click(saveButton());
    });

    expect(onSave).toHaveBeenCalledWith('2026-11-15');
  });

  it('clears the cut-off', async () => {
    const { onSave } = renderBar();

    await act(async () => {
      fireEvent.click(clearButton());
    });

    expect(onSave).toHaveBeenCalledWith(null);
  });

  it('disables Clear when there is no cut-off', () => {
    renderBar(null);

    expect(dateInput().value).toBe('');
    expect(clearButton()).toBeDisabled();
  });

  it('shows a server field error', async () => {
    const onSave = jest.fn().mockResolvedValue({
      success: false,
      code: 'VALIDATION',
      error: 'Please fix the highlighted fields.',
      fieldErrors: { countedThrough: ['Enter a valid date.'] }
    });
    renderBar('2026-10-29', onSave);

    fireEvent.change(dateInput(), { target: { value: '2026-11-15' } });
    await act(async () => {
      fireEvent.click(saveButton());
    });

    expect(screen.getByText('Enter a valid date.')).toBeInTheDocument();
    expect(dateInput()).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows the latest saved date when it changes', () => {
    const { rerenderWith } = renderBar();
    fireEvent.change(dateInput(), { target: { value: '2026-12-01' } });

    rerenderWith('2026-11-15');

    expect(dateInput().value).toBe('2026-11-15');
    expect(saveButton()).toBeDisabled();
  });
});
