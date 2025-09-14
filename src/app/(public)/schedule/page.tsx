// Removed unused Card and CardContent imports
import { ExternalLink } from 'lucide-react';
import { SeasonProvider } from '@/components/contexts/season-provider';
import { ScheduleContent } from '@/components/schedule';
import { getScheduleMatchesWithCategories, getAvailableSportCategories } from '@/actions/matches';
import { getLatestArticles } from '@/actions/landing';
import { moderniz, roboto } from '@/lib/fonts';
import { ScheduleMatch } from '@/lib/types/matches';
import { Article } from '@/lib/types/articles';
import Link from 'next/link';
import Image from 'next/image';

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

  const matches: ScheduleMatch[] = matchesResult.success && matchesResult.data ? matchesResult.data.matches : [];
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];
  const news: Article[] = newsResult.success && newsResult.data ? newsResult.data : [];

  // Group categories by sport for timeline
  const sportsTimeline = categories.reduce((acc, category) => {
    const sportName = category.sport_name;
    if (!acc[sportName]) {
      acc[sportName] = [];
    }
    acc[sportName].push(category);
    return acc;
  }, {} as Record<string, typeof categories>);

  return (
    <SeasonProvider>
      <div className="bg-background h-screen overflow-hidden">
        {/* Fixed Layout with Scrollable Schedule */}
        <div className="flex h-full px-4 lg:px-6">
          {/* Left Sidebar - Sports Timeline (Fixed) */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="h-full overflow-y-auto">
              <div className="py-6">
                <div className="mb-6">
                  <h2 className={`${moderniz.className} text-foreground text-xl font-bold mb-2`}>
                    CESAFI SPORTS
                  </h2>
                  <p className={`${roboto.className} text-muted-foreground text-sm`}>
                    Current Season Schedule
                  </p>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(sportsTimeline).map(([sportName, sportCategories]) => (
                    <div key={sportName} className="border-l-2 border-primary/20 pl-4">
                      <div className={`${moderniz.className} text-foreground font-semibold text-sm mb-2`}>
                        {sportName}
                      </div>
                      <div className="space-y-1">
                        {sportCategories.map((category) => (
                          <div key={category.id} className="text-muted-foreground text-xs">
                            {category.formatted_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Schedule Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto">
              <ScheduleContent initialMatches={matches} availableCategories={categories} />
            </div>
          </div>

          {/* Right Sidebar - News (Fixed) */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="h-full overflow-y-auto">
              <div className="py-6">
                <div className="mb-6">
                  <h2 className={`${moderniz.className} text-foreground text-xl font-bold mb-2`}>
                    LATEST NEWS
                  </h2>
                  <p className={`${roboto.className} text-muted-foreground text-sm`}>
                    Stay updated with CESAFI
                  </p>
                </div>
                
                <div className="space-y-4">
                  {news.map((article) => (
                    <Link 
                      key={article.id} 
                      href={`/articles/${article.slug}`}
                      className="block group hover:bg-muted/50 rounded-lg p-3 transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="relative w-16 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={article.cover_image_url || '/img/cesafi-banner.jpg'}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`${roboto.className} text-foreground text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors`}>
                            {article.title}
                          </h3>
                          <p className={`${roboto.className} text-muted-foreground text-xs mt-1`}>
                            {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  <Link 
                    href="/news"
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium mt-4"
                  >
                    <span>View Full News</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SeasonProvider>
  );
}
