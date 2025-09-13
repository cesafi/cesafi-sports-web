'use client';

import { moderniz } from '@/lib/fonts';

export default function SchoolsHero() {
  return (
    <section className="pb-16 pt-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`${moderniz.className} text-4xl md:text-5xl font-bold text-foreground text-center`}>
          Member Schools
        </h1>
      </div>
    </section>
  );
}
