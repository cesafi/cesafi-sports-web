'use client';

import Link from 'next/link';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStandingsTable, useUpdateTeamStanding } from '@/hooks/use-standings';
import type { StandingsSortKey } from '@/lib/types/standings';
import { StandingsRow } from './standings-row';

const SORT_OPTIONS: { value: StandingsSortKey; label: string }[] = [
  { value: 'rank', label: 'Rank' },
  { value: 'school', label: 'School A–Z' },
  { value: 'wins', label: 'Most wins' },
  { value: 'losses', label: 'Most losses' }
];

interface StandingsManagerProps {
  seasonId: number;
}

export function StandingsManager({ seasonId }: StandingsManagerProps) {
  const {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    search,
    setSearch,
    sortKey,
    setSortKey,
    rows,
    isLoading,
    error,
    refetch
  } = useStandingsTable(seasonId);
  const update = useUpdateTeamStanding(seasonId);

  const selectedCategory = categories.find((c) => c.category.id === selectedCategoryId);

  const header = (
    <div>
      <h1 className="text-2xl font-bold">Standings</h1>
      <p className="text-muted-foreground mt-1">Season {seasonId} · wins and losses by category</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {header}
        <div className="bg-card space-y-3 rounded-lg border p-6" aria-busy="true" aria-label="Loading standings">
          <Skeleton className="h-9 w-full max-w-xl" />
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-6">
        {header}
        <div className="bg-card flex flex-col items-center gap-3 rounded-lg border px-6 py-12 text-center" role="alert">
          <AlertCircle className="text-destructive h-8 w-8" />
          <p className="text-destructive">{error.message}</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="w-full space-y-6">
        {header}
        <div className="bg-card rounded-lg border px-6 py-12 text-center">
          <p className="text-muted-foreground">
            No active teams in Season {seasonId}. Add teams under{' '}
            <Link href="/admin/school-teams" className="text-primary font-medium underline-offset-4 hover:underline">
              School Teams
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {header}

      <Tabs value={String(selectedCategoryId)} onValueChange={(value) => setSelectedCategoryId(Number(value))}>
        <TabsList className="h-auto flex-wrap justify-start">
          {categories.map(({ category, teams }) => (
            <TabsTrigger key={category.id} value={String(category.id)} className="gap-2">
              {category.name}
              <Badge variant="secondary">{teams.length}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={String(selectedCategoryId)} className="mt-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search school or team"
                aria-label="Search school or team"
                className="pl-9"
              />
            </div>
            <Select value={sortKey} onValueChange={(value) => setSortKey(value as StandingsSortKey)}>
              <SelectTrigger className="w-full sm:w-44" aria-label="Sort teams">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && !selectedCategory.hasResults && (
            <p className="text-muted-foreground text-sm">
              No results recorded yet. Ranks appear once a team has a win or a loss.
            </p>
          )}

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 px-4 text-center">Rank</TableHead>
                  <TableHead className="px-4">Team</TableHead>
                  <TableHead className="px-4">Wins</TableHead>
                  <TableHead className="px-4">Losses</TableHead>
                  <TableHead className="w-48 px-4">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((team) => (
                  <StandingsRow
                    key={team.teamId}
                    team={team}
                    onSave={(values) =>
                      update.mutateAsync({
                        input: { teamId: team.teamId, ...values, expectedUpdatedAt: team.updatedAt },
                        teamName: team.teamName
                      })
                    }
                  />
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                      No teams match &apos;{search.trim()}&apos;
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
