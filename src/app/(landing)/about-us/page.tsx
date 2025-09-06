import AboutUsHero from '@/components/about-us/about-us-hero';
import AboutUsFaq from '@/components/about-us/about-us-faq';
import AboutUsNews from '@/components/about-us/about-us-news';

export default function AboutUsPage() {
  return (
    <>
      {/* Hero Section */}
      <AboutUsHero />
      
      {/* FAQ Section */}
      <AboutUsFaq />
      
      {/* News Integration */}
      <AboutUsNews />
    </>
  );
}
