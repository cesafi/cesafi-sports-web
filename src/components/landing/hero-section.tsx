'use client';

import { useScroll } from 'framer-motion';
import { useRef } from 'react';
import { Users, Trophy, Calendar, Target } from 'lucide-react';

export default function HeroSection() {
  const ref = useRef(null);
  const _scrollYProgress = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const _stats = [
    { icon: Users, value: '8+', label: 'Member Schools' },
    { icon: Trophy, value: '50+', label: 'Championships' },
    { icon: Calendar, value: '100+', label: 'Annual Events' },
    { icon: Target, value: '5000+', label: 'Student Athletes' },
  ];

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden bg-background pt-20">
      {/* Video Background Container - Ready for video */}
      <div className="absolute inset-0">
        {/* Placeholder for video - you can replace this with your video element */}
        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20" />

        {/* Video overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" />
      </div>
    </section>
  );
}
