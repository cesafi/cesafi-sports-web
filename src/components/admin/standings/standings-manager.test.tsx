import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import type { CategoryStandings } from '@/lib/types/standings';

const mockCategory = (id: number, name: string): CategoryStandings => ({
  category: { id, sportName: 'Basketball', division: 'men', levels: 'college', name },
  countedThrough: '2026-10-29',
  hasResults: false,
  teams: []
});
const mockCategories = [mockCategory(3, "Basketball · Men's College"), mockCategory(9, "Basketball · Men's High School")];

jest.mock('@/hooks/use-standings', () => {
  const { useState } = jest.requireActual('react');
  return {
    useStandingsTable: () => {
      const [selectedCategoryId, setSelectedCategoryId] = useState(3);
      return {
        categories: mockCategories,
        selectedCategoryId,
        setSelectedCategoryId,
        search: '',
        setSearch: jest.fn(),
        sortKey: 'rank',
        setSortKey: jest.fn(),
        rows: [],
        isLoading: false,
        error: null,
        refetch: jest.fn()
      };
    },
    useUpdateTeamStanding: () => ({ mutateAsync: jest.fn() }),
    useUpdateStandingsCutoff: () => ({ mutateAsync: jest.fn() })
  };
});

import { StandingsManager } from './standings-manager';

const dateInput = () => screen.getByLabelText('Starting record covers games through') as HTMLInputElement;

describe('StandingsManager', () => {
  it('does not carry an unsaved cut-off date into another category', () => {
    render(<StandingsManager seasonId={26} />);

    fireEvent.change(dateInput(), { target: { value: '2026-11-05' } });
    fireEvent.mouseDown(screen.getByRole('tab', { name: /Men's High School/ }));

    expect(screen.getByRole('tab', { name: /Men's High School/ })).toHaveAttribute('aria-selected', 'true');
    expect(dateInput().value).toBe('2026-10-29');
    expect(screen.getByRole('button', { name: 'Save cut-off date' })).toBeDisabled();
  });
});
