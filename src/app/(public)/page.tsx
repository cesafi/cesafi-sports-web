import HeroSection from '@/components/landing/hero-section';
import AboutCesafi from '@/components/landing/about-cesafi';
import UpcomingGames from '@/components/landing/upcoming-games';
import PhotoGallery from '@/components/landing/photo-gallery';
import LatestNews from '@/components/landing/latest-news';
import SponsorsCarousel from '@/components/landing/sponsors-carousel';
import SchoolsCarousel from '@/components/landing/schools-carousel';
import { getLatestArticles, getUpcomingMatches } from '@/actions/landing';
import { Article } from '@/lib/types/articles';
import { MatchWithFullDetails } from '@/lib/types/matches';

export default async function LandingPage() {
  // Fetch data server-side
  const [articlesResult, matchesResult] = await Promise.all([
    getLatestArticles(4),
    getUpcomingMatches(4)
  ]);

  const articles: Article[] = articlesResult.success && articlesResult.data ? articlesResult.data : [];
  const matches: MatchWithFullDetails[] = matchesResult.success && matchesResult.data ? matchesResult.data : [];

  return (
    <>
      {/* Hero Section - Full screen impact */}
      <HeroSection />

      {/* Schools Carousel - Member institutions */}
      <SchoolsCarousel />

      {/* About CESAFI - Mission and vision */}
      <AboutCesafi />

      {/* Latest News - Content engagement */}
      <LatestNews initialArticles={articles} />

      {/* Upcoming Games - Sports showcase */}
      <UpcomingGames initialMatches={matches} />

      {/* Photo Gallery - Visual storytelling */}
      <PhotoGallery />

      {/* Sponsors Carousel - Partner organizations */}
      <SponsorsCarousel />
    </>
  );
}
