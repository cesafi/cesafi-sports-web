'use client';

import { useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface NewsSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
  isPending?: boolean;
  resultCount?: number;
}

export default function NewsSearch({
  searchTerm,
  onSearchChange,
  placeholder = "Search articles by title or content...",
  isPending = false,
  resultCount
}: NewsSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`pl-10 pr-10 h-12 text-base border-2 transition-all duration-200 ${
            isFocused 
              ? 'border-primary shadow-lg shadow-primary/20' 
              : 'border-border hover:border-primary/50'
          }`}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Search status: spinner while fetching, then the result count */}
      {searchTerm.trim() && (
        <div className="mt-2 text-sm text-muted-foreground text-center" aria-live="polite">
          <span className="inline-flex items-center gap-1">
            {isPending ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Searching for &quot;{searchTerm.trim()}&quot;…
              </>
            ) : resultCount !== undefined ? (
              <>
                <Search className="h-3 w-3" />
                {resultCount} {resultCount === 1 ? 'result' : 'results'} for &quot;{searchTerm.trim()}&quot;
              </>
            ) : null}
          </span>
        </div>
      )}
    </div>
  );
}

