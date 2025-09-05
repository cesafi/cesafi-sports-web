import InfiniteLogoCarousel from '@/components/landing/sponsors-logo-carousel';

// Mock school logos - in production this would come from your schools data
const schoolLogos = [
  { src: '/img/cesafi-logo.webp', alt: 'University of San Carlos', url: 'https://usc.edu.ph' },
  { src: '/img/cesafi-logo.webp', alt: 'University of Cebu', url: 'https://uc.edu.ph' },
  { src: '/img/cesafi-logo.webp', alt: 'Cebu Institute of Technology', url: 'https://cit.edu' },
  { src: '/img/cesafi-logo.webp', alt: 'University of San Jose Recoletos', url: 'https://usjr.edu.ph' },
  { src: '/img/cesafi-logo.webp', alt: 'University of the Philippines Cebu', url: 'https://upcebu.edu.ph' },
  { src: '/img/cesafi-logo.webp', alt: 'Cebu Normal University', url: 'https://cnu.edu.ph' },
  { src: '/img/cesafi-logo.webp', alt: 'Southwestern University', url: 'https://swu.edu.ph' },
  { src: '/img/cesafi-logo.webp', alt: 'University of the Visayas', url: 'https://uv.edu.ph' },
];

export default function SchoolsCarousel() {
  return (
    <section className="overflow-hidden">
      <InfiniteLogoCarousel
        logos={schoolLogos}
        direction="left"
        speed="slow"
        className="py-8 w-full"
      />
    </section>
  );
}
