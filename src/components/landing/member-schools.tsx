'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { mangoGrotesque, roboto } from '@/lib/fonts';

const memberSchools = [
  { 
    name: 'University of San Carlos',
    logo: '/img/cesafi-logo.webp', // Fallback to CESAFI logo
    website: 'https://usc.edu.ph'
  },
  { 
    name: 'University of Cebu',
    logo: '/img/cesafi-logo.webp',
    website: 'https://uc.edu.ph'
  },
  { 
    name: 'Cebu Institute of Technology',
    logo: '/img/cesafi-logo.webp',
    website: 'https://cit.edu'
  },
  { 
    name: 'University of San Jose Recoletos',
    logo: '/img/cesafi-logo.webp',
    website: 'https://usjr.edu.ph'
  },
  { 
    name: 'University of the Philippines Cebu',
    logo: '/img/cesafi-logo.webp',
    website: 'https://upcebu.edu.ph'
  },
  { 
    name: 'Cebu Normal University',
    logo: '/img/cesafi-logo.webp',
    website: 'https://cnu.edu.ph'
  },
  { 
    name: 'University of Southern Philippines',
    logo: '/img/cesafi-logo.webp',
    website: 'https://usp.edu.ph'
  },
  { 
    name: 'Southwestern University',
    logo: '/img/cesafi-logo.webp',
    website: 'https://swu.edu.ph'
  },
  { 
    name: 'Cebu Technological University',
    logo: '/img/cesafi-logo.webp',
    website: 'https://ctu.edu.ph'
  },
  { 
    name: 'University of San Carlos - Talamban',
    logo: '/img/cesafi-logo.webp',
    website: 'https://usc.edu.ph'
  },
];

export default function MemberSchools() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`${mangoGrotesque.className} text-4xl lg:text-5xl font-bold text-foreground mb-6`}>
            MEMBER SCHOOLS
          </h2>
          <p className={`${roboto.className} text-xl text-muted-foreground max-w-3xl mx-auto`}>
            Proud to have these prestigious institutions as part of the Cebu Schools Athletic Foundation.
          </p>
        </motion.div>

        {/* Schools Grid with Logos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {memberSchools.map((school, index) => (
            <motion.div
              key={school.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <a
                href={school.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-card p-6 rounded-xl border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                {/* School Logo */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-card rounded-lg flex items-center justify-center p-2 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <Image
                      src={school.logo}
                      alt={`${school.name} logo`}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                
                {/* School Name */}
                <h3 className={`${mangoGrotesque.className} text-lg font-semibold text-foreground text-center group-hover:text-primary transition-colors duration-300`}>
                  {school.name}
                </h3>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}