// @ts-nocheck
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, SlidersHorizontal, ChevronDown, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { roboto } from '@/lib/fonts';
import { isToday, formatDateHeader } from './utils';
import { Season } from '@/lib/types/seasons';
import { SportsSeasonsStageWithDetails } from '@/lib/types/sports-seasons-stages';

function formatStage(stage: string) {
  if (!stage) return '';
  return stage.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function safeGetDateString(date: Date | null | undefined): string | null {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().split('T')[0];
}

export interface RichSportCategory {
  id: number;
  division: string;
  levels: string;
  full_name: string;
  sport: {
    id: number;
    name: string;
    logo_url: string | null;
    abbreviation: string | null;
  } | null;
}

interface ScheduleFilterBarProps {
  readonly currentDate: Date;
  readonly onDateChange: (date: Date) => void;
  readonly onPreviousDay?: () => void;
  readonly onNextDay?: () => void;
  readonly selectedSportId?: string;
  readonly onSportChange?: (id: string) => void;
  readonly selectedDivision?: string;
  readonly onDivisionChange?: (division: string) => void;
  readonly availableRichSports?: RichSportCategory[];
  readonly availableDates?: Date[];
  readonly availableSeasons?: Season[];
  readonly selectedSeason?: string;
  readonly onSeasonChange?: (seasonId: string) => void;
  readonly availableStages?: SportsSeasonsStageWithDetails[];
  readonly selectedStage?: string;
  readonly onStageChange?: (stageId: string) => void;
  readonly availableSchools?: any[];
  readonly selectedSchool?: string;
  readonly onSchoolChange?: (schoolId: string) => void;
  readonly selectedStatus?: string;
  readonly onStatusChange?: (status: string) => void;
  readonly onResetFilters?: () => void;
}

export default function ScheduleFilterBar({
  currentDate,
  onDateChange,
  onPreviousDay,
  onNextDay,
  selectedSportId = 'all',
  onSportChange,
  selectedDivision = 'all',
  onDivisionChange,
  availableRichSports = [],
  availableDates = [],
  availableSeasons = [],
  selectedSeason = 'all',
  onSeasonChange,
  availableStages = [],
  selectedStage = 'all',
  onStageChange,
  availableSchools = [],
  selectedSchool = 'all',
  onSchoolChange,
  selectedStatus = 'all',
  onStatusChange,
  onResetFilters
}: ScheduleFilterBarProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedSeason !== 'all') count++;
    if (selectedSportId !== 'all') count++;
    if (selectedDivision !== 'all') count++;
    if (selectedStage !== 'all') count++;
    if (selectedSchool !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    return count;
  }, [selectedSeason, selectedSportId, selectedDivision, selectedStage, selectedSchool, selectedStatus]);

  const uniqueSports = useMemo(() => {
    if (!availableRichSports || availableRichSports.length === 0) return [];
    const map = new Map();
    availableRichSports.forEach(cat => {
      if (cat.sport && !map.has(cat.sport.id)) {
        map.set(cat.sport.id, cat.sport);
      }
    });
    return Array.from(map.values());
  }, [availableRichSports]);

  const uniqueDivisions = useMemo(() => {
    if (!availableRichSports || availableRichSports.length === 0) return [];
    const divisions = new Set<string>();
    availableRichSports.forEach(cat => {
      if (selectedSportId !== 'all' && cat.sport?.id.toString() !== selectedSportId) return;
      divisions.add(cat.division);
    });
    return Array.from(divisions).sort();
  }, [availableRichSports, selectedSportId]);

  const uniqueFilteredStages = useMemo(() => {
    const filtered = availableStages.filter(stage => {
      if (selectedSeason !== 'all' && stage.season_id !== parseInt(selectedSeason)) {
        return false;
      }
      if (selectedSportId !== 'all') {
        if (!stage.sports_categories || stage.sports_categories.sports.id.toString() !== selectedSportId) {
          return false;
        }
      }
      if (selectedDivision !== 'all') {
        if (!stage.sports_categories || stage.sports_categories.division !== selectedDivision) {
          return false;
        }
      }
      return true;
    });

    const uniqueMap = new Map();
    filtered.forEach(stage => {
      if (!uniqueMap.has(stage.competition_stage)) {
        uniqueMap.set(stage.competition_stage, stage);
      }
    });

    return Array.from(uniqueMap.values());
  }, [availableStages, selectedSeason, selectedSportId, selectedDivision]);

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'live', label: 'Live' },
    { value: 'finished', label: 'Finished' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rescheduled', label: 'Rescheduled' }
  ];

  const handleGoToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    onDateChange(today);
  };

  const handleSpecificDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);
      onDateChange(newDate);
    }
  };

  return (
    <div className={`${roboto.className} sticky top-16 md:top-20 z-20 rounded-xl border border-border/40 bg-card/90 p-3 sm:p-3.5 backdrop-blur-md transition-all space-y-2.5`}>
      {/* Top Row: Date Nav + Status Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        {/* Left: Date Navigation */}
        <div className="flex items-center justify-between md:justify-start gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wider">
              {isToday(currentDate) ? 'Today' : formatDateHeader(currentDate).weekday}
            </span>
            <span className="text-muted-foreground/20">·</span>
            <span className="font-mango-grotesque text-foreground text-lg sm:text-xl font-bold leading-none">
              {isToday(currentDate) ? formatDateHeader(new Date()).date : formatDateHeader(currentDate).date}
            </span>
          </div>

          {/* Date Steppers */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPreviousDay}
              className="h-7 w-7"
              title="Previous Day"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToToday}
              className="h-7 px-2 text-[10px] font-medium bg-background/50"
            >
              Today
            </Button>

            <div className="relative h-7 w-7 shrink-0">
              <input
                type="date"
                value={safeGetDateString(currentDate) || ''}
                onChange={handleSpecificDateChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="date-picker-input-toolbar"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute inset-0 h-7 w-7 pointer-events-none"
                tabIndex={-1}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onNextDay}
              className="h-7 w-7"
              title="Next Day"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Right: Status Tabs */}
        <div className="flex items-center justify-between md:justify-end gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-0.5 bg-muted/20 p-0.5 rounded-lg border border-border/20">
            {statusOptions.map((opt) => {
              const isActive = selectedStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onStatusChange?.(opt.value)}
                  className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? opt.value === 'cancelled'
                        ? 'bg-destructive text-destructive-foreground'
                        : opt.value === 'rescheduled'
                        ? 'bg-amber-600 text-white'
                        : opt.value === 'live'
                        ? 'bg-red-500 text-white'
                        : 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground/70 hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden h-7 px-2 bg-background/50 shrink-0 flex items-center gap-1"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span className="text-[10px] font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center h-3.5 w-3.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Desktop Filter Selectors */}
      <div className="hidden md:flex flex-wrap items-center gap-2 pt-1 border-t border-border/20">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mr-0.5">
          Filter by:
        </span>

        {/* Season */}
        <Select value={selectedSeason} onValueChange={(val) => onSeasonChange?.(val)}>
          <SelectTrigger className="h-7 w-[110px] bg-background/50 font-medium text-[11px] border-border/30">
            <SelectValue placeholder="All Seasons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seasons</SelectItem>
            {availableSeasons?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{`Season ${s.id}`}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Sport */}
        <Select value={selectedSportId} onValueChange={(val) => onSportChange?.(val)}>
          <SelectTrigger className="h-7 w-[120px] bg-background/50 font-medium text-[11px] border-border/30 truncate">
            <SelectValue placeholder="All Sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {uniqueSports.map(s => (
              <SelectItem key={s.id} value={s.id.toString()}>
                <div className="flex items-center gap-1.5">
                  {s.logo_url && (
                    <img src={s.logo_url} alt={s.name} className="w-3.5 h-3.5 object-contain" />
                  )}
                  <span>{s.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category */}
        <Select value={selectedDivision} onValueChange={(val) => onDivisionChange?.(val)}>
          <SelectTrigger className="h-7 w-[120px] bg-background/50 font-medium text-[11px] border-border/30">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {uniqueDivisions.map((division) => (
              <SelectItem key={division} value={division}>
                {division}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* School */}
        {availableSchools && availableSchools.length > 0 && (
          <Select value={selectedSchool} onValueChange={(val) => onSchoolChange?.(val)}>
            <SelectTrigger className="h-7 w-[120px] bg-background/50 font-medium text-[11px] border-border/30 truncate">
              <SelectValue placeholder="All Schools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {availableSchools.map(s => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  <div className="flex items-center gap-1.5">
                    {s.logo_url && (
                      <img src={s.logo_url} alt={s.abbreviation || s.name} className="w-3.5 h-3.5 object-contain" />
                    )}
                    <span>{s.abbreviation || s.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Stage */}
        <Select value={selectedStage} onValueChange={(val) => onStageChange?.(val)}>
          <SelectTrigger className="h-7 w-[110px] bg-background/50 font-medium text-[11px] border-border/30">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {uniqueFilteredStages.map((stage) => (
              <SelectItem key={stage.id} value={formatStage(stage.competition_stage)}>
                {formatStage(stage.competition_stage)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset */}
        {activeFilterCount > 0 && onResetFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset ({activeFilterCount})</span>
          </Button>
        )}
      </div>

      {/* Mobile Filters Accordion */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden pt-2 border-t border-border/20"
          >
            <div className="grid grid-cols-2 gap-1.5">
              <div className="col-span-2">
                <Select value={selectedSeason} onValueChange={(val) => onSeasonChange?.(val)}>
                  <SelectTrigger className="h-7 w-full bg-background/50 font-medium text-[11px] border-border/30">
                    <SelectValue placeholder="All Seasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Seasons</SelectItem>
                    {availableSeasons?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{`Season ${s.id}`}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Select value={selectedSportId} onValueChange={(val) => onSportChange?.(val)}>
                  <SelectTrigger className="h-7 w-full bg-background/50 font-medium text-[11px] border-border/30 truncate">
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    {uniqueSports.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        <div className="flex items-center gap-1.5">
                          {s.logo_url && (
                            <img src={s.logo_url} alt={s.name} className="w-3.5 h-3.5 object-contain" />
                          )}
                          <span>{s.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {availableSchools && availableSchools.length > 0 && (
                <div className="col-span-2">
                  <Select value={selectedSchool} onValueChange={(val) => onSchoolChange?.(val)}>
                    <SelectTrigger className="h-7 w-full bg-background/50 font-medium text-[11px] border-border/30 truncate">
                      <SelectValue placeholder="All Schools" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Schools</SelectItem>
                      {availableSchools.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          <div className="flex items-center gap-1.5">
                            {s.logo_url && (
                              <img src={s.logo_url} alt={s.abbreviation || s.name} className="w-3.5 h-3.5 object-contain" />
                            )}
                            <span>{s.abbreviation || s.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Select value={selectedDivision} onValueChange={(val) => onDivisionChange?.(val)}>
                <SelectTrigger className="h-7 w-full bg-background/50 font-medium text-[11px] border-border/30">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueDivisions.map((division) => (
                    <SelectItem key={division} value={division}>
                      {division}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStage} onValueChange={(val) => onStageChange?.(val)}>
                <SelectTrigger className="h-7 w-full bg-background/50 font-medium text-[11px] border-border/30">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {uniqueFilteredStages.map((stage) => (
                    <SelectItem key={stage.id} value={formatStage(stage.competition_stage)}>
                      {formatStage(stage.competition_stage)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeFilterCount > 0 && onResetFilters && (
                <div className="col-span-2 pt-0.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onResetFilters}
                    className="w-full h-7 text-[10px] font-medium"
                  >
                    Reset All Filters ({activeFilterCount})
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
