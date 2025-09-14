
import InfiniteLogoCarousel from '@/components/landing/sponsors-logo-carousel';
import { getActiveSponsors } from '@/actions/sponsors';
import { Sponsor } from '@/lib/types/sponsors';

export default async function SponsorsCarousel() {
  const sponsorsResponse = await getActiveSponsors();

  // Handle the case where the API call fails
  if (!sponsorsResponse.success || !sponsorsResponse.data) {
    return (
      <section className="overflow-hidden">
        <div className="py-8 w-full text-center text-gray-500">
          Unable to load sponsors
        </div>
      </section>
    );
  }

  const sponsors = sponsorsResponse.data;

  const logos = sponsors.map((sponsor: Sponsor) => ({
    src: sponsor.logo_url || '/img/cesafi-logo.webp',
    alt: sponsor.logo_url ? sponsor.title : `${sponsor.title} - CESAFI Logo`
  }));

  return (
    <section className="overflow-hidden">
      <InfiniteLogoCarousel
        logos={logos}
        direction="left"
        speed="slow"
        className="py-8 w-full"
      />
    </section>
  );
}
