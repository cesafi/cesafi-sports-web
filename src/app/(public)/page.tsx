import HeroSection from '@/components/landing/hero-section';
import AboutCesafi from '@/components/landing/about-cesafi';
import UpcomingGames from '@/components/landing/upcoming-games';
import PhotoGallery from '@/components/landing/photo-gallery';
import MemberSchools from '@/components/landing/member-schools';
import LatestNews from '@/components/landing/latest-news';
import SponsorsCarousel from '@/components/landing/sponsors-carousel';

export default function LandingPage() {
  return (
    <div>
      <main>
        {/* Hero Section - Full screen impact */}
        <HeroSection />

        {/* About CESAFI - Mission and vision */}
        <AboutCesafi />

        {/* Upcoming Games - Sports showcase */}
        <UpcomingGames />

        {/* Photo Gallery - Visual storytelling */}
        <PhotoGallery />

        {/* Member Schools - Member institutions */}
        <MemberSchools />

        {/* Latest News - Content engagement */}
        <LatestNews />

        {/* Sponsors Carousel - Partner organizations */}
        <SponsorsCarousel />
      </main>
    </div>
  );
}
