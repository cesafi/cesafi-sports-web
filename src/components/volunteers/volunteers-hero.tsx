'use client';

import { motion } from 'framer-motion';
import { Users, Heart, Briefcase } from 'lucide-react';
import { moderniz, roboto } from '@/lib/fonts';

export default function VolunteersHero() {
  const stats = [
    { icon: Users, value: '999', label: 'Active Volunteers' },
    { icon: Heart, value: '99', label: 'Years of Service' },
    { icon: Briefcase, value: '99', label: 'Departments' },
  ];

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzM2YzYxIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] bg-repeat" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`${moderniz.className} text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6`}
          >
            Meet Our
            <span className="block text-primary">Volunteers</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`${roboto.className} text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed`}
          >
            Dedicated individuals who make CESAFI possible through their passion, 
            commitment, and unwavering support for student athletics across all seasons.
          </motion.p>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="flex flex-col items-center group"
              >
                <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300 mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className={`${moderniz.className} text-3xl md:text-4xl font-bold text-foreground mb-2`}>
                  {stat.value}
                </div>
                <div className={`${roboto.className} text-muted-foreground text-sm font-medium`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
