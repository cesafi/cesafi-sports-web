import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { SearchAndFiltersProps } from '@/lib/types/table';
import { useState, useEffect, useRef } from 'react';

export function TableSearchAndFilters({
  search,
  onSearchChange,
  onFiltersChange,
  searchPlaceholder = "Search...",
  showFilters = true,
  addButton
}: SearchAndFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search || '');
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearch(search || '');
  }, [search]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300); // 300ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [localSearch, onSearchChange]);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        
        {showFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFiltersChange({})} // Placeholder for filter modal
            className="flex items-center gap-2 border-border hover:bg-muted"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        )}
      </div>

      {addButton && (
        <Button
          onClick={addButton.onClick}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
        >
          {addButton.icon || <Plus className="h-4 w-4" />}
          {addButton.label}
        </Button>
      )}
    </div>
  );
}
