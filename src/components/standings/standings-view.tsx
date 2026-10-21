import type { ReactNode } from 'react';
import { AlertCircle, Trophy } from 'lucide-react';
import { moderniz, roboto } from '@/lib/fonts';
import type { SeasonStandings } from '@/lib/types/standings';
import { StandingsFilters } from './standings-filters';
import { StandingsTable } from './standings-table';

interface StandingsViewProps {
  seasonIds: number[];
  seasonId: number | null;
  standings: SeasonStandings | null;
  categoryId: number | null;
  loadFailed: boolean;
}

function StandingsMessage({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center space-y-4 py-16 text-center">
      <div className="bg-muted/30 rounded-full p-4">{icon}</div>
      <div className="space-y-1">
        <h2 className="text-foreground text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground/80 text-base">{body}</p>
      </div>
    </div>
  );
}

export function StandingsView({ seasonIds, seasonId, standings, categoryId, loadFailed }: StandingsViewProps) {
  const categories = standings?.categories ?? [];
  const visible = categoryId === null ? categories : categories.filter((c) => c.category.id === categoryId);

  const renderContent = () => {
    if (loadFailed) {
      return (
        <div role="alert">
          <StandingsMessage
            icon={<AlertCircle className="text-muted-foreground/50 h-10 w-10" />}
            title="Standings unavailable"
            body="Standings are temporarily unavailable. Please try again later."
          />
        </div>
      );
    }

    if (seasonId === null || categories.length === 0) {
      return (
        <StandingsMessage
          icon={<Trophy className="text-muted-foreground/50 h-10 w-10" />}
          title="No standings yet"
          body="Standings will appear here once teams are registered for the season."
        />
      );
    }

    return (
      <div className="space-y-8">
        <StandingsFilters
          seasonIds={seasonIds}
          seasonId={seasonId}
          categories={categories.map((c) => ({ id: c.category.id, name: c.category.name }))}
          categoryId={categoryId}
        />
        <div className="space-y-10">
          {visible.map((category) => (
            <StandingsTable key={category.category.id} category={category} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background relative min-h-screen">
      {/* Hero Section */}
      <section className="from-primary/10 via-background to-secondary/10 relative bg-gradient-to-br pt-20 pb-8 sm:pt-24 sm:pb-16">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzM2YzYxIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] bg-repeat" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className={`${moderniz.className} text-foreground mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl md:text-6xl lg:text-7xl`}
            >
              League <span className="text-gradient-cel">Standings</span>
            </h1>
            <p
              className={`${roboto.className} text-muted-foreground mx-auto mb-8 max-w-3xl text-base leading-relaxed sm:mb-12 sm:text-lg md:text-xl`}
            >
              Stay updated with the latest rankings, team performance, and tournament progress across all CESAFI
              sports.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-4 mb-12 max-w-7xl px-4 sm:mt-8 sm:px-6 lg:px-8">{renderContent()}</div>
    </div>
  );
}
