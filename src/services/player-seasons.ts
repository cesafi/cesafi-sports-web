import { ServiceResponse } from '@/lib/types/base';
import { BaseService } from './base';
import { PlayerSeason, PlayerSeasonInsert, PlayerSeasonUpdate, PlayerSeasonWithDetails } from '@/lib/types/player-seasons';
import { playerSeasons, players, schoolsTeams, schools, seasons, sportsCategories, sports } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export class PlayerSeasonService extends BaseService {
  static async getAll(): Promise<ServiceResponse<PlayerSeason[]>> {
    try {
      const db = this.getDrizzle();
      const data = await db
        .select()
        .from(playerSeasons)
        .orderBy(desc(playerSeasons.created_at));

      return { success: true, data: data as PlayerSeason[] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch all player seasons.`);
    }
  }

  static async getBySeasonId(seasonId: number): Promise<ServiceResponse<PlayerSeasonWithDetails[]>> {
    try {
      const db = this.getDrizzle();
      const data = await db
        .select({
          player_seasons: playerSeasons,
          players: players,
          schools_teams: schoolsTeams,
          schools: schools,
          seasons: seasons,
          sports_categories: sportsCategories,
          sports: sports
        })
        .from(playerSeasons)
        .leftJoin(players, eq(playerSeasons.player_id, players.id))
        .leftJoin(schoolsTeams, eq(playerSeasons.school_team_id, schoolsTeams.id))
        .leftJoin(schools, eq(schoolsTeams.school_id, schools.id))
        .leftJoin(seasons, eq(playerSeasons.season_id, seasons.id))
        .leftJoin(sportsCategories, eq(schoolsTeams.sport_category_id, sportsCategories.id))
        .leftJoin(sports, eq(sportsCategories.sport_id, sports.id))
        .where(eq(playerSeasons.season_id, seasonId))
        .orderBy(desc(seasons.start_at));

      const formattedData = data.map((row) => ({
        ...row.player_seasons,
        players: row.players,
        schools_teams: row.schools_teams ? {
          ...row.schools_teams,
          schools: row.schools,
          seasons: row.seasons,
          sports_categories: row.sports_categories ? {
            ...row.sports_categories,
            sports: row.sports
          } : null
        } : null
      }));

      return { success: true, data: formattedData as PlayerSeasonWithDetails[] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch player seasons by season ID.`);
    }
  }

  static async getByPlayerId(playerId: string): Promise<ServiceResponse<PlayerSeasonWithDetails[]>> {
    try {
      const db = this.getDrizzle();
      const data = await db
        .select({
          player_seasons: playerSeasons,
          players: players,
          schools_teams: schoolsTeams,
          schools: schools,
          seasons: seasons,
          sports_categories: sportsCategories,
          sports: sports
        })
        .from(playerSeasons)
        .leftJoin(players, eq(playerSeasons.player_id, players.id))
        .leftJoin(schoolsTeams, eq(playerSeasons.school_team_id, schoolsTeams.id))
        .leftJoin(schools, eq(schoolsTeams.school_id, schools.id))
        .leftJoin(seasons, eq(playerSeasons.season_id, seasons.id))
        .leftJoin(sportsCategories, eq(schoolsTeams.sport_category_id, sportsCategories.id))
        .leftJoin(sports, eq(sportsCategories.sport_id, sports.id))
        .where(eq(playerSeasons.player_id, playerId))
        .orderBy(desc(seasons.start_at));

      const formattedData = data.map((row) => ({
        ...row.player_seasons,
        players: row.players,
        schools_teams: row.schools_teams ? {
          ...row.schools_teams,
          schools: row.schools,
          seasons: row.seasons,
          sports_categories: row.sports_categories ? {
            ...row.sports_categories,
            sports: row.sports
          } : null
        } : null
      }));

      return { success: true, data: formattedData as PlayerSeasonWithDetails[] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch player seasons by player ID.`);
    }
  }

  static async getById(id: string): Promise<ServiceResponse<PlayerSeasonWithDetails>> {
    try {
      const db = this.getDrizzle();
      const data = await db
        .select({
          player_seasons: playerSeasons,
          players: players,
          schools_teams: schoolsTeams,
          schools: schools,
          seasons: seasons,
          sports_categories: sportsCategories,
          sports: sports
        })
        .from(playerSeasons)
        .leftJoin(players, eq(playerSeasons.player_id, players.id))
        .leftJoin(schoolsTeams, eq(playerSeasons.school_team_id, schoolsTeams.id))
        .leftJoin(schools, eq(schoolsTeams.school_id, schools.id))
        .leftJoin(seasons, eq(playerSeasons.season_id, seasons.id))
        .leftJoin(sportsCategories, eq(schoolsTeams.sport_category_id, sportsCategories.id))
        .leftJoin(sports, eq(sportsCategories.sport_id, sports.id))
        .where(eq(playerSeasons.id, id))
        .limit(1);

      if (data.length === 0) {
        return { success: false, error: 'Player season not found.' };
      }

      const row = data[0];
      const formattedData = {
        ...row.player_seasons,
        players: row.players,
        schools_teams: row.schools_teams ? {
          ...row.schools_teams,
          schools: row.schools,
          seasons: row.seasons,
          sports_categories: row.sports_categories ? {
            ...row.sports_categories,
            sports: row.sports
          } : null
        } : null
      };

      return { success: true, data: formattedData as PlayerSeasonWithDetails };
    } catch (err) {
      return this.formatError(err, `Failed to fetch player season by ID.`);
    }
  }

  static async insert(playerSeason: PlayerSeasonInsert): Promise<ServiceResponse<undefined>> {
    try {
      const db = this.getDrizzle();
      await db.insert(playerSeasons).values(playerSeason as any);
      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to create player season.`);
    }
  }

  static async updateById(playerSeason: PlayerSeasonUpdate): Promise<ServiceResponse<undefined>> {
    try {
      const { id, ...updateData } = playerSeason;
      const db = this.getDrizzle();
      await db.update(playerSeasons).set(updateData as any).where(eq(playerSeasons.id, id!));
      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to update player season.`);
    }
  }

  static async deleteById(id: string): Promise<ServiceResponse<undefined>> {
    try {
      const db = this.getDrizzle();
      await db.delete(playerSeasons).where(eq(playerSeasons.id, id));
      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to delete player season.`);
    }
  }
}
