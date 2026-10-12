import { fireEvent, render, screen } from '@testing-library/react';
import { TableSearchAndFilters } from './table-search-filters';

const baseProps = {
  search: '',
  onSearchChange: jest.fn(),
  onFiltersChange: jest.fn(),
  showFilters: false,
  addButton: { label: 'Add Match', onClick: jest.fn() }
};

describe('TableSearchAndFilters toolbar buttons', () => {
  it('renders only the add button when no secondary buttons are given', () => {
    render(<TableSearchAndFilters {...baseProps} />);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Add Match']);
  });

  it('renders secondary buttons before the add button and wires their clicks', () => {
    const onImport = jest.fn();
    render(
      <TableSearchAndFilters
        {...baseProps}
        secondaryButtons={[{ label: 'Import Bulk Matches', onClick: onImport }]}
      />
    );

    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Import Bulk Matches', 'Add Match']);
    fireEvent.click(screen.getByRole('button', { name: 'Import Bulk Matches' }));
    expect(onImport).toHaveBeenCalledTimes(1);
    expect(baseProps.addButton.onClick).not.toHaveBeenCalled();
  });
});
