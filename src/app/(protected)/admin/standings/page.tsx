'use client';

import { StandingsManager } from '@/components/admin/standings';
import { useSeason } from '@/components/contexts/season-provider';

export default function StandingsManagementPage() {
  const { currentSeason } = useSeason();

  if (!currentSeason) {
    return (
      <div className="w-full space-y-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-lg font-semibold">No Season Selected</h2>
            <p className="text-muted-foreground">
              Please select a season from the season switcher to manage standings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <StandingsManager seasonId={currentSeason.id} />;
}
