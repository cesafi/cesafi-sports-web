'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAllSeasons } from '@/hooks/use-seasons';
import { useAllVolunteers } from '@/hooks/use-volunteers';
import { useAllDepartments } from '@/hooks/use-departments';
import { Skeleton } from '@/components/ui/skeleton';
import DepartmentGroups from './department-groups';
import { Calendar, Users } from 'lucide-react';
import { moderniz, roboto } from '@/lib/fonts';
import type { Season } from '@/lib/types/seasons';
import type { Volunteer } from '@/lib/types/volunteers';
import type { Department } from '@/lib/types/departments';

export default function SeasonalTabs() {
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);

  const { data: seasons, isLoading: seasonsLoading } = useAllSeasons();
  const { data: volunteers, isLoading: volunteersLoading } = useAllVolunteers();
  const { data: departments, isLoading: departmentsLoading } = useAllDepartments();

  // Set the first season as default when seasons load
  if (!selectedSeasonId && seasons && seasons.length > 0) {
    setSelectedSeasonId(seasons[0].id);
  }

  // Filter volunteers by selected season
  const filteredVolunteers = volunteers?.filter(
    volunteer => volunteer.season_id === selectedSeasonId && volunteer.is_active !== false
  ) || [];

  // Group volunteers by department
  const groupedVolunteers = departments?.map(department => ({
    department,
    volunteers: filteredVolunteers.filter(volunteer => volunteer.department_id === department.id)
  })).filter(group => group.volunteers.length > 0) || [];

  if (seasonsLoading || volunteersLoading || departmentsLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs Skeleton */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-wrap gap-2 p-1 bg-muted/30 rounded-lg">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-32 rounded-md" />
              ))}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, j) => (
                    <Skeleton key={j} className="h-80 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!seasons || seasons.length === 0) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 p-6 bg-muted/30 rounded-lg">
            <Calendar className="h-6 w-6 text-muted-foreground" />
            <span className={`${roboto.className} text-muted-foreground`}>
              No seasons available yet.
            </span>
          </div>
        </div>
      </section>
    );
  }

  const selectedSeason = seasons.find(season => season.id === selectedSeasonId);

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Season Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-2 p-1 bg-muted/30 rounded-lg">
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => setSelectedSeasonId(season.id)}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedSeasonId === season.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span className={moderniz.className}>
                  {new Date(season.start_at).getFullYear()} Season
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Season Info */}
        {selectedSeason && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className={`${moderniz.className} text-3xl md:text-4xl font-bold text-foreground mb-4`}>
              {new Date(selectedSeason.start_at).getFullYear()} Season
            </h2>
            <div className="flex items-center justify-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className={`${roboto.className} text-sm`}>
                  {filteredVolunteers.length} Volunteers
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span className={`${roboto.className} text-sm`}>
                  {groupedVolunteers.length} Departments
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Department Groups */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSeasonId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <DepartmentGroups 
              departmentGroups={groupedVolunteers}
              isLoading={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
