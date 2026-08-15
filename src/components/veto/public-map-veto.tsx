'use client';

import React from 'react';

interface TeamInfo {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl?: string | null;
}

export interface PublicMapVetoTableProps {
  matchId: string | number;
  bestOf?: number;
  team1?: TeamInfo;
  team2?: TeamInfo;
  coinTossWinnerId?: string | null;
  coinTossResult?: string | null;
  sport?: string;
}

export function PublicMapVetoTable(props: PublicMapVetoTableProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-6 text-center text-muted-foreground/60">
      Map veto data will be available here soon.
    </div>
  );
}
