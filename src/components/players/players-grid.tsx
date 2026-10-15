'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, User } from 'lucide-react';
import { getAvailableSeasons } from '@/actions/standings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllPlayersWithTeams } from '@/actions/players';

type FilterOption = { id: number | string; label: string; value: string };
type Filters = { season: string; sport: string; school: string };

const sportIdOf = (entry: any): string | undefined => entry?.schools_teams?.sports_categories?.sports?.id?.toString();
const schoolIdOf = (entry: any): string | undefined => entry?.schools_teams?.schools?.id?.toString();

function latestEntry(entries: any[]) {
  return entries.reduce<any>((latest, entry) => {
    if (!latest) return entry;
    if (entry.season_id !== latest.season_id) return entry.season_id > latest.season_id ? entry : latest;
    return (entry.created_at || '') > (latest.created_at || '') ? entry : latest;
  }, undefined);
}

// With "All Seasons" a player is judged by their latest season only; otherwise by their entries in the chosen season.
function candidateEntries(player: any, season: string): any[] {
  const entries = player.player_seasons ?? [];
  if (season === 'all') {
    const latest = latestEntry(entries);
    return latest ? [latest] : [];
  }
  return entries.filter((ps: any) => ps.season_id === Number(season));
}

function matchingEntry(player: any, { season, sport, school }: Filters) {
  return candidateEntries(player, season).find(
    (entry) => (sport === 'all' || sportIdOf(entry) === sport) && (school === 'all' || schoolIdOf(entry) === school)
  );
}

