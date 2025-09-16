'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { roboto } from '@/lib/fonts';
import ThemeSwitcher from '@/components/theme-switcher';
import LiveIndicator from '@/components/live-indicator';
import { useCurrentActiveHeroSection } from '@/hooks/use-hero-section';
import Image from 'next/image';
import { navItems } from '@/lib/constants/navigation';
import { RealTimeClock, CompactClock } from '@/components/real-time-clock';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: heroData } = useCurrentActiveHeroSection();


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background/80 backdrop-blur-lg border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <Image src='/img/cesafi-logo.webp' alt="CESAFI Logo" width={40} height={80} className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${roboto.className} px-4 py-2 rounded-lg text-muted-foreground hover:text-primary transition-colors duration-200 font-medium`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side - Desktop: Clock, Live Indicator & Theme Switcher */}
          <div className="hidden lg:flex items-center space-x-4">
            <RealTimeClock 
              className="text-muted-foreground"
              showIcon={true}
              showTimezone={false}
              size="sm"
            />
            <div className="w-px h-6 bg-border" />
            <LiveIndicator
              isLive={heroData?.data?.is_active || false}
              liveUrl={heroData?.data?.video_link}
              title="CESAFI Live Stream"
              timeRemaining={heroData?.data?.time_remaining}
              variant="navbar"
            />
            <ThemeSwitcher />
          </div>

          {/* Mobile Right Side - Clock, Live Indicator, Theme Switcher & Menu Button */}
          <div className="flex lg:hidden items-center space-x-3">
            <CompactClock className="text-muted-foreground" />
            <LiveIndicator
              isLive={heroData?.data?.is_active || false}
              liveUrl={heroData?.data?.video_link}
              title="CESAFI Live Stream"
              timeRemaining={heroData?.data?.time_remaining}
              variant="compact"
            />
            <ThemeSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 h-screen w-80 bg-background border-l border-border shadow-2xl z-50"
            >
              <div className="flex flex-col h-full bg-background">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <Image
                      src='/img/cesafi-logo.webp'
                      alt="CESAFI Logo"
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-200"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 px-6 py-8 overflow-y-auto">
                  <div className="space-y-2">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`${roboto.className} flex items-center space-x-3 text-foreground hover:text-primary py-4 px-4 rounded-xl hover:bg-muted/50 font-medium transition-all duration-200 group`}
                        >
                          <div className="w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary transition-colors duration-200" />
                          <span className="text-lg">{item.name}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer - Optional branding or info */}
                <div className="p-6 border-t border-border">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-sm text-muted-foreground"
                  >
                    Cebu Schools Athletics Foundation, Inc.
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
