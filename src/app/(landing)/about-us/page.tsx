import { Suspense } from 'react';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import AboutUsHero from '@/components/about-us/about-us-hero';
import AboutUsFaq from '@/components/about-us/about-us-faq';
import AboutUsNews from '@/components/about-us/about-us-news';

export default function AboutUsPage() {
  return (
    <div>
      <Navbar />
      <main>
        {/* Hero Section */}
        <AboutUsHero />
        
        {/* FAQ Section */}
        <AboutUsFaq />
        
        {/* News Integration */}
        <AboutUsNews />
      </main>
      <Footer />
    </div>
  );
}
