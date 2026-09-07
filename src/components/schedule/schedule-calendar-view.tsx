// @ts-nocheck
'use client';

import { useState, useMemo, useCallback } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScheduleMatch } from '@/lib/types/matches';
import { formatCategoryName } from '@/lib/utils/sports';
import { roboto } from '@/lib/fonts';
import { getSportSvgPath } from '@/components/ui/sport-icon';

interface ScheduleCalendarViewProps {
  readonly matches: ScheduleMatch[];
  readonly currentDate?: Date;
  readonly onSelectDate?: (dateStr: string) => void;
  readonly className?: string;
}

export default function ScheduleCalendarView({
  matches,
  currentDate = new Date(),
  onSelectDate,
  className = ''
}: ScheduleCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(currentDate));
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [dialogDate, setDialogDate] = useState<string | null>(null);

  // Group all provided matches by YYYY-MM-DD dateKey
  const matchesByDate = useMemo(() => {
    const map = new Map<string, ScheduleMatch[]>();

    matches.forEach((m) => {
      if (!m.scheduled_at) return;
      const d = new Date(m.scheduled_at);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(m);
    });

    return map;
  }, [matches]);

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(subWeeks(currentMonth, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentMonth(addMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addWeeks(currentMonth, 1));
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentMonth(startOfMonth(today));
    if (onSelectDate) {
      const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      onSelectDate(todayKey);
    }
  };

  const calendarDays = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentMonth, { weekStartsOn: 0 });
      const days = [];
      for (let i = 0; i < 7; i++) {
        days.push(addDays(start, i));
      }
      return days;
    }

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth, viewMode]);

  const handleDayClick = useCallback((dateKey: string, dayMatches: ScheduleMatch[]) => {
    if (dayMatches.length > 2) {
      setDialogDate(dateKey);
    } else if (onSelectDate) {
      onSelectDate(dateKey);
    }
  }, [onSelectDate]);

  const handleJumpToDate = useCallback((dateKey: string) => {
    setDialogDate(null);
    if (onSelectDate) {
      onSelectDate(dateKey);
    }
  }, [onSelectDate]);

  const today = new Date();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDialogMatches = dialogDate ? matchesByDate.get(dialogDate) || [] : [];

  return (
    <div className={`rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-primary/70" />
          <h2 className="font-mango-grotesque text-sm sm:text-base font-bold uppercase tracking-wider text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* View mode toggle */}
          <div className="hidden sm:flex items-center rounded-md bg-muted/30 p-0.5 border border-border/30">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`${roboto.className} px-2 py-0.5 rounded text-[10px] font-medium transition-all ${viewMode === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`${roboto.className} px-2 py-0.5 rounded text-[10px] font-medium transition-all ${viewMode === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Week
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToToday}
            className={`${roboto.className} h-6 px-2 text-[10px] font-medium bg-background/50`}
          >
            Today
          </Button>

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="h-6 w-6 hover:bg-muted/50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-6 w-6 hover:bg-muted/50"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className={`${roboto.className} grid grid-cols-7 border-b border-border/20 bg-muted/5 text-center py-1.5`}>
        {weekDays.map((d) => (
          <div key={d} className="text-[9px] sm:text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-border/10">
        {calendarDays.map((dayDate, idx) => {
          const isCurrentMonth = isSameMonth(dayDate, currentMonth);
          const isCurrentDay = isSameDay(dayDate, today);
          const dateKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
          const dayMatches = matchesByDate.get(dateKey) || [];
          const hasMatches = dayMatches.length > 0;

          const displayMatches = dayMatches.slice(0, 3);
          const overflowCount = dayMatches.length - 3;

          return (
            <div
              key={dateKey + idx}
              onClick={() => hasMatches && handleDayClick(dateKey, dayMatches)}
              className={`min-h-[75px] sm:min-h-[110px] p-1.5 sm:p-2 transition-colors relative flex flex-col ${
                !isCurrentMonth ? 'bg-muted/3 opacity-30' : ''
              } ${hasMatches ? 'cursor-pointer hover:bg-muted/20 group' : ''} ${
                isCurrentDay ? 'bg-primary/[0.04]' : ''
              }`}
            >
              {/* Day Number */}
              <div className="flex items-start justify-between mb-1">
                <span
                  className={`${roboto.className} text-[10px] sm:text-xs font-medium leading-none px-1.5 py-0.5 rounded-full ${
                    isCurrentDay
                      ? 'bg-primary text-primary-foreground font-bold'
                      : isCurrentMonth
                      ? 'text-foreground/80'
                      : 'text-muted-foreground/40'
                  }`}
                >
                  {format(dayDate, 'd')}
                </span>

                {/* Mobile dot indicator */}
                {hasMatches && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 sm:hidden mt-0.5 mr-0.5" />
                )}
              </div>

              {/* Event Chips (Desktop) */}
              <div className="hidden sm:flex flex-col gap-1 w-full flex-1">
                {displayMatches.map((m) => {
                  const t1 = m.match_participants?.[0]?.schools_teams?.school?.abbreviation ?? 'TBD';
                  const t2 = m.match_participants?.[1]?.schools_teams?.school?.abbreviation ?? 'TBD';
                  const isLive = m.status === 'live' || m.status === 'ongoing';
                  const isCancelled = m.status === 'cancelled' || m.status === 'canceled';
                  const isRescheduled = m.status === 'rescheduled';
                  const sportName = m.sports_seasons_stages?.sports_categories?.sports?.name;
                  const sportLogo = getSportSvgPath(sportName) || m.sports_seasons_stages?.sports_categories?.sports?.logo_url;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectDate) onSelectDate(dateKey);
                      }}
                      className={`${roboto.className} text-[10px] leading-snug px-1.5 py-0.5 rounded border text-left truncate w-full flex items-center justify-between transition-colors ${
                        isCancelled
                          ? 'bg-destructive/10 text-destructive/70 border-destructive/20 line-through'
                          : isRescheduled
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                          : isLive
                          ? 'bg-red-500/10 text-red-400 border-red-500/25 font-bold'
                          : 'bg-card/70 hover:bg-card text-foreground/80 hover:text-foreground border-border/30 hover:border-border/60'
                      }`}
                    >
                      <div className="flex items-center gap-1 min-w-0 truncate">
                        {sportLogo && (
                          <Image
                            src={sportLogo}
                            alt=""
                            width={12}
                            height={12}
                            className="h-2.5 w-2.5 object-contain flex-shrink-0 dark:invert opacity-70"
                          />
                        )}
                        <span className="truncate">{t1} vs {t2}</span>
                      </div>
                      {isLive ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0 ml-1" />
                      ) : m.displayTime ? (
                        <span className="text-[9px] text-muted-foreground/50 flex-shrink-0 ml-1 hidden lg:inline">
                          {m.displayTime}
                        </span>
                      ) : null}
                    </button>
                  );
                })}

                {overflowCount > 0 && (
                  <span className={`${roboto.className} text-[9px] font-medium text-primary/80 self-start px-1 hover:underline`}>
                    +{overflowCount} more
                  </span>
                )}
              </div>

              {/* Mobile count */}
              {hasMatches && (
                <div className="sm:hidden flex items-center justify-center mt-auto">
                  <span className={`${roboto.className} text-[8px] font-medium text-primary/70`}>
                    {dayMatches.length}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overflow Day Matches Dialog */}
      <Dialog open={!!dialogDate} onOpenChange={(open) => !open && setDialogDate(null)}>
        <DialogContent className="max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="font-mango-grotesque text-lg font-bold uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary/70" />
              <span>
                {dialogDate ? format(new Date(dialogDate + 'T00:00:00'), 'EEEE, MMMM d, yyyy') : 'Matches'}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {selectedDialogMatches.map((m) => {
              const p1 = m.match_participants?.[0]?.schools_teams?.school;
              const p2 = m.match_participants?.[1]?.schools_teams?.school;
              const isLive = m.status === 'live' || m.status === 'ongoing';
              const isCancelled = m.status === 'cancelled' || m.status === 'canceled';
              const isRescheduled = m.status === 'rescheduled';

              return (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                    isCancelled
                      ? 'bg-destructive/5 border-destructive/20'
                      : isRescheduled
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : isLive
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-muted/20 border-border/30'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center -space-x-1 flex-shrink-0">
                      <Image
                        src={p1?.logo_url ?? '/img/cesafi-logo.webp'}
                        alt={p1?.abbreviation ?? 'TBD'}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover border border-border/30"
                      />
                      <Image
                        src={p2?.logo_url ?? '/img/cesafi-logo.webp'}
                        alt={p2?.abbreviation ?? 'TBD'}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover border border-border/30"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className={`${roboto.className} text-[11px] font-medium truncate ${isCancelled ? 'line-through text-muted-foreground/50' : 'text-foreground/90'}`}>
                        {p1?.name ?? 'TBD'} vs {p2?.name ?? 'TBD'}
                      </div>
                      <div className={`${roboto.className} text-[9px] text-muted-foreground/50 flex items-center gap-1 mt-0.5`}>
                        {(() => {
                          const sName = m.sports_seasons_stages?.sports_categories?.sports?.name;
                          const sLogo = getSportSvgPath(sName) || m.sports_seasons_stages?.sports_categories?.sports?.logo_url;
                          return sLogo ? (
                            <Image
                              src={sLogo}
                              alt=""
                              width={12}
                              height={12}
                              className="h-2.5 w-2.5 object-contain dark:invert opacity-60 flex-shrink-0"
                            />
                          ) : null;
                        })()}
                        <span>{m.displayTime || 'TBD'} · {m.sports_seasons_stages?.sports_categories?.sports?.name ?? 'CESAFI'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isCancelled && (
                      <span className={`${roboto.className} text-[8px] font-bold uppercase tracking-wider text-destructive/70 bg-destructive/10 px-1.5 py-0.5 rounded`}>
                        Cancelled
                      </span>
                    )}
                    {isRescheduled && (
                      <span className={`${roboto.className} text-[8px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20`}>
                        Rescheduled
                      </span>
                    )}
                    {isLive && (
                      <span className={`${roboto.className} text-[8px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded`}>
                        Live
                      </span>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleJumpToDate(dialogDate!)}
                      className={`${roboto.className} h-6 px-2 text-[10px] font-medium`}
                    >
                      Jump
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
