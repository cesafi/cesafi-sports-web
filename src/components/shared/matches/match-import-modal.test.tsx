import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/actions/match-import', () => ({ importMatchesFromCsv: jest.fn() }));
jest.mock('@/hooks/use-matches', () => ({
  matchKeys: { all: ['matches'], byStage: (id: number) => ['matches', 'stage', id] }
}));
jest.mock('@/hooks/use-sports-seasons-stages', () => ({
  useAllSportsSeasonsStages: () => ({
    data: [
      {
        id: 10,
        competition_stage: 'group_stage',
        sports_categories: { id: 3, division: 'men', levels: 'college', sports: { id: 1, name: 'Basketball' } }
      }
    ]
  })
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

import { MatchImportModal } from './match-import-modal';
import { importMatchesFromCsv } from '@/actions/match-import';

const importAction = importMatchesFromCsv as jest.Mock;

// jsdom's File lacks Blob.text(), which every supported browser has.
if (!File.prototype.text) {
  File.prototype.text = function (this: File) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(this);
    });
  };
}
const STAGE_LABEL = "Basketball · Men's College · Group Stage";

function renderModal() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const onOpenChange = jest.fn();
  render(
    <QueryClientProvider client={queryClient}>
      <MatchImportModal open onOpenChange={onOpenChange} stageId={10} />
    </QueryClientProvider>
  );
  return { onOpenChange };
}

const chooseFile = (name: string, content = 'Match ID\nM-1') =>
  fireEvent.change(screen.getByLabelText('CSV file'), {
    target: { files: [new File([content], name, { type: 'text/csv' })] }
  });

beforeEach(() => {
  importAction.mockReset();
});

describe('MatchImportModal', () => {
  it('shows the target stage and the required columns, with Import disabled until a file is chosen', () => {
    renderModal();
    expect(screen.getByText(STAGE_LABEL)).toBeInTheDocument();
    ['Match ID', 'Match Participants', 'Match Details', 'Match Format', 'Scheduled Date', 'Start Time', 'Venue'].forEach(
      (column) => expect(screen.getByText(column)).toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled();
  });

  it('rejects a non-CSV file before uploading', () => {
    renderModal();
    chooseFile('schedule.xlsx');
    expect(screen.getByText('Please choose a .csv file.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled();
  });

  it('sends the file text for the selected stage and lists row errors when validation fails', async () => {
    importAction.mockResolvedValue({
      success: false,
      error: 'Validation failed',
      rowErrors: [
        { row: 2, matchId: 'M-1', field: 'Scheduled Date', message: 'Scheduled Date must be YYYY-MM-DD (e.g. 2026-10-17)' },
        { row: 3, matchId: 'M-2', field: 'Match Participants', message: 'Team "XYZ" is not in this stage. Valid teams: BC, UC' }
      ]
    });
    renderModal();
    chooseFile('college.csv', 'csv body');
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(await screen.findByText('No matches were imported. Fix 2 errors and try again.')).toBeInTheDocument();
    expect(importAction).toHaveBeenCalledWith(10, 'csv body');
    expect(screen.getByText('Team "XYZ" is not in this stage. Valid teams: BC, UC')).toBeInTheDocument();
    expect(screen.getByText('college.csv')).toBeInTheDocument();
  });

  it('asks for the file again when it changed on disk after being chosen', async () => {
    renderModal();
    const file = new File(['csv'], 'college.csv', { type: 'text/csv' });
    file.text = () => Promise.reject(new DOMException('The requested file could not be read', 'NotReadableError'));
    fireEvent.change(screen.getByLabelText('CSV file'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(
      await screen.findByText('The file could not be read. It may have changed since you chose it. Choose it again.')
    ).toBeInTheDocument();
    expect(importAction).not.toHaveBeenCalled();
    expect(screen.queryByText('college.csv')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled();
  });

  it('clears the file input after each pick so the same (edited) file can be chosen again', () => {
    renderModal();
    const input = screen.getByLabelText('CSV file') as HTMLInputElement;
    const setValue = jest.fn();
    Object.defineProperty(input, 'value', { configurable: true, get: () => '', set: setValue });
    chooseFile('college.csv');
    expect(setValue).toHaveBeenCalledWith('');
    expect(screen.getByText('college.csv')).toBeInTheDocument();
  });

  it('shows a non-row error such as a permission failure', async () => {
    importAction.mockResolvedValue({ success: false, error: 'You do not have permission to import matches.' });
    renderModal();
    chooseFile('college.csv');
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));
    expect(await screen.findByText('You do not have permission to import matches.')).toBeInTheDocument();
  });

  it('shows the success summary and a Done button', async () => {
    importAction.mockResolvedValue({ success: true, data: { created: 36, matches: [] } });
    const { onOpenChange } = renderModal();
    chooseFile('college.csv');
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(await screen.findByText(`Imported 36 matches into ${STAGE_LABEL}.`)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Import' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});
