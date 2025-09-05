'use client';

import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { moderniz, roboto } from '@/lib/fonts';

export default function AboutCesafi() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Enhanced parallax transforms for smoother effects
  const y1 = useTransform(scrollYProgress, [0, 0.6], [120, 0]);
  const y2 = useTransform(scrollYProgress, [0.1, 0.7], [180, 0]);

  const opacity1 = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.6], [0, 1]);

  return (
    <section ref={ref} className="min-h-screen bg-muted/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 items-center min-h-[90vh]">

          {/* Left Side - CESAFI Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
            animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.8, rotateY: -15 }}
            transition={{
              duration: 1.2,
              delay: 0.3,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            className="flex justify-center lg:justify-start"
          >
            <div className="relative">
              {/* Glowing background effect */}
              <motion.div
                animate={isInView ? {
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                } : { scale: 1, opacity: 0.3 }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"
              />

              {/* Floating particles effect */}
              <motion.div
                animate={isInView ? {
                  y: [0, -20, 0],
                  rotate: [0, 180, 360]
                } : { y: 0, rotate: 0 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-3 h-3 bg-primary/40 rounded-full"
              />
              <motion.div
                animate={isInView ? {
                  y: [0, 15, 0],
                  rotate: [0, -180, -360]
                } : { y: 0, rotate: 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-6 -left-6 w-2 h-2 bg-primary/30 rounded-full"
              />
              <motion.div
                animate={isInView ? {
                  y: [0, -10, 0],
                  x: [0, 10, 0]
                } : { y: 0, x: 0 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 -right-8 w-1.5 h-1.5 bg-primary/50 rounded-full"
              />

              {/* Main logo with enhanced effects */}
              <motion.div
                animate={isInView ? {
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.02, 1],
                  y: [0, -5, 0]
                } : { rotate: 0, scale: 1, y: 0 }}
                transition={{
                  duration: 4,
                  delay: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut"
                }}
                className="relative z-10 flex items-center justify-center"
              >
                <Image
                  src="/img/cesafi-logo.webp"
                  alt="CESAFI Logo"
                  width={400}
                  height={400}
                  className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 drop-shadow-2xl filter brightness-110 contrast-110"
                />
              </motion.div>

              {/* Pulsing ring effect */}
              <motion.div
                animate={isInView ? {
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0, 0.4]
                } : { scale: 1, opacity: 0.4 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 border-2 border-primary/30 rounded-full"
              />
              <motion.div
                animate={isInView ? {
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0, 0.2]
                } : { scale: 1, opacity: 0.2 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute inset-0 border border-primary/20 rounded-full"
              />
            </div>
          </motion.div>

          {/* Right Side - Consolidated Text with Enhanced Parallax */}
          <div className="lg:col-span-2 space-y-20">

            {/* Main Text Block - Large and Spacious */}
            <motion.div
              style={{ y: y1, opacity: opacity1 }}
              className="space-y-8"
            >
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`${moderniz.className} text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-foreground leading-[1.2] tracking-tight`}
              >
                Showcasing
                <span className="text-accent"> top-class performance</span> and
                <span className="text-secondary"> innovation</span> from the best of the best.
              </motion.p>
            </motion.div>

            {/* Supporting Text Block - Enhanced Fade Effect */}
            <motion.div
              style={{ y: y2, opacity: opacity2 }}
              className="space-y-12"
            >
              <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 1.2, delay: 0.8 }}
                className={`${roboto.className} text-xl lg:text-2xl xl:text-3xl text-muted-foreground leading-relaxed max-w-4xl`}
              >
                Honoring the athletes, coaches, and institutions who define the future of competitive sports in Cebu.
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
                transition={{
                  duration: 0.8,
                  delay: 1.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                className={`${moderniz.className} bg-foreground hover:bg-foreground/90 text-background px-10 py-5 rounded-2xl font-semibold text-xl uppercase tracking-wide transition-all duration-300 shadow-lg`}
              >
                Learn More
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
