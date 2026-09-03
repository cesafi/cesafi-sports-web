// @ts-nocheck
import { SeasonProvider } from '@/components/contexts/season-provider';
import { ScheduleContent } from '@/components/schedule';
import { getScheduleMatchesAroundDate, getAvailableSportCategories, getAvailableSeasons, getAvailableStages } from '@/actions/matches';
import { getActiveSchools } from '@/actions/schools';
import { moderniz, roboto } from '@/lib/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Match Schedule | CESAFI Sports League',
  description: 'View the full match schedule for the CESAFI Sports League. Follow live scores, upcoming matches, and tournament schedules across all sports and divisions.',
};

export const revalidate = 0; // Temporarily disabled caching for dev

export default async function SchedulePage() {
  // Fetch initial data server-side using bidirectional loading
  const [matchesResult, categoriesResult, seasonsResult, stagesResult, schoolsResult] = await Promise.all([
    getScheduleMatchesAroundDate({
      totalLimit: 50,
      filters: {}
    }),
    getAvailableSportCategories(),
    getAvailableSeasons(),
    getAvailableStages(),
    getActiveSchools()
  ]);

  const matches = matchesResult.success && matchesResult.data ? matchesResult.data.matches : [];
  const hasMorePast = matchesResult.success && matchesResult.data ? matchesResult.data.hasMorePast : false;
  const hasMoreFuture = matchesResult.success && matchesResult.data ? matchesResult.data.hasMoreFuture : false;
  const pastCursor = matchesResult.success && matchesResult.data ? matchesResult.data.pastCursor : null;
  const futureCursor = matchesResult.success && matchesResult.data ? matchesResult.data.futureCursor : null;
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];
  const seasons = seasonsResult.success && seasonsResult.data ? seasonsResult.data : [];
  const stages = stagesResult.success && stagesResult.data ? stagesResult.data : [];
  const schools = schoolsResult.success && schoolsResult.data ? schoolsResult.data : [];

  return (
    <SeasonProvider>
      <div className="bg-background min-h-screen">
        {/* Hero Section — compact header */}
        <section className="from-primary/5 via-background to-secondary/5 relative bg-gradient-to-br pt-20 pb-6 sm:pt-24 sm:pb-8">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1
                className={`${moderniz.className} text-foreground mb-2 text-2xl font-bold sm:mb-3 sm:text-3xl md:text-4xl lg:text-5xl`}
              >
                Match <span className="text-gradient-cel">Schedule</span>
              </h1>
              <p
                className={`${roboto.className} text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed sm:text-base`}
              >
                Follow all CESAFI matches with real-time updates and live scores across all sports and categories.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <ScheduleContent
            initialMatches={matches}
            initialHasMorePast={hasMorePast}
            initialHasMoreFuture={hasMoreFuture}
            initialPastCursor={pastCursor}
            initialFutureCursor={futureCursor}
            availableCategories={categories}
            availableSeasons={seasons}
            availableStages={stages}
            availableSchools={schools}
          />
        </div>
      </div>
    </SeasonProvider>
  );
}
