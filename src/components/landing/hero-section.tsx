'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Users, Trophy, Calendar, Target } from 'lucide-react';
import { mangoGrotesque, roboto } from '@/lib/fonts';

export default function HeroSection() {
  const stats = [
    { icon: Users, value: '25+', label: 'Member Schools' },
    { icon: Trophy, value: '100+', label: 'Championships' },
    { icon: Calendar, value: '200+', label: 'Annual Events' },
    { icon: Target, value: '5000+', label: 'Student Athletes' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* CESAFI Logo */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <Image
              src="/img/cesafi-logo.webp"
              alt="CESAFI Logo"
              width={200}
              height={200}
              className="w-32 h-32 sm:w-40 sm:h-40"
            />
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <h1 className={`${mangoGrotesque.className} text-5xl sm:text-6xl lg:text-7xl font-black leading-tight`}>
              <span className="text-foreground">CEBU SCHOOLS</span>
              <br />
              <span className="text-primary">ATHLETIC FOUNDATION</span>
            </h1>
            
            <p className={`${roboto.className} text-xl sm:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed`}>
              Uniting Cebu's finest educational institutions through the power of sports, 
              fostering excellence, teamwork, and community spirit.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
          >
            <button className={`${mangoGrotesque.className} bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-5 rounded-2xl font-bold text-xl uppercase tracking-wider transition-all duration-300 hover:scale-105 shadow-2xl`}>
              Explore Sports
            </button>
            <button className={`${mangoGrotesque.className} bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-10 py-5 rounded-2xl font-bold text-xl uppercase tracking-wider transition-all duration-300 hover:scale-105`}>
              View Schedule
            </button>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-20 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-4 group-hover:bg-primary/30 transition-colors duration-300">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className={`${mangoGrotesque.className} text-3xl font-bold text-foreground mb-2`}>
                  {stat.value}
                </div>
                <div className={`${roboto.className} text-sm text-muted-foreground font-medium`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-primary rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}