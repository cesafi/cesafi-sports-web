'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, User, Check } from 'lucide-react';
import { getAvailableSeasons } from '@/actions/standings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllSchoolsTeams } from '@/actions/schools-teams';
import { getActiveSchools } from '@/actions/schools';
import { getAllPlayersWithTeams } from '@/actions/players';

type FilterOption = { id: number | string; label: string; value: string };

export default function PlayersGrid() {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [seasons, setSeasons] = useState<FilterOption[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [allSchools, setAllSchools] = useState<any[]>([]);

  const uniqueSports = useMemo(() => {
    if (!allPlayers || allPlayers.length === 0) return [];
    const map = new Map();
    allPlayers.forEach((player) => {
      const season = player.player_seasons?.[0];
      const cat = season?.schools_teams?.sports_categories;
      if (cat?.sports && !map.has(cat.sports.id)) {
        map.set(cat.sports.id, cat.sports);
      }
    });

    const sortedSports = Array.from(map.values()).sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));

    const mapped = [
      { id: 'all', name: 'All Sports', shortName: 'ALL', logoUrl: null }
    ];

    sortedSports.forEach(sport => {
      mapped.push({
        id: sport.id.toString(),
        name: sport.name,
        shortName: sport.abbreviation || sport.name.substring(0, 3).toUpperCase(),
        logoUrl: sport.logo_url
      });
    });

    return mapped;
  }, [allPlayers]);

  useEffect(() => {
    async function fetchInitialData() {
      setFiltersLoading(true);
      const [seasonsResult, playersResult, schoolsResult] = await Promise.all([
        getAvailableSeasons(),
        getAllPlayersWithTeams(),
        getActiveSchools()
      ]);

      if (seasonsResult.success && seasonsResult.data) {
        setSeasons(seasonsResult.data.map((s: any) => ({
          id: s.id,
          label: s.name || `Season ${s.id}`,
          value: s.id.toString()
        })));
      }
      if (playersResult.success && playersResult.data) setAllPlayers(playersResult.data);
      if (schoolsResult.success && schoolsResult.data) setAllSchools(schoolsResult.data);
      
      setFiltersLoading(false);
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredPlayers = useMemo(() => {
    return allPlayers.filter(player => {
      const targetSeasonEntry = player.player_seasons?.find((ps: any) => ps.season_id === Number(selectedSeason)) || player.player_seasons?.[0];

      if (selectedSeason !== 'all' && !player.player_seasons?.some((ps: any) => ps.season_id === Number(selectedSeason))) return false;

      if (selectedSport !== 'all') {
        if (!targetSeasonEntry) return false;
        const teamSportId = targetSeasonEntry?.schools_teams?.sports_categories?.sports?.id;
        if (teamSportId?.toString() !== selectedSport) return false;
      }

      const schoolId = targetSeasonEntry?.schools_teams?.school?.id?.toString();
      if (selectedSchool !== 'all' && schoolId !== selectedSchool) return false;

      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const firstName = (player.first_name || '').toLowerCase();
        const lastName = (player.last_name || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        const slug = (player.slug || '').toLowerCase();
        if (!firstName.includes(searchLower) && !lastName.includes(searchLower) && !fullName.includes(searchLower) && !slug.includes(searchLower)) return false;
      }

      return true;
    }).sort((a, b) => (a.last_name || '').localeCompare(b.last_name || ''));
  }, [allPlayers, selectedSport, selectedSeason, selectedSchool, debouncedSearch]);

  const groupedPlayers = useMemo(() => {
    const groups: Record<string, any> = {};
    filteredPlayers.forEach(player => {
      const team = player.player_seasons?.[0]?.schools_teams?.schools;
      const schoolName = team?.name || 'Unassigned';
      if (!groups[schoolName]) groups[schoolName] = { name: schoolName, abbrev: team?.abbreviation || '---', logo: team?.logo_url || null, players: [] };
      groups[schoolName].players.push(player);
    });
    return Object.values(groups).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [filteredPlayers]);

  const hasActiveFilters = selectedSchool !== 'all' || selectedSeason !== 'all' || selectedSport !== 'all' || searchQuery;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="w-full bg-card/40 backdrop-blur-md border border-border/50 shadow-lg rounded-xl overflow-hidden mb-8">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 p-3 sm:p-4 bg-muted/20">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Sport" /></SelectTrigger>
            <SelectContent>
              {uniqueSports.map((sport) => (
                <SelectItem key={sport.id} value={sport.id.toString()}>{sport.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSeason} onValueChange={setSelectedSeason} disabled={filtersLoading}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Season" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              {seasons.map((s) => <SelectItem key={s.id} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="School" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {allSchools.map((s: any) => <SelectItem key={s.id} value={s.id.toString()}>{s.abbreviation}</SelectItem>)}
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
                  const playerSeason = player.player_seasons?.[0];
                  const position = playerSeason?.position || '';
                  const playerLink = `/players/${player.slug || player.id}`;
                  
                  return (
                    <motion.div key={player.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Link href={playerLink}>
                        <div className="group block h-[360px] rounded-2xl border bg-card overflow-hidden hover:border-primary transition-colors cursor-pointer">
                          <div className="h-[240px] bg-muted relative">
                            {player.photo_url ? (
                              <Image src={player.photo_url} alt={player.first_name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : <User className="h-12 w-12 text-muted-foreground m-auto mt-24" />}
                          </div>
                          <div className="p-4 flex flex-col justify-between h-[120px]">
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
