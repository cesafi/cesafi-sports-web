'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Youtube, Facebook, Calendar, Trophy, Activity, Building2, Users, UserCircle, Info, HelpCircle, Mail, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import { roboto } from '@/lib/fonts';
import ThemeSwitcher from '@/components/theme-switcher';
import LiveIndicator from '@/components/live-indicator';
import { useCurrentActiveHeroSection } from '@/hooks/use-hero-section';
import Image from 'next/image';
import { navItems, NavItem } from '@/lib/constants/navigation';
import { RealTimeClock, CompactClock } from '@/components/real-time-clock';

const dropdownData: Record<string, { icon: any, description: string }> = {
  'Schedule': { icon: Calendar, description: 'View upcoming games & results' },
  'Standings': { icon: Trophy, description: 'Current team rankings' },
  'Statistics': { icon: Activity, description: 'Player & team stats' },
  'Schools': { icon: Building2, description: 'Member institutions & profiles' },
  'Players': { icon: Users, description: 'Athlete database' },
  'Volunteers': { icon: UserCircle, description: 'Join our team' },
  'About Us': { icon: Info, description: 'Our history and mission' },
  'FAQ': { icon: HelpCircle, description: 'Frequently asked questions' },
  'Contact Us': { icon: Mail, description: 'Get in touch' },
  'Sponsors': { icon: HeartHandshake, description: 'Supporting organizations' },
};

// Custom Dropdown Component
function NavDropdown({ item }: { item: NavItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative group" 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        className={`${roboto.className} px-4 py-2 rounded-lg text-muted-foreground hover:text-primary transition-colors duration-200 font-medium flex items-center gap-1 outline-none group-hover:text-primary`}
        aria-expanded={isOpen}
      >
        {item.name}
        <ChevronDown 
          className={`w-4 h-4 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-background/95 backdrop-blur-md border border-border/50 shadow-2xl overflow-hidden z-50 p-2 space-y-1"
          >
            {item.children?.map((child) => {
              const meta = dropdownData[child.name];
              const Icon = meta?.icon;
              return (
                <Link
                  key={child.name}
                  href={child.href}
                  className="group/link flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 transition-all duration-200"
                >
                  {Icon && (
                    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground group-hover/link:scale-105 transition-transform duration-200 flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className={`${roboto.className} text-sm font-medium text-foreground group-hover/link:text-primary transition-colors`}>
                      {child.name}
                    </span>
                    {meta?.description && (
                      <span className={`${roboto.className} text-xs text-muted-foreground line-clamp-1`}>
                        {meta.description}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 space-x-1">
            {navItems.map((item) => (
              item.children ? (
                <NavDropdown key={item.name} item={item} />
              ) : (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={`${roboto.className} px-4 py-2 rounded-lg text-muted-foreground hover:text-primary transition-colors duration-200 font-medium`}
                >
                  {item.name}
                </Link>
              )
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
            <div className="flex items-center space-x-1">
              <a
                href="https://www.youtube.com/@CESAFIOfficial"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-muted/50 transition-colors duration-200"
                aria-label="CESAFI YouTube Channel"
              >
                <Youtube size={18} />
              </a>
              <a
                href="https://www.facebook.com/thecesafi"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-muted/50 transition-colors duration-200"
                aria-label="CESAFI Facebook Page"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.tiktok.com/@cesafi"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-foreground hover:text-black dark:hover:text-white hover:bg-muted/50 transition-colors duration-200"
                aria-label="CESAFI TikTok"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                </svg>
              </a>
            </div>
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
            <a
              href="https://www.youtube.com/@CESAFIOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
              aria-label="CESAFI YouTube"
            >
              <Youtube size={18} />
            </a>
            <a
              href="https://www.facebook.com/cesikilig"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-500 transition-colors"
              aria-label="CESAFI Facebook"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://www.tiktok.com/@cesafi"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-black dark:hover:text-white transition-colors"
              aria-label="CESAFI TikTok"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
              </svg>
            </a>
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
              className="lg:hidden fixed top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 h-screen w-80 bg-background border-l border-border shadow-2xl z-[70]"
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
                <div key={item.name}>
                  {item.children ? (
                    <div className="space-y-1">
                      <div className="px-4 py-2 font-semibold text-muted-foreground/70 text-sm uppercase tracking-wider">
                        {item.name}
                      </div>
                      <div className="pl-4 space-y-1">
                        {item.children.map((child, childIndex) => (
                          <motion.div
                            key={child.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (index * 0.1) + (childIndex * 0.05) }}
                          >
                            <Link
                              href={child.href}
                              onClick={() => setIsMenuOpen(false)}
                              className={`${roboto.className} flex items-center space-x-3 text-foreground hover:text-primary py-3 px-4 rounded-xl hover:bg-muted/50 font-medium transition-all duration-200 group`}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors duration-200" />
                              <span className="text-lg">{child.name}</span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href!}
                        onClick={() => setIsMenuOpen(false)}
                        className={`${roboto.className} flex items-center space-x-3 text-foreground hover:text-primary py-4 px-4 rounded-xl hover:bg-muted/50 font-medium transition-all duration-200 group`}
                      >
                        <div className="w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary transition-colors duration-200" />
                        <span className="text-lg">{item.name}</span>
                      </Link>
                    </motion.div>
                  )}
                </div>
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
