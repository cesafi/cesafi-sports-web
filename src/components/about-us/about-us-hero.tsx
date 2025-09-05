'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { moderniz, roboto } from '@/lib/fonts';

export default function AboutUsHero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden bg-background pt-20">
      {/* Background with dynamic light streaks */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gradient-to-br from-background via-muted/20 to-background" />
        
        {/* Animated light streaks */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent blur-sm"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent blur-sm"
          />
          <motion.div
            animate={{
              x: [0, 150, 0],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent blur-sm"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Section - Text Content */}
          <motion.div
            style={{ y, opacity }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className={`${moderniz.className} text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight`}>
                CESAFI
                <br />
                <span className="text-primary">SPORTS</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className={`${roboto.className} text-xl lg:text-2xl text-muted-foreground leading-relaxed`}>
                Honoring the athletes, coaches, and institutions who define the future of competitive sports in Cebu.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p className={`${roboto.className} text-lg text-muted-foreground leading-relaxed`}>
                CESAFI is dedicated to showcasing top-class performance and innovation from the players, teams, schools, events, and personalities within the Cebu sports scene.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Section - Visual Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Main Image Container */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 rounded-3xl p-8 border border-primary/20">
                <div className="relative h-96 bg-muted/30 rounded-2xl overflow-hidden">
                  <Image
                    src="/img/cesafi-banner.jpg"
                    alt="CESAFI Sports Excellence"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Overlay Text */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className={`${moderniz.className} text-2xl font-bold text-white mb-2`}>
                      Athletic Excellence
                    </h3>
                    <p className={`${roboto.className} text-white/90`}>
                      Celebrating the best in Cebu sports
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Award/Trophy Element */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-accent rounded-full flex items-center justify-center shadow-lg"
              >
                <div className="w-12 h-12 bg-accent-foreground rounded-full flex items-center justify-center">
                  <span className={`${moderniz.className} text-accent font-bold text-lg`}>🏆</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
