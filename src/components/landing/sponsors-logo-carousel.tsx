'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface Logo {
  src: string;
  alt: string;
  url?: string;
}

interface InfiniteLogoCarouselProps {
  logos: Logo[];
  direction?: 'left' | 'right';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export default function InfiniteLogoCarousel({
  logos,
  direction = 'left',
  speed = 'normal',
  className = ''
}: InfiniteLogoCarouselProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Speed configurations
  const speedConfig = {
    slow: { duration: 30, ease: 'linear' },
    normal: { duration: 20, ease: 'linear' },
    fast: { duration: 15, ease: 'linear' }
  };

  // Duplicate logos for seamless looping
  const duplicatedLogos = [...logos, ...logos];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main carousel track */}
      <motion.div
        className="flex items-center"
        animate={{
          x: direction === 'left'
            ? [0, -logos.length * 100]
            : [logos.length * 100, 0]
        }}
        transition={{
          ...speedConfig[speed],
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{
          animationPlayState: isHovered ? 'paused' : 'running'
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.src}-${index}`}
            className="flex-shrink-0 mx-4 sm:mx-6 lg:mx-8"
          >
            {logo.url ? (
              <Link
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="w-24 h-16 sm:w-32 sm:h-20 lg:w-40 lg:h-24 flex items-center justify-center p-3 transition-all duration-300 group-hover:scale-105 opacity-60 hover:opacity-100">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={80}
                    className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </Link>
            ) : (
              <div className="w-24 h-16 sm:w-32 sm:h-20 lg:w-40 lg:h-24 flex items-center justify-center p-3 opacity-60 hover:opacity-100 transition-all duration-300">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={80}
                  className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            )}
          </div>
        ))}
      </motion.div>


    </div>
  );
}
