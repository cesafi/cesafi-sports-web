import { PlayerSeasons, NewPlayerSeasons } from '@/db/schema/player-seasons';

export type PlayerSeason = PlayerSeasons;
export type PlayerSeasonInsert = NewPlayerSeasons;
export type PlayerSeasonUpdate = Partial<NewPlayerSeasons>;

export interface PlayerSeasonWithDetails extends PlayerSeason {
  players: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string | null;
    player_number: number | null;
    position: string | null;
  } | null;
  schools_teams: {
    id: string;
    name: string;
    season_id: string;
    sport_category_id: number;
    seasons: {
      id: string;
      name?: string | null;
      start_at: string;
      end_at: string;
    } | null;
    schools: {
      id: string;
      name: string;
      abbreviation: string;
      logo_url: string | null;
    } | null;
    sports_categories: {
      id: number;
      division: string;
      levels: string;
      sports: {
        id: number;
        name: string;
      } | null;
    } | null;
  } | null;
}
