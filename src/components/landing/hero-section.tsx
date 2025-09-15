'use client';

import { useScroll } from 'framer-motion';
import { useRef } from 'react';
import LazyYouTube from '@/components/ui/lazy-youtube';

export default function HeroSection() {
  const ref = useRef(null);
  const _scrollYProgress = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden">
      {/* Full-screen YouTube video background */}
      <div className="absolute inset-0">
        <LazyYouTube
          videoId="8Mz9ytswq7E"
          title="𝐂𝐄𝐒𝐀𝐅𝐈 𝐒𝐄𝐀𝐒𝐎𝐍 𝟐𝟓 𝐇𝐈𝐆𝐇 𝐒𝐂𝐇𝐎𝐎𝐋 𝐀𝐍𝐃 𝐂𝐎𝐋𝐋𝐄𝐆𝐄 𝐁𝐀𝐒𝐊𝐄𝐓𝐁𝐀𝐋𝐋 𝐁𝐀𝐓𝐓𝐋𝐄"
          autoplay={true}
          muted={true}
          loop={true}
          controls={false}
          showThumbnail={false}
          className="scale-110 pointer-events-none"
        />
      </div>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content overlay */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Welcome to <span className="text-primary">CESAFI</span>
            </h1>
            <p className="mb-8 text-lg text-white/90 sm:text-xl lg:text-2xl">
              The official digital platform for the Cebu Schools Athletic Foundation, Inc. Your
              gateway to collegiate sports in Cebu, Philippines.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button className="bg-primary hover:bg-primary/90 rounded-lg px-8 py-3 font-semibold text-white transition-colors">
                View Schedule
              </button>
              <button className="border-white text-white hover:bg-white hover:text-gray-900 rounded-lg border-2 px-8 py-3 font-semibold transition-colors">
                Latest News
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
