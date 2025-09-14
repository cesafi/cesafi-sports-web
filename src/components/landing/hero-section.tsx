'use client';

import { useScroll } from 'framer-motion';
import { useRef } from 'react';

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
        <iframe
          src="https://www.youtube.com/embed/8Mz9ytswq7E?autoplay=1&mute=1&loop=1&playlist=8Mz9ytswq7E&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1&start=0"
          title="𝐂𝐄𝐒𝐀𝐅𝐈 𝐒𝐄𝐀𝐒𝐎𝐍 𝟐𝟓 𝐇𝐈𝐆𝐇 𝐒𝐂𝐇𝐎𝐎𝐋 𝐀𝐍𝐃 𝐂𝐎𝐋𝐋𝐄𝐆𝐄 𝐁𝐀𝐒𝐊𝐄𝐓𝐁𝐀𝐋𝐋 𝐁𝐀𝐓𝐓𝐋𝐄"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full object-cover"
          frameBorder="0"
          style={{
            pointerEvents: 'none',
            transform: 'scale(1.1)',
            transformOrigin: 'center center'
          }}
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
