// @ts-nocheck
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Clock, ChevronRight, Flame } from 'lucide-react';
import { moderniz, roboto } from '@/lib/fonts';
import { ScheduleMatch } from '@/lib/types/matches';
import { formatCategoryName, formatStage } from '@/lib/utils/sports';
import { determineWinner } from './utils';
import { getSportSvgPath } from '@/components/ui/sport-icon';

interface OngoingUpcomingShowcaseProps {
  readonly matches: ScheduleMatch[];
  readonly className?: string;
  readonly onSelectDate?: (dateStr: string) => void;
}

function CountdownDisplay({ scheduledAt }: { scheduledAt: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const target = new Date(scheduledAt).getTime();
    if (isNaN(target)) return;

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [scheduledAt]);

  if (!timeLeft) return null;

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hrs', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds }
  ];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {units.map((unit, idx) => (
        <div key={unit.label} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center rounded-md bg-background/60 border border-border/40 px-2 py-1 min-w-[36px] sm:min-w-[40px]">
            <span className="text-sm sm:text-base font-bold text-primary tabular-nums leading-none">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className={`${roboto.className} text-[8px] sm:text-[9px] text-muted-foreground/70 uppercase tracking-wide mt-0.5`}>
              {unit.label}
            </span>
          </div>
          {idx < units.length - 1 && (
            <span className="text-muted-foreground/30 text-[10px] font-bold select-none">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function OngoingUpcomingShowcase({
  matches,
  className = '',
  onSelectDate
}: OngoingUpcomingShowcaseProps) {
  // 1. Separate ongoing / live matches and upcoming matches
  const { liveMatches, upcomingMatches } = useMemo(() => {
    const live: ScheduleMatch[] = [];
    const upcoming: ScheduleMatch[] = [];

    matches.forEach((m) => {
      if (m.status === 'cancelled' || m.status === 'canceled' || m.status === 'rescheduled') return;

      if (m.status === 'live' || m.status === 'ongoing') {
        live.push(m);
      } else if (m.status === 'upcoming') {
        upcoming.push(m);
      }
    });

    upcoming.sort((a, b) => {
      const timeA = new Date(a.scheduled_at ?? '').getTime();
      const timeB = new Date(b.scheduled_at ?? '').getTime();
      return timeA - timeB;
    });

    return { liveMatches: live, upcomingMatches: upcoming };
  }, [matches]);

  const activePool = useMemo(() => {
    return [...liveMatches, ...upcomingMatches];
  }, [liveMatches, upcomingMatches]);

  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number>(0);

  useEffect(() => {
    setSelectedMatchIndex(0);
  }, [activePool.length]);

  const featuredMatch = activePool[selectedMatchIndex] || activePool[0] || null;

  if (!featuredMatch) {
    return (
      <div className={`rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 sm:p-8 text-center flex flex-col items-center justify-center min-h-[200px] ${className}`}>
        <div className="w-10 h-10 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center mb-3">
          <Calendar className="w-5 h-5" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
          No Active Matches
        </h3>
        <p className={`${roboto.className} text-muted-foreground text-xs sm:text-sm max-w-xs`}>
          Check the calendar for upcoming tournament dates.
        </p>
      </div>
    );
  }

  // Participants & metadata for featured match
  const rawParticipants = featuredMatch.match_participants?.map((p) => ({
    id: p.id,
    teamName: p.schools_teams?.name ?? 'TBD',
    schoolName: p.schools_teams?.school?.name ?? 'TBD',
    schoolAbbreviation: p.schools_teams?.school?.abbreviation ?? 'TBD',
    schoolLogo: p.schools_teams?.school?.logo_url ?? null,
    score: p.match_score,
    isWinner: false
  })) || [];

  const tbd = {
    id: 0,
    teamName: 'TBD',
    schoolName: 'TBD',
    schoolAbbreviation: 'TBD',
    schoolLogo: null,
    score: null,
    isWinner: false
  };

  const participants = determineWinner(rawParticipants);
  const team1 = participants[0] || tbd;
  const team2 = participants[1] || tbd;

  const isLive = featuredMatch.status === 'live' || featuredMatch.status === 'ongoing';
  const sport = featuredMatch.sports_seasons_stages?.sports_categories?.sports;
  const category = featuredMatch.sports_seasons_stages?.sports_categories;
  const stage = featuredMatch.sports_seasons_stages?.competition_stage ?? 'Tournament Stage';
  const sportLogo = getSportSvgPath(sport?.name) || sport?.logo_url;

  const secondaryMatches = activePool.filter((m) => m.id !== featuredMatch.id).slice(0, 4);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Showcase Hero Card */}
      <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
        isLive
          ? 'border-red-500/30 bg-gradient-to-br from-red-950/15 via-card/80 to-card shadow-lg shadow-red-500/5'
          : 'border-border/50 bg-card/80 shadow-sm'
      }`}>
        {/* Top Accent Line */}
        <div className={`h-0.5 w-full ${isLive ? 'bg-red-500' : 'bg-primary/60'}`} />

        {/* Card Header: Sport + Status Badge */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-3 pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {sportLogo && (
              <Image
                src={sportLogo}
                alt={sport?.name ?? ''}
                width={16}
                height={16}
                className="h-4 w-4 object-contain flex-shrink-0 dark:invert opacity-80"
              />
            )}
            <span className={`${roboto.className} text-[11px] text-muted-foreground truncate`}>
              {sport?.name ?? 'CESAFI'}
              {category?.division && (
                <> · {formatCategoryName(category.division, category.levels || '')}</>
              )}
              {' · '}
              {formatStage(stage)}
            </span>
          </div>

          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
              </span>
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              <Flame className="w-2.5 h-2.5" />
              Next
            </span>
          )}
        </div>

        {/* Scoreboard Body */}
        <div className="px-4 sm:px-5 py-4 sm:py-6">
          <div className="grid grid-cols-7 items-center gap-2 sm:gap-3">
            {/* Team 1 (Left) */}
            <div className="col-span-3 flex items-center justify-end gap-2 sm:gap-3 min-w-0">
              <div className="text-right min-w-0 hidden sm:block">
                <div className={`font-mango-grotesque text-lg sm:text-xl font-bold text-foreground truncate tracking-wide leading-tight`}>
                  {team1.schoolAbbreviation}
                </div>
                <div className={`${roboto.className} text-[10px] text-muted-foreground/60 truncate max-w-[120px]`}>
                  {team1.schoolName}
                </div>
              </div>
              <Image
                src={team1.schoolLogo ?? '/img/cesafi-logo.webp'}
                alt={team1.schoolAbbreviation}
                width={48}
                height={48}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border border-border/40 bg-background/60 flex-shrink-0"
              />
              <span className={`font-mango-grotesque text-xs font-bold text-foreground truncate sm:hidden`}>
                {team1.schoolAbbreviation}
              </span>
            </div>

            {/* Center: Score or VS */}
            <div className="col-span-1 flex flex-col items-center justify-center text-center">
              {isLive && team1.score !== null && team2.score !== null ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={`font-mango-grotesque text-2xl sm:text-3xl font-bold text-foreground tabular-nums`}>
                    {team1.score}
                  </span>
                  <span className="text-muted-foreground/30 text-sm">–</span>
                  <span className={`font-mango-grotesque text-2xl sm:text-3xl font-bold text-foreground tabular-nums`}>
                    {team2.score}
                  </span>
                </div>
              ) : (
                <div className="px-2.5 py-0.5 rounded bg-muted/40 border border-border/30">
                  <span className={`font-mango-grotesque text-xs font-bold text-muted-foreground/50`}>
                    VS
                  </span>
                </div>
              )}

              {featuredMatch.best_of && featuredMatch.best_of > 1 && (
                <span className={`${roboto.className} text-[8px] uppercase tracking-wider text-muted-foreground/50 mt-1`}>
                  BO{featuredMatch.best_of}
                </span>
              )}
            </div>

            {/* Team 2 (Right) */}
            <div className="col-span-3 flex items-center justify-start gap-2 sm:gap-3 min-w-0">
              <span className={`font-mango-grotesque text-xs font-bold text-foreground truncate sm:hidden`}>
                {team2.schoolAbbreviation}
              </span>
              <Image
                src={team2.schoolLogo ?? '/img/cesafi-logo.webp'}
                alt={team2.schoolAbbreviation}
                width={48}
                height={48}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border border-border/40 bg-background/60 flex-shrink-0"
              />
              <div className="text-left min-w-0 hidden sm:block">
                <div className={`font-mango-grotesque text-lg sm:text-xl font-bold text-foreground truncate tracking-wide leading-tight`}>
                  {team2.schoolAbbreviation}
                </div>
                <div className={`${roboto.className} text-[10px] text-muted-foreground/60 truncate max-w-[120px]`}>
                  {team2.schoolName}
                </div>
              </div>
            </div>
          </div>

          {/* Countdown (below scoreboard for upcoming) */}
          {!isLive && featuredMatch.scheduled_at && (
            <div className="flex items-center justify-center mt-4">
              <CountdownDisplay scheduledAt={featuredMatch.scheduled_at} />
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2 bg-muted/15 border-t border-border/20">
          <div className={`${roboto.className} flex items-center gap-2.5 text-[11px] text-muted-foreground/70`}>
            {featuredMatch.scheduled_at && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 opacity-60" />
                <span>{featuredMatch.displayDate} · {featuredMatch.displayTime}</span>
              </div>
            )}
            {featuredMatch.venue && (
              <div className="hidden sm:flex items-center gap-1">
                <MapPin className="w-3 h-3 opacity-60" />
                <span className="truncate max-w-[140px]">{featuredMatch.venue}</span>
              </div>
            )}
          </div>

          <Link
            href={`/matches/${featuredMatch.id}`}
            prefetch={false}
            className={`${roboto.className} inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
              isLive
                ? 'bg-red-500/90 text-white hover:bg-red-500'
                : 'bg-primary/90 text-primary-foreground hover:bg-primary'
            }`}
          >
            <span>{isLive ? 'Watch Live' : 'Details'}</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Secondary Match Rail */}
      {secondaryMatches.length > 0 && (
        <div className="space-y-1.5">
          <span className={`${roboto.className} text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-0.5`}>
            More Matches ({activePool.length})
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {secondaryMatches.map((match) => {
              const p1 = match.match_participants?.[0]?.schools_teams?.school;
              const p2 = match.match_participants?.[1]?.schools_teams?.school;
              const isMatchLive = match.status === 'live' || match.status === 'ongoing';

              return (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => {
                    const idx = activePool.findIndex((m) => m.id === match.id);
                    if (idx !== -1) setSelectedMatchIndex(idx);
                  }}
                  className="group flex items-center justify-between p-2 rounded-lg border border-border/30 bg-card/40 hover:bg-card/70 hover:border-border/50 transition-all text-left w-full"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center -space-x-1.5 flex-shrink-0">
                      <Image
                        src={p1?.logo_url ?? '/img/cesafi-logo.webp'}
                        alt={p1?.abbreviation ?? 'TBD'}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover border border-border/40 bg-background"
                      />
                      <Image
                        src={p2?.logo_url ?? '/img/cesafi-logo.webp'}
                        alt={p2?.abbreviation ?? 'TBD'}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover border border-border/40 bg-background"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className={`${roboto.className} text-[11px] font-medium text-foreground/80 truncate group-hover:text-foreground transition-colors`}>
                        {p1?.abbreviation ?? 'TBD'} vs {p2?.abbreviation ?? 'TBD'}
                      </div>
                      <div className={`${roboto.className} text-[9px] text-muted-foreground/50 truncate`}>
                        {match.displayDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-1.5">
                    {isMatchLive ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                        Live
                      </span>
                    ) : (
                      <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
