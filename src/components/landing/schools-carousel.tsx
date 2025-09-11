'use client';

import { useActiveSchools } from '@/hooks/use-schools';
import InfiniteLogoCarousel from '@/components/landing/sponsors-logo-carousel';
import { Skeleton } from '@/components/ui/skeleton';

export default function SchoolsCarousel() {
  const { data: schools, isLoading, error } = useActiveSchools();

  // Transform schools data into logo format for the carousel
  const schoolLogos = schools?.map(school => ({
    src: school.logo_url || '/img/cesafi-logo.webp',
    alt: school.name,
    url: `/schools/${school.abbreviation.toLowerCase()}`
  })) || [];

  if (isLoading) {
    return (
      <section className="overflow-hidden">
        <div className="py-8 w-full">
          <div className="flex space-x-8 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-32 rounded-lg bg-muted/80" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !schools || schools.length === 0) {
    return (
      <section className="overflow-hidden">
        <div className="py-8 w-full text-center">
          <p className="text-muted-foreground">No active schools available</p>
        </div>
      </section>
    );
  }

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
