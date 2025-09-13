
import InfiniteLogoCarousel from '@/components/landing/sponsors-logo-carousel';

// Mock sponsor logos - in production this would come from your sponsors data
const sponsorLogos = [
  { src: '/img/cesafi-logo.webp', alt: 'Sponsor 1', url: '#' },
  { src: '/img/cesafi-logo.webp', alt: 'Sponsor 2', url: '#' },
  { src: '/img/cesafi-logo.webp', alt: 'Sponsor 3', url: '#' },
  { src: '/img/cesafi-logo.webp', alt: 'Sponsor 4', url: '#' },
  { src: '/img/cesafi-logo.webp', alt: 'Sponsor 5', url: '#' },
  { src: '/img/cesafi-logo.webp', alt: 'Sponsor 6', url: '#' },
  { src: '/img/cesafi-logo.webp', alt: 'Sponsor 7', url: '#' },
  { src: '/img/cesafi-logo.webp', alt: 'Sponsor 8', url: '#' },
];

export default function SponsorsCarousel() {
  return (
    <section className="overflow-hidden">

      <InfiniteLogoCarousel
        logos={sponsorLogos}
        direction="left"
        speed="slow"
        className="py-8 w-full"
      />
    </section>
  );
}