export default function PlayersGrid() {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [seasons, setSeasons] = useState<FilterOption[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);

  // Each dropdown only lists values that still have players under the other two selections.
  const sportOptions = useMemo(() => {
    const map = new Map<string, string>();
    allPlayers.forEach((player) => {
      candidateEntries(player, selectedSeason).forEach((entry) => {
        if (selectedSchool !== 'all' && schoolIdOf(entry) !== selectedSchool) return;
        const sport = entry.schools_teams?.sports_categories?.sports;
        if (sport) map.set(sport.id.toString(), sport.name);
      });
    });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [allPlayers, selectedSeason, selectedSchool]);

  const schoolOptions = useMemo(() => {
    const map = new Map<string, any>();
    allPlayers.forEach((player) => {
      candidateEntries(player, selectedSeason).forEach((entry) => {
        if (selectedSport !== 'all' && sportIdOf(entry) !== selectedSport) return;
        const school = entry.schools_teams?.schools;
        if (school) map.set(school.id.toString(), school);
      });
    });
    return Array.from(map.values()).sort((a, b) => (a.abbreviation || a.name).localeCompare(b.abbreviation || b.name));
  }, [allPlayers, selectedSeason, selectedSport]);

  const seasonOptions = useMemo(() => {
    const ids = new Set<number>();
    allPlayers.forEach((player) => {
      (player.player_seasons ?? []).forEach((entry: any) => {
        if (selectedSport !== 'all' && sportIdOf(entry) !== selectedSport) return;
        if (selectedSchool !== 'all' && schoolIdOf(entry) !== selectedSchool) return;
        ids.add(entry.season_id);
      });
    });
    const known = seasons.filter((s) => ids.has(Number(s.id)));
    const unknown = Array.from(ids)
      .filter((id) => !seasons.some((s) => Number(s.id) === id))
      .map((id) => ({ id, label: `Season ${id}`, value: id.toString() }));
    return [...known, ...unknown];
  }, [allPlayers, seasons, selectedSport, selectedSchool]);

  // Switching back to "All Seasons" can leave a sport/school selected that no latest season has.
  useEffect(() => {
    if (filtersLoading) return;
    if (selectedSport !== 'all' && !sportOptions.some((s) => s.id === selectedSport)) setSelectedSport('all');
    if (selectedSchool !== 'all' && !schoolOptions.some((s) => s.id.toString() === selectedSchool)) setSelectedSchool('all');
    if (selectedSeason !== 'all' && !seasonOptions.some((s) => s.value === selectedSeason)) setSelectedSeason('all');
  }, [filtersLoading, sportOptions, schoolOptions, seasonOptions, selectedSport, selectedSchool, selectedSeason]);

  useEffect(() => {
    async function fetchInitialData() {
      setFiltersLoading(true);
      const [seasonsResult, playersResult] = await Promise.all([
        getAvailableSeasons(),
        getAllPlayersWithTeams()
      ]);

      if (seasonsResult.success && seasonsResult.data) {
        setSeasons(seasonsResult.data.map((s: any) => ({
          id: s.id,
          label: s.name || `Season ${s.id}`,
          value: s.id.toString()
        })));
      }
      if (playersResult.success && playersResult.data) setAllPlayers(playersResult.data);

      setFiltersLoading(false);
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredPlayers = useMemo(() => {
    const filters = { season: selectedSeason, sport: selectedSport, school: selectedSchool };
    const searchLower = debouncedSearch.trim().toLowerCase();

    return allPlayers.flatMap((player) => {
      const entry = matchingEntry(player, filters);
      if (!entry) return [];

      if (searchLower) {
        const firstName = (player.first_name || '').toLowerCase();
        const lastName = (player.last_name || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        const slug = (player.slug || '').toLowerCase();
        if (!fullName.includes(searchLower) && !slug.includes(searchLower)) return [];
      }

      return [{ player, entry }];
    }).sort((a, b) => (a.player.last_name || '').localeCompare(b.player.last_name || ''));
  }, [allPlayers, selectedSport, selectedSeason, selectedSchool, debouncedSearch]);

  const groupedPlayers = useMemo(() => {
    const groups: Record<string, any> = {};
    filteredPlayers.forEach(({ player, entry }) => {
      const school = entry.schools_teams?.schools;
      const schoolName = school?.name || 'Unassigned';
      if (!groups[schoolName]) groups[schoolName] = { name: schoolName, abbrev: school?.abbreviation || '---', logo: school?.logo_url || null, players: [] };
      groups[schoolName].players.push({ ...player, entry });
    });
    return Object.values(groups).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [filteredPlayers]);

  const hasActiveFilters = selectedSchool !== 'all' || selectedSeason !== 'all' || selectedSport !== 'all' || searchQuery;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="w-full bg-card/40 backdrop-blur-md border border-border/50 shadow-lg rounded-xl overflow-hidden mb-8">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 p-3 sm:p-4 bg-muted/20">
          <Select value={selectedSport} onValueChange={setSelectedSport} disabled={filtersLoading}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Sport" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {sportOptions.map((sport) => <SelectItem key={sport.id} value={sport.id}>{sport.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedSeason} onValueChange={setSelectedSeason} disabled={filtersLoading}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Season" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              {seasonOptions.map((s) => <SelectItem key={s.id} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedSchool} onValueChange={setSelectedSchool} disabled={filtersLoading}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="School" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {schoolOptions.map((s: any) => <SelectItem key={s.id} value={s.id.toString()}>{s.abbreviation || s.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Input placeholder="Search name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full sm:w-auto" />
          {hasActiveFilters && <Button variant="ghost" onClick={() => { setSearchQuery(''); setSelectedSchool('all'); setSelectedSeason('all'); setSelectedSport('all'); }}><X className="h-4 w-4" /></Button>}
        </div>
      </div>

      {groupedPlayers.length > 0 ? (
        <div className="space-y-12 pb-16">
          {groupedPlayers.map((group: any) => (
            <div key={group.name} className="space-y-6">
              <h2 className="text-3xl font-bold border-b pb-3">{group.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {group.players.map((player: any) => {
                  const position = player.entry?.position || '';
                  const playerLink = `/players/${player.slug || player.id}`;

                  return (
                    <motion.div key={player.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Link href={playerLink}>
                        <div className="group relative block h-[360px] rounded-2xl border border-border/30 bg-gradient-to-b from-card/80 to-background overflow-hidden hover:border-primary transition-colors cursor-pointer">
                          {group.logo && (
                            <div className="absolute inset-x-0 top-0 h-[240px] z-0 opacity-[0.05] dark:opacity-10 mix-blend-multiply dark:mix-blend-plus-lighter pointer-events-none">
                              <Image src={group.logo} alt="" fill sizes="300px" className="object-contain p-6" />
                            </div>
                          )}
                          <div className="h-[240px] relative z-10">
                            {player.photo_url ? (
                              <Image src={player.photo_url} alt={player.first_name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : <User className="h-12 w-12 text-muted-foreground m-auto mt-24" />}
                          </div>
                          {/* Fades the bottom of the photo into the name area so the crop isn't a hard edge */}
                          <div className="absolute inset-x-0 bottom-0 h-[200px] z-10 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none" />
                          <div className="relative z-20 p-4 flex flex-col justify-between h-[120px]">
                            <div>
                              <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{player.first_name} {player.last_name}</h4>
                              {player.player_number && <p className="text-xs text-muted-foreground">#{player.player_number}</p>}
                            </div>
                            {position && (
                              <div className="mt-auto">
                                <Badge variant="outline" className="text-xs">{position}</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 bg-card/60 p-12 sm:p-16 text-center">
          <Search className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground/60 text-sm">
            No players found. Try adjusting your filters.
          </p>
        </div>
      )}
    </section>
  );
}
