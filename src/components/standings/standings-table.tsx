import Image from 'next/image';
import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { moderniz } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { CategoryStandings } from '@/lib/types/standings';

const RANK_COLORS: Record<number, string> = {
  1: 'text-yellow-500',
  2: 'text-slate-400',
  3: 'text-amber-600'
};

interface StandingsTableProps {
  category: CategoryStandings;
}

export function StandingsTable({ category: standings }: StandingsTableProps) {
  const { category, teams, hasResults } = standings;
  const headingId = `standings-category-${category.id}`;

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-primary h-8 w-1 flex-shrink-0 rounded-full" />
          <h2 id={headingId} className={`${moderniz.className} truncate text-lg font-bold tracking-wide md:text-2xl`}>
            {category.name}
          </h2>
        </div>
        <Badge variant="outline" className="bg-background/50 flex-shrink-0 text-xs tracking-widest uppercase">
          {teams.length} {teams.length === 1 ? 'Team' : 'Teams'}
        </Badge>
      </div>

      {!hasResults && <p className="text-muted-foreground px-1 text-sm">No results recorded yet</p>}

      <Card className="border-border/50 bg-card/40 overflow-hidden py-0 shadow-xl backdrop-blur-md">
        <CardContent className="p-0">
          <Table>
            <TableCaption className="sr-only">{category.name}</TableCaption>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col" className="text-muted-foreground w-16 pl-4 text-xs font-semibold tracking-wider uppercase sm:w-20 sm:pl-6">
                  Rank
                </TableHead>
                <TableHead scope="col" className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Team
                </TableHead>
                <TableHead scope="col" className="text-muted-foreground w-14 text-center text-xs font-semibold tracking-wider uppercase sm:w-20">
                  W
                </TableHead>
                <TableHead scope="col" className="text-muted-foreground w-14 pr-4 text-center text-xs font-semibold tracking-wider uppercase sm:w-20 sm:pr-6">
                  L
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.teamId} className="border-border/30 hover:bg-muted/20">
                  <TableCell className="py-3 pl-4 sm:py-4 sm:pl-6">
                    {team.rank === null ? (
                      <span aria-label="Not ranked yet" className="text-muted-foreground text-lg">
                        –
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span className={cn(moderniz.className, 'text-lg sm:text-xl', RANK_COLORS[team.rank])}>
                          {team.rank}
                        </span>
                        {team.rank === 1 && <Trophy aria-hidden="true" className="h-4 w-4 text-yellow-500" />}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 whitespace-normal sm:py-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Image
                        src={team.school.logoUrl ?? '/img/cesafi-logo.webp'}
                        alt={team.school.name}
                        width={40}
                        height={40}
                        className="h-8 w-8 flex-shrink-0 object-contain drop-shadow-md sm:h-10 sm:w-10"
                      />
                      <div className="flex min-w-0 flex-col">
                        <span className="text-foreground font-bold">{team.teamName}</span>
                        <span className="text-muted-foreground text-xs sm:hidden">{team.school.abbreviation}</span>
                        <span className="text-muted-foreground hidden text-xs sm:inline">{team.school.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center font-semibold tabular-nums sm:py-4">{team.wins}</TableCell>
                  <TableCell className="py-3 pr-4 text-center font-semibold tabular-nums sm:py-4 sm:pr-6">
                    {team.losses}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
