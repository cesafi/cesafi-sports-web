import { Metadata } from 'next';
import HeroSection from '@/components/landing/hero-section';
import AboutCesafi from '@/components/landing/about-cesafi';
import UpcomingGames from '@/components/landing/upcoming-games';
import PhotoGallery from '@/components/landing/photo-gallery';
import LatestNews from '@/components/landing/latest-news';
import LandingFaq from '@/components/landing/landing-faq';
import SponsorsGrid from '@/components/landing/sponsors-grid';
import SchoolsGrid from '@/components/landing/schools-grid';
import { getLatestArticles, getUpcomingMatches } from '@/actions/landing';
import { getHighlightedFaq } from '@/actions/faq';
import { getActiveSchools } from '@/actions/schools';
import { getCurrentActiveHeroSection } from '@/actions/hero-section';
import { Article } from '@/lib/types/articles';
import { MatchWithFullDetails } from '@/lib/types/matches';
import { Faq } from '@/lib/types/faq';
import { School } from '@/lib/types/schools';

export const metadata: Metadata = {
  title: 'CESAFI Sports | Cebu Schools Athletic Foundation, Inc.',
  description: 'The official digital platform of CESAFI. Get the latest news, live scores, team standings, player statistics, and match schedules for basketball, volleyball, football, and more across Cebu.',
  keywords: 'CESAFI, Cebu Sports, College Sports, Basketball, Volleyball, Football, Esports, Cebu Schools Athletic Foundation Inc',
  openGraph: {
    title: 'CESAFI Sports',
    description: 'The official digital platform of CESAFI. Catch the action live.',
    url: 'https://cesafi.vercel.app',
    siteName: 'CESAFI Sports',
    locale: 'en_PH',
    type: 'website',
  },
};

export const revalidate = 1800; // Revalidate every 30 minutes

export default async function LandingPage() {
  // Fetch data server-side
  const [articlesResult, matchesResult, faqResult, schoolsResult, heroResult] = await Promise.all([
    getLatestArticles(4),
    getUpcomingMatches(4),
    getHighlightedFaq(),
    getActiveSchools(),
    getCurrentActiveHeroSection()
  ]);

  const articles: Article[] = articlesResult.success && 'data' in articlesResult && articlesResult.data ? articlesResult.data : [];
  const matches: MatchWithFullDetails[] = matchesResult.success && 'data' in matchesResult && matchesResult.data ? matchesResult.data : [];
  const highlightedFaqs: Faq[] = faqResult.success && 'data' in faqResult && faqResult.data ? faqResult.data : [];
  const schools: School[] = schoolsResult.success && schoolsResult.data ? schoolsResult.data : [];

  return (
    <>
      {/* Hero Section - Full screen impact */}
      <HeroSection initialData={heroResult as any} />

      {/* Schools Carousel - Member institutions */}
      <SchoolsGrid schools={schools} />

      {/* About CESAFI - Mission and vision */}
      <AboutCesafi />

      {/* Sponsors - Move to mid-page for higher visibility */}
      <SponsorsGrid />

      {/* Latest News - Content engagement */}
      <LatestNews initialArticles={articles} />

      {/* Upcoming Games - Sports showcase */}
      <UpcomingGames initialMatches={matches} />

      {/* Photo Gallery - Visual storytelling */}
      <PhotoGallery />

      {/* FAQ - Quick answers */}
      <LandingFaq initialFaqs={highlightedFaqs} />

      {/* Sponsors previously at bottom - now shown above */}
    </>
  );
}
