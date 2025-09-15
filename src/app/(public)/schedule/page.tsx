import { Calendar, Filter, TrendingUp } from 'lucide-react';
import { SeasonProvider } from '@/components/contexts/season-provider';
import { ScheduleContent } from '@/components/schedule';
import { getScheduleMatchesWithCategories, getAvailableSportCategories } from '@/actions/matches';
import { getLatestArticles } from '@/actions/landing';
import { ScheduleMatch } from '@/lib/types/matches';
import { Article } from '@/lib/types/articles';
import { Card, CardContent } from '@/components/ui';

export default async function SchedulePage() {
  // Fetch initial data server-side
  const [matchesResult, categoriesResult, newsResult] = await Promise.all([
    getScheduleMatchesWithCategories({
      limit: 50,
      direction: 'future',
      filters: {}
    }),
    getAvailableSportCategories(),
    getLatestArticles(3)
  ]);

  const matches: ScheduleMatch[] =
    matchesResult.success && matchesResult.data ? matchesResult.data.matches : [];
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];
  const _news: Article[] = newsResult.success && newsResult.data ? newsResult.data : [];

  return (
    <SeasonProvider>
      <div className="bg-background min-h-screen">
        {/* Header */}
        <div className="border-border bg-card border-b">
          <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center">
              <div className="bg-primary/10 rounded-lg p-2 self-start">
                <Calendar className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="font-mango-grotesque text-foreground text-2xl font-bold sm:text-3xl">
                  Match Schedule
                </h1>
                <p className="text-muted-foreground font-roboto mt-1 text-sm sm:text-base">
                  Follow all CESAFI matches with real-time updates and live scores
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-emerald/10 rounded-lg p-1.5 sm:p-2">
                      <TrendingUp className="text-emerald h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground font-roboto text-xs sm:text-sm">Live Matches</p>
                      <p className="font-mango-grotesque text-foreground text-xl font-bold sm:text-2xl">
                        {matches.filter((m) => m.status === 'ongoing').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-primary/10 rounded-lg p-1.5 sm:p-2">
                      <Calendar className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground font-roboto text-xs sm:text-sm">
                        Today&apos;s Matches
                      </p>
                      <p className="font-mango-grotesque text-foreground text-xl font-bold sm:text-2xl">
                        {matches.filter((m) => m.isToday).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="sm:col-span-2 lg:col-span-1">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-gold/10 rounded-lg p-1.5 sm:p-2">
                      <Filter className="text-gold h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground font-roboto text-xs sm:text-sm">This Week</p>
                      <p className="font-mango-grotesque text-foreground text-xl font-bold sm:text-2xl">
                        {matches.filter((m) => !m.isPast).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto max-w-[1000px] px-4 py-6 sm:py-8">
          <ScheduleContent 
            initialMatches={matches} 
            availableCategories={categories} 
          />
        </div>
      </div>
    </SeasonProvider>
  );
}
