'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useActiveSchools } from '@/hooks/use-schools';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Plus } from 'lucide-react';
import { roboto } from '@/lib/fonts';

export default function SchoolsGrid() {
  const { data: schools, isLoading, error, isFetching } = useActiveSchools();

  // Show loading state while data is being fetched
  if (isLoading || isFetching) {
    return (
      <section className="py-12 bg-gradient-to-br from-background via-background/95 to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-background/40 backdrop-blur-lg rounded-lg shadow-lg border border-border/30 overflow-hidden">
                <div className="p-8 text-center h-80 flex flex-col justify-between">
                  {/* Logo Skeleton */}
                  <div className="flex justify-center">
                    <Skeleton className="h-32 w-32 rounded-lg bg-muted/80" />
                  </div>
                  
                  {/* Text Skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4 mx-auto bg-muted/80" />
                    <Skeleton className="h-4 w-1/2 mx-auto bg-muted/80" />
                  </div>
                  
                  {/* Button Skeleton */}
                  <Skeleton className="h-8 w-24 mx-auto rounded-full bg-muted/80" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Loading Indicator */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span className="text-sm">Loading schools...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state only if there's an actual error
  if (error) {
    return (
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-4">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-semibold text-foreground">Unable to load schools</h3>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state only if data has loaded but is empty
  if (schools && schools.length === 0) {
    return (
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-4">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-semibold text-foreground">No active schools found</h3>
            <p className="text-muted-foreground">Check back later for updates.</p>
          </div>
        </div>
      </section>
    );
  }

  // If we reach here but schools is undefined, show loading as fallback
  if (!schools) {
    return (
      <section className="py-12 bg-gradient-to-br from-background via-background/95 to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            <span className="text-sm">Loading schools...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {schools.map((school, index) => (
            <motion.div
              key={school.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
                       <Link href={`/schools/${school.abbreviation.toLowerCase()}`} className="block">
                <div className="bg-background/40 backdrop-blur-lg rounded-lg shadow-lg border border-border/30 overflow-hidden group-hover:shadow-xl group-hover:bg-background/50 group-hover:backdrop-blur-xl transition-all duration-300">
                  <div className="p-8 text-center h-80 flex flex-col justify-between">
                    {/* School Logo - Much Bigger */}
                    <div className="flex justify-center">
                      <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-white/20 group-hover:bg-white/30 transition-colors duration-300">
                        {school.logo_url ? (
                          <Image
                            src={school.logo_url}
                            alt={school.name}
                            fill
                            className="object-contain p-4"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Image
                              src="/img/cesafi-logo.webp"
                              alt="CESAFI Logo"
                              width={100}
                              height={100}
                              className="object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* School Info */}
                    <div className="space-y-2">
                      <h2 className={`${roboto.className} text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight`} style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {school.name}
                      </h2>
                      <p className={`${roboto.className} text-sm text-muted-foreground`}>
                        {school.abbreviation}
                      </p>
                    </div>

                    {/* View Profile Indicator */}
                    <div className="bg-white/20 rounded-full px-4 py-2 inline-flex items-center gap-2 group-hover:bg-primary/20 transition-colors duration-300">
                      <Plus className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                      <span className={`${roboto.className} text-xs text-muted-foreground group-hover:text-primary transition-colors duration-300`}>
                        VIEW PROFILE
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
