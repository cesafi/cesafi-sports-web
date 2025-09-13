
'use client';

import { useActiveSponsors } from '@/hooks/use-sponsors';
import InfiniteLogoCarousel from '@/components/landing/sponsors-logo-carousel';
import { Skeleton } from '@/components/ui/skeleton';

export default function SponsorsCarousel() {
  const { data: sponsors, isLoading, error } = useActiveSponsors();

  const sponsorLogos = sponsors?.map(sponsor => ({
    src: sponsor.logo_url || '/img/cesafi-logo.webp',
    alt: sponsor.tagline || sponsor.title || 'Sponsor'
  })) || [];

  if (isLoading) {
    return (
      <section className="overflow-hidden">
        <div className="py-8 w-full">
          <div className="flex items-center justify-center space-x-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-32 bg-muted/80" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !sponsors || sponsors.length === 0) {
    return (
      <section className="overflow-hidden">
        <div className="py-8 w-full">
          <div className="text-center text-muted-foreground">
            <p>No sponsors available at the moment</p>
          </div>
        </div>
      </section>
    );
  }

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
