'use client';

import { useCurrentActiveHeroSection } from '@/hooks/use-hero-section';
import { useScroll, motion } from 'framer-motion';
import { useRef } from 'react';
import { Loader2, AlertCircle, ChevronDown, Play } from 'lucide-react';
import Image from 'next/image';
import LazyYouTube from '@/components/ui/lazy-youtube';


export default function HeroSection() {
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
  const isLive = heroData?.data?.is_active && heroData?.data?.video_link;
  
  const videoId = isLive
    ? getVideoId(heroData?.data?.video_link!) || FALLBACK_VIDEO_ID
    : null; // No YouTube video ID needed for local loop

  const videoTitle = isLive
    ? 'CESAFI Live Video'
    : 'CESAFI Season 25 Trailer';

  // Handle live button click
  const handleLiveClick = () => {
    if (heroData?.data?.video_link) {
      window.open(heroData.data.video_link, '_blank', 'noopener,noreferrer');
    }
  };




  return (
    <section ref={ref} className="relative h-[calc(100vh-4rem)] overflow-hidden">
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
      <div className="absolute inset-0 overflow-hidden">
        {isLive && videoId ? (
          <div className="absolute inset-0 transform scale-[2.5] sm:scale-[2] md:scale-[1.8] lg:scale-[1.15] xl:scale-108">
            <LazyYouTube
              videoId={videoId}
              title={videoTitle}
              autoplay={true}
              muted={false}
              loop={true}
              controls={false}
              showThumbnail={false}
              className="h-screen w-screen scale-[2.5] sm:scale-[2] md:scale-[1.6] lg:scale-[1.15] xl:scale-108 pointer-events-none -top-20"
            />
          </div>
        ) : (
          /* Local Video Loop */
          <div className="absolute inset-0">
             <video
                autoPlay
                muted
                loop
                playsInline
                poster="/img/hero-poster.jpg"
                className="object-cover w-full h-full transform scale-105"
             >
                <source src="/videos/hero-loop.mp4" type="video/mp4" />
                <source src="/videos/hero-loop.webm" type="video/webm" />
                Your browser does not support the video tag.
             </video>
          </div>
        )}
      </div>

      {/* Subtle gradient overlay - darker at edges, transparent in center */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      {/* Subtle gradient overlay - darker at edges, transparent in center */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

      {/* Green Wavy Gradient Overlay - Only for Trailer Video */}
      {!isLive && (
        <>
          {/* Full-screen gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-green-900/40 to-transparent" />
          
          {/* Animated Wave SVG - Multi-layer like CEL */}
          <div className="absolute bottom-0 left-0 w-full z-10 overflow-hidden pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 24 150 28"
              height={120}
              preserveAspectRatio="none"
              className="w-full"
            >
              <defs>
                <path
                  id="wave-path"
                  d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
                />
              </defs>

              {/* Wave 1 - Slowest, most transparent */}
              <motion.g
                initial={{ x: 0 }}
                animate={{ x: [0, -40, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <use xlinkHref="#wave-path" x="50" y="3" fill="rgba(20, 83, 45, 0.3)" />
              </motion.g>

              {/* Wave 2 - Medium speed */}
              <motion.g
                initial={{ x: 0 }}
                animate={{ x: [0, -60, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <use xlinkHref="#wave-path" x="50" y="0" fill="rgba(20, 83, 45, 0.5)" />
              </motion.g>

              {/* Wave 3 - Fastest, matches page background for seamless transition */}
              <motion.g
                initial={{ x: 0 }}
                animate={{ x: [0, -80, 0] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <use xlinkHref="#wave-path" x="50" y="7" className="fill-muted" />
              </motion.g>
            </svg>
          </div>
        </>
      )}



      {/* Mobile Content - Centered */}
      <div className="relative z-10 flex lg:hidden h-full items-center justify-center p-8">
        <div className="text-center space-y-8">
          {/* Giant Floating Animated Logo */}
          <div className="animate-fade-in-up opacity-0 animation-delay-1000">
            <div className="w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center p-4 mx-auto animate-float">
              <Image
                src="/img/cesafi-logo.webp"
                alt="CESAFI Logo"
                width={320}
                height={320}
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Watch Live Button - Mobile */}
          {heroData?.data?.is_active && (
            <div className="animate-fade-in-up opacity-0 animation-delay-2000">
              <button
                onClick={handleLiveClick}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 shadow-xl hover:shadow-red-500/25 hover:scale-105 flex items-center space-x-2 mx-auto border-2 border-red-500/50 animate-pulse font-moderniz"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Watch Live</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Content - Bottom Left */}
      <div className="relative z-10 hidden lg:flex h-full items-end justify-start p-8">
        <div className="space-y-6 w-full max-w-7xl mx-auto flex items-end justify-between">
          <div className="space-y-6">
            {/* Floating Animated Logo (Only show in Live mode or if desired) */}
            <div className="animate-fade-in-up opacity-0 animation-delay-1000">
              <div className="w-32 h-32 flex items-center justify-center animate-float-gentle">
                <Image
                  src="/img/cesafi-logo.webp"
                  alt="CESAFI Logo"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Watch Live Button - Desktop */}
            {isLive ? (
              <div className="animate-fade-in-up opacity-0 animation-delay-2000">
                <button
                  onClick={handleLiveClick}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 shadow-xl hover:shadow-red-500/25 hover:scale-105 flex items-center space-x-2 border-2 border-red-500/50 animate-pulse font-moderniz"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Watch Live</span>
                </button>
              </div>
            ) : (
              <div className="animate-fade-in-up opacity-0 animation-delay-2000">
                 <h1 className="text-4xl md:text-6xl font-black text-white font-moderniz drop-shadow-lg mb-2">
                  SEASON 25<br/>
                  <span className="text-primary">trailer</span>
                 </h1>
                 <p className="text-white/80 text-lg max-w-md mb-6">
                   Relive the most intense moments from the season.
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="flex flex-col items-center text-white/70 hover:text-white transition-colors cursor-pointer">
          <span className="text-xs mb-2 font-medium">Scroll</span>
          <ChevronDown className="w-6 h-6" />
        </div>
      </div>
    </section>
  );
}
