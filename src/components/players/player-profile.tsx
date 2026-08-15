'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePlayerBySlugAndSchool, usePlayerBySlug } from '@/hooks/use-players';
import { usePlayerSeasonsByPlayerId } from '@/hooks/use-player-seasons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Users, Trophy, Gamepad2 } from 'lucide-react';

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface PlayerProfileProps {
  schoolSlug?: string;
  playerSlug: string;
}

export default function PlayerProfile({ schoolSlug, playerSlug }: PlayerProfileProps) {
  const router = useRouter();
  const bySlugAndSchool = usePlayerBySlugAndSchool(playerSlug, schoolSlug || '', {
    enabled: !!schoolSlug,
  } as any);
  const bySlug = usePlayerBySlug(playerSlug, {
    enabled: !schoolSlug,
  } as any);
  const { data: player, isLoading: playerLoading, error: playerError } = schoolSlug ? bySlugAndSchool : bySlug;
  const playerId = player?.id || '';
  const { data: playerSeasons } = usePlayerSeasonsByPlayerId(playerId);

  const currentTeam = React.useMemo(() => {
    if (!playerSeasons || playerSeasons.length === 0) return null;
    const sorted = [...playerSeasons].sort((a: any, b: any) => {
      const aDate = a.schools_teams?.seasons?.start_at || '0';
      const bDate = b.schools_teams?.seasons?.start_at || '0';
      return bDate.localeCompare(aDate);
    });
    return sorted[0];
  }, [playerSeasons]);

  const schoolInfo = currentTeam?.schools_teams?.schools || (player as any)?.schools_teams?.schools;
  const teamName = currentTeam?.schools_teams?.name || (player as any)?.schools_teams?.name;

  const displayPosition = React.useMemo(() => {
    const positionString = (currentTeam as any)?.position || player?.position;
    if (!positionString) return null;
    return positionString;
  }, [(currentTeam as any)?.position, player?.position]);

  if (playerLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative w-full h-[40vh] min-h-[300px] bg-muted/30 animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl bg-muted/30" />)}
          </div>
        </div>
      </div>
    );
  }

  if (playerError || !player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <Users className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Player Not Found</h1>
          <p className="text-muted-foreground">This player doesn&apos;t exist or has been removed.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-[50vh] min-h-[400px] overflow-hidden bg-zinc-950"
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/80 md:via-black/40 to-transparent" />
        </div>

        <div className="absolute top-6 left-6 z-10">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="backdrop-blur-sm bg-black/20 hover:bg-black/40 text-white border-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-full items-end justify-between">
            <div className="pb-8 md:pb-12 text-white relative z-20 max-w-2xl">
              <h1 className="font-mango-grotesque text-6xl md:text-8xl lg:text-9xl font-bold tracking-wide leading-none drop-shadow-sm">
                {player.first_name} {player.last_name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                {player.player_number && (
                  <span className="text-lg md:text-xl font-medium text-white/90 drop-shadow-sm">
                    #{player.player_number}
                  </span>
                )}
                {displayPosition && (
                  <Badge variant="outline" className="border-white/30 bg-black/20 backdrop-blur-md text-white px-3 py-1 text-xs uppercase tracking-[0.2em]">
                    {displayPosition}
                  </Badge>
                )}
                {teamName && (
                  <span className="text-lg md:text-xl font-medium text-primary-400 drop-shadow-sm">
                    {teamName}
                  </span>
                )}
              </div>

              {schoolInfo && (
                <div className="flex items-center gap-3 mt-4">
                  {schoolInfo.logo_url && (
                    <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                      <Image
                        src={schoolInfo.logo_url}
                        alt={schoolInfo.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                  )}
                  <span className="text-sm md:text-base font-medium text-white/70">
                    {schoolInfo.name}
                  </span>
                </div>
              )}
            </div>

            <div className="relative h-full w-1/2 max-w-[500px] hidden md:block">
              {player.photo_url ? (
                <Image
                  src={player.photo_url}
                  alt={player.first_name}
                  fill
                  className="relative z-10 object-contain object-bottom drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                  priority
                />
              ) : (
                <div className="relative z-10 h-full w-full flex items-end justify-center pb-8">
                  <div className="h-48 w-48 rounded-full bg-muted/40 backdrop-blur-sm border-2 border-white/10 flex items-center justify-center shadow-2xl">
                    <span className="text-6xl font-mango-grotesque font-bold text-white/50">{player.first_name?.charAt(0) || '?'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {playerSeasons && playerSeasons.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="py-6 pb-16 mt-8"
          >
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-border/30 flex items-center justify-between bg-muted/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-mango-grotesque text-xl font-bold tracking-wide">Season History</h3>
                    <p className="text-xs text-muted-foreground font-medium">Past teams and participations</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 grid gap-3">
                {(playerSeasons as any[]).map((ps: any, i: number) => {
                  const seasonName = ps.schools_teams?.seasons?.name || `Season ${ps.schools_teams?.seasons?.id || ''}`;
                  const sportName = ps.schools_teams?.sports_categories?.sports?.name || '';
                  const isLatest = i === 0;

                  return (
                    <div key={ps.id || i} className={cn(
                      "flex items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-300 hover:shadow-md",
                      isLatest ? "bg-primary/5 border-primary/20" : "bg-card/40 border-border/40 hover:bg-card/60 hover:border-border/60"
                    )}>
                      <div className="flex items-center gap-4 min-w-0">
                        {ps.schools_teams?.school?.logo_url ? (
                          <div className="relative w-12 h-12 flex-shrink-0 bg-background/50 rounded-full p-1 border border-border/50 shadow-sm">
                            <Image src={ps.schools_teams.school.logo_url} alt="" fill className="rounded-full object-contain p-1" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 flex-shrink-0 bg-muted/50 rounded-full border border-border/50 shadow-sm flex items-center justify-center">
                            <Users className="h-5 w-5 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-base sm:text-lg font-bold text-foreground truncate">{ps.schools_teams?.name || 'Team'}</div>
                            {isLatest && <Badge variant="default" className="text-[9px] uppercase tracking-widest px-1.5 h-4 bg-primary text-primary-foreground">Current</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground/80 truncate font-medium">{ps.schools_teams?.school?.name || ps.schools_teams?.school?.abbreviation || ''}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
                        <span className="text-sm font-bold text-foreground/90">{seasonName}</span>
                        {sportName && (
                          <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">{sportName}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
