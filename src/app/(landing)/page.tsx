import HeroSection from '@/components/landing/hero-section';
import AboutCesafi from '@/components/landing/about-cesafi';
import UpcomingGames from '@/components/landing/upcoming-games';
import PhotoGallery from '@/components/landing/photo-gallery';
import LatestNews from '@/components/landing/latest-news';
import SponsorsCarousel from '@/components/landing/sponsors-carousel';
import SchoolsCarousel from '@/components/landing/schools-carousel';

export default function LandingPage() {
  return (
    <>
      {/* Hero Section - Full screen impact */}
      <HeroSection />
      
      {/* Schools Carousel - Member institutions */}
      <SchoolsCarousel />
      
      {/* About CESAFI - Mission and vision */}
      <AboutCesafi />
      
      {/* Latest News - Content engagement */}
      <LatestNews />
      
      {/* Upcoming Games - Sports showcase */}
      <UpcomingGames />
      
      {/* Photo Gallery - Visual storytelling */}
      <PhotoGallery />
      
      {/* Sponsors Carousel - Partner organizations */}
      <SponsorsCarousel />
    </>
  );
}
