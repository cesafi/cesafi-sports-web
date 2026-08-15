'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSchoolByAbbreviation } from '@/hooks/use-schools';
import { useSchoolsTeamBySlug } from '@/hooks/use-schools-teams';
import { usePlayersByTeamId } from '@/hooks/use-players';
import { ArrowLeft, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import ComingSoon from '@/components/shared/coming-soon';
import Image from 'next/image';

interface TeamProfileProps {
  schoolAbbreviation: string;
  teamSlug: string;
}

export default function TeamProfile({ schoolAbbreviation, teamSlug }: TeamProfileProps) {
  const router = useRouter();
  const { data: school, isLoading: schoolLoading } = useSchoolByAbbreviation(schoolAbbreviation);
  const { data: team, isLoading: teamLoading } = useSchoolsTeamBySlug(teamSlug, schoolAbbreviation);
  const teamId = (team as any)?.id || '';
  const { data: players, isLoading: playersLoading } = usePlayersByTeamId(teamId);

  if (schoolLoading || teamLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-64 w-full rounded-xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-96 col-span-1 rounded-xl" />
          <Skeleton className="h-96 col-span-2 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!school || !team) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Team not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      {/* Header Banner */}
      <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden flex items-end">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
        <div className="relative z-20 p-8 flex items-end gap-6 w-full">
          {school.logo_url && (
            <div className="relative w-24 h-24 rounded-full bg-white p-2 border-4 border-slate-900 shadow-xl">
              <Image 
                src={school.logo_url} 
                alt={`${school.name} logo`}
                fill
                className="object-contain p-2"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary">{school.abbreviation}</Badge>
              <Badge>{team.name}</Badge>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{team.name}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="col-span-1 space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary" />
              Roster Overview
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {players?.length || 0} registered players
            </p>
            {playersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                {players?.slice(0, 5).map(player => (
                  <div key={player.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                      {player.last_name?.charAt(0) || player.first_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{player.first_name} {player.last_name}</p>
                      <p className="text-xs text-muted-foreground">{player.position || 'Player'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Coming Soon for Stats/Matches) */}
        <div className="col-span-2 space-y-6">
          <div className="bg-card border rounded-xl p-8 shadow-sm">
            <ComingSoon 
              title="Team Statistics & Match History" 
              description="Detailed team statistics and upcoming matches will be available soon."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
