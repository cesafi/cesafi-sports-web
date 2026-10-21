import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StandingsFiltersProps {
  seasonIds: number[];
  seasonId: number;
  categories: { id: number; name: string }[];
  categoryId: number | null;
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'focus-visible:ring-ring rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background/60 text-foreground border-border hover:bg-muted'
      )}
    >
      {children}
    </Link>
  );
}

export function StandingsFilters({ seasonIds, seasonId, categories, categoryId }: StandingsFiltersProps) {
  return (
    <nav aria-label="Standings filters" className="space-y-3">
      {seasonIds.length > 1 && (
        <div role="group" aria-label="Season" className="flex flex-wrap gap-2">
          {seasonIds.map((id) => (
            <FilterChip key={id} href={`/standings?season=${id}`} active={id === seasonId}>
              Season {id}
            </FilterChip>
          ))}
        </div>
      )}
      <div role="group" aria-label="Category" className="flex flex-wrap gap-2">
        <FilterChip href={`/standings?season=${seasonId}`} active={categoryId === null}>
          All
        </FilterChip>
        {categories.map((category) => (
          <FilterChip
            key={category.id}
            href={`/standings?season=${seasonId}&category=${category.id}`}
            active={category.id === categoryId}
          >
            {category.name}
          </FilterChip>
        ))}
      </div>
    </nav>
  );
}
