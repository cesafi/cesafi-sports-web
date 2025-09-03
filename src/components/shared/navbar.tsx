'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { mangoGrotesque, roboto } from '@/lib/fonts';
import ThemeSwitcher from '@/components/theme-switcher';
import Image from 'next/image';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Schedule', href: '/schedule' },
  { name: 'Articles', href: '/articles' },
  { name: 'Schools', href: '/schools' },
  { name: 'Partners', href: '/partners' },
  { name: 'Volunteers', href: '/volunteers' },
  { name: 'About', href: '/about' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);


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

          {/* Right Side - Theme Switcher */}
          <div className="hidden lg:flex items-center space-x-4">
            <ThemeSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-200"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/95 backdrop-blur-md border-t border-border"
          >
            <div className="px-4 py-6 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`${roboto.className} block text-muted-foreground hover:text-primary py-3 px-4 rounded-lg hover:bg-muted/50 font-medium transition-colors duration-200`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-border">
                <ThemeSwitcher />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
