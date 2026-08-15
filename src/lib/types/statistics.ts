import { GameStats } from '@/db/schema/game-stats';

// Enums or constants for the sports based on CESAFI offerings
export type CesafiSport = 
  | 'basketball' 
  | 'volleyball' 
  | 'football' 
  | 'badminton' 
  | 'table_tennis' 
  | 'swimming' 
  | 'chess' 
  | 'dancesport' 
  | 'esports' 
  | 'scrabble' 
  | 'softball'
  | 'generic';

// Base statistics interface that maps to the DB schema
export interface BasePlayerStats extends Omit<GameStats, 'stat1' | 'stat2' | 'stat3' | 'stat4' | 'stat5' | 'stat6' | 'stat7' | 'stat8' | 'stat9' | 'stat10' | 'stat11' | 'stat12'> {
  player_name?: string;
  team_name?: string;
  games_played?: number;
  sport_type?: CesafiSport;
}

// Basketball Stats Mapping
// stat1 = points, stat2 = rebounds, stat3 = assists
// stat4 = steals, stat5 = blocks, stat6 = turnovers
// stat7 = fg_made, stat8 = fg_attempted, stat9 = three_pt_made, stat10 = three_pt_attempted
// stat11 = ft_made, stat12 = ft_attempted
export interface BasketballStats extends BasePlayerStats {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fg_made: number;
  fg_attempted: number;
  three_pt_made: number;
  three_pt_attempted: number;
  ft_made: number;
  ft_attempted: number;
}

// Volleyball Stats Mapping
// stat1 = kills, stat2 = assists, stat3 = aces
// stat4 = blocks, stat5 = digs, stat6 = service_errors
// stat7 = attack_errors, stat8 = reception_errors
export interface VolleyballStats extends BasePlayerStats {
  kills: number;
  assists: number;
  aces: number;
  blocks: number;
  digs: number;
  service_errors: number;
  attack_errors: number;
  reception_errors: number;
}

// Football Stats Mapping
// stat1 = goals, stat2 = assists, stat3 = shots
// stat4 = shots_on_target, stat5 = yellow_cards, stat6 = red_cards
// stat7 = minutes_played, stat8 = passes
export interface FootballStats extends BasePlayerStats {
  goals: number;
  assists: number;
  shots: number;
  shots_on_target: number;
  yellow_cards: number;
  red_cards: number;
  minutes_played: number;
  passes: number;
}

// Softball Stats Mapping
// stat1 = runs, stat2 = hits, stat3 = errors, stat4 = rbi, stat5 = home_runs
export interface SoftballStats extends BasePlayerStats {
  runs: number;
  hits: number;
  errors: number;
  rbi: number;
  home_runs: number;
}

// Esports Stats Mapping
// stat1 = kills, stat2 = deaths, stat3 = assists, stat4 = score
export interface EsportsStats extends BasePlayerStats {
  kills: number;
  deaths: number;
  assists: number;
  score: number;
}

// Generic Stats Mapping for other sports (Chess, Swimming, etc.)
// stat1 = score, stat2 = rank/placement, stat3 = fouls/penalties
export interface GenericStats extends BasePlayerStats {
  score: number;
  rank: number;
  penalties: number;
}

// Aggregated Stats Summary (what we send to the frontend for Leaderboards/Tables)
export interface PlayerStatsSummary {
  player_id: string;
  player_name: string;
  player_photo_url: string | null;
  team_id: string | null;
  team_name: string | null;
  team_logo_url: string | null;
  school_abbreviation: string | null;
  games_played: number;
  mvp_count: number;
  
  // A catch-all for the aggregated metrics depending on sport
  metrics: Record<string, number>;
}

export interface StatisticsFilters {
  sport?: CesafiSport;
  season_id?: number;
  stage_id?: number;
  division?: string;
  team_id?: string;
  school_id?: string;
  search_query?: string;
  page?: number;
  limit?: number;
}

export interface LeaderboardEntry {
  player_id: string;
  player_name: string;
  player_photo_url: string | null;
  team_name: string | null;
  team_logo_url: string | null;
  value: number;
  metric_name: string;
}
