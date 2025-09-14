import InfiniteLogoCarousel from '@/components/landing/sponsors-logo-carousel';
import { getActiveSchools } from '@/actions/schools'
import { School } from '@/lib/types/schools';

export default async function SchoolsCarousel() {
  const schoolsResponse = await getActiveSchools();

  if (!schoolsResponse.success || !schoolsResponse.data) {
    return (
      <section className="overflow-hidden">
        <div className="py-8 w-full text-center text-gray-500">
          Unable to load schools
        </div>
      </section>
    );
  }

  const schools = schoolsResponse.data;

  const logos = schools.map((school: School) => ({
    src: school.logo_url || '/img/cesafi-logo.webp',
    alt: school.logo_url ? `${school.name} Logo` : `${school.name} - CESAFI Logo`,
    url: `/schools/${school.abbreviation.toLowerCase()}`
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
