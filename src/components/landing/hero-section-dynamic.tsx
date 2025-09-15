'use client';

import { useCurrentActiveHeroSection } from '@/hooks/use-hero-section';
import { useScroll } from 'framer-motion';
import { useRef } from 'react';
import { Loader2, Play, AlertCircle } from 'lucide-react';
import LazyYouTube from '@/components/ui/lazy-youtube';

export default function HeroSectionDynamic() {
  const ref = useRef(null);
  const _scrollYProgress = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });

  const { data: heroData, isLoading, error } = useCurrentActiveHeroSection();

  // Fallback video ID (current hardcoded video)
  const FALLBACK_VIDEO_ID = '8Mz9ytswq7E';

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };



  // Determine which video to show
  const videoId = heroData?.data?.is_active && heroData.data.video_link 
    ? getVideoId(heroData.data.video_link) || FALLBACK_VIDEO_ID
    : FALLBACK_VIDEO_ID;

  const videoTitle = heroData?.data?.is_active && heroData.data.video_link
    ? 'CESAFI Live Video'
    : '𝐂𝐄𝐒𝐀𝐅𝐈 𝐒𝐄𝐀𝐒𝐎𝐍 𝟐𝟓 𝐇𝐈𝐆𝐇 𝐒𝐂𝐇𝐎𝐎𝐋 𝐀𝐍𝐃 𝐂𝐎𝐋𝐋𝐄𝐆𝐄 𝐁𝐀𝐒𝐊𝐄𝐓𝐁𝐀𝐋𝐋 𝐁𝐀𝐓𝐓𝐋𝐄';

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-20">
          <div className="text-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading video content...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-20">
          <div className="text-center text-white">
            <AlertCircle className="w-8 h-8 mx-auto mb-4 text-yellow-500" />
            <p className="text-lg">Unable to load video content</p>
            <p className="text-sm text-gray-400 mt-2">Using fallback video</p>
          </div>
        </div>
      )}

      {/* Video Background */}
      <div className="absolute inset-0">
        <LazyYouTube
          videoId={videoId}
          title={videoTitle}
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

      {/* Live indicator for active hero section */}
      {heroData?.data?.is_active && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>
      )}

      {/* Time remaining indicator */}
      {heroData?.data?.is_active && heroData.data.time_remaining && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            <Play className="w-4 h-4 inline mr-1" />
            {heroData.data.time_remaining} left
          </div>
        </div>
      )}

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

