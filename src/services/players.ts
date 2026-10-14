import {
  PaginatedResponse,
  PaginationOptions,
  ServiceResponse,
  FilterValue
} from '@/lib/types/base';
import { BaseService } from './base';
import { Player, PlayerInsert, PlayerUpdate, PlayerWithTeam } from '@/lib/types/players';
import CloudinaryService, { extractCloudinaryPublicId } from './cloudinary';
import { players, playerSeasons, schoolsTeams, schools } from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

export class PlayerService extends BaseService {
  static async getPaginated(
    options: PaginationOptions<Record<string, FilterValue>>
  ): Promise<ServiceResponse<PaginatedResponse<PlayerWithTeam>>> {
    try {
      const searchableFields = ['first_name', 'last_name'];
      const optionsWithSearchableFields = {
        ...options,
        searchableFields
      };

      const result = await this.getDrizzlePaginatedData<PlayerWithTeam, typeof players, Record<string, FilterValue>>(
        players,
        optionsWithSearchableFields
      );
      
      // In a more complete implementation, we'd fetch the teams here. 
      // For now, we return the paginated players as is.
      return result;
    } catch (err) {
      return this.formatError(err, `Failed to retrieve paginated players`);
    }
  }

  static async getAll(): Promise<ServiceResponse<Player[]>> {
    try {
      const db = this.getDrizzle();
      const data = await db
        .select()
        .from(players)
        .orderBy(players.last_name);

      return { success: true, data: data as Player[] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch all players.`);
    }
  }

  static async getAllWithTeams(): Promise<ServiceResponse<any[]>> {
    try {
      const db = this.getDrizzle();
      
      const { sportsCategories, sports } = await import('@/db/schema');

      // Manual join chain to avoid deadlocks with db.query
      const rows = await db
        .select({
          player: players,
          playerSeason: playerSeasons,
          team: schoolsTeams,
          school: schools,
          category: sportsCategories,
          sport: sports
        })
        .from(players)
        .leftJoin(playerSeasons, eq(players.id, playerSeasons.player_id))
        .leftJoin(schoolsTeams, eq(playerSeasons.school_team_id, schoolsTeams.id))
        .leftJoin(schools, eq(schoolsTeams.school_id, schools.id))
        .leftJoin(sportsCategories, eq(schoolsTeams.sport_category_id, sportsCategories.id))
        .leftJoin(sports, eq(sportsCategories.sport_id, sports.id))
        .orderBy(players.last_name);

      // Group rows by player
      const playersMap = new Map<string, any>();

      for (const row of rows) {
        if (!playersMap.has(row.player.id)) {
          playersMap.set(row.player.id, {
            ...row.player,
            player_seasons: []
          });
        }
        
        if (row.playerSeason) {
          const p = playersMap.get(row.player.id);
          
          // Check if this season is already added
          const existingSeason = p.player_seasons.find((s: any) => s.id === row.playerSeason!.id);
          if (!existingSeason) {
            p.player_seasons.push({
              ...row.playerSeason,
              schools_teams: row.team ? {
                ...row.team,
                schools: row.school,
                sports_categories: row.category ? {
                  ...row.category,
                  sports: row.sport
                } : null
              } : null
            });
          }
        }
      }

      const result = Array.from(playersMap.values());

      // Latest team = the team from the most recent season entry
      for (const p of result) {
        const latest = [...p.player_seasons]
          .filter((s: any) => s.schools_teams)
          .sort((a: any, b: any) => b.season_id - a.season_id)[0];
        p.schools_teams = latest?.schools_teams ?? null;
      }

      // Players without a season entry fall back to players.school_team_id
      const missingTeamIds = [
        ...new Set(result.filter((p) => !p.schools_teams && p.school_team_id).map((p) => p.school_team_id as string))
      ];

      if (missingTeamIds.length > 0) {
        const teamRows = await db
          .select({ team: schoolsTeams, school: schools, category: sportsCategories, sport: sports })
          .from(schoolsTeams)
          .leftJoin(schools, eq(schoolsTeams.school_id, schools.id))
          .leftJoin(sportsCategories, eq(schoolsTeams.sport_category_id, sportsCategories.id))
          .leftJoin(sports, eq(sportsCategories.sport_id, sports.id))
          .where(inArray(schoolsTeams.id, missingTeamIds));

        const teamsById = new Map(
          teamRows.map((r) => [
            r.team.id,
            {
              ...r.team,
              schools: r.school,
              sports_categories: r.category ? { ...r.category, sports: r.sport } : null
            }
          ])
        );

        for (const p of result) {
          if (!p.schools_teams && p.school_team_id) {
            p.schools_teams = teamsById.get(p.school_team_id) ?? null;
          }
        }
      }

      return { success: true, data: result };
    } catch (err) {
      return this.formatError(err, `Failed to fetch all players with teams.`);
    }
  }

  static async getByTeamId(teamId: string): Promise<ServiceResponse<Player[]>> {
    try {
      const db = this.getDrizzle();
      const data = await db
        .select({
          player: players
        })
        .from(playerSeasons)
        .innerJoin(players, eq(playerSeasons.player_id, players.id))
        .where(eq(playerSeasons.school_team_id, teamId));

      const result = data.map((d) => d.player);
      return { success: true, data: result as Player[] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch players by team.`);
    }
  }

  static async getActivePlayers(): Promise<ServiceResponse<Player[]>> {
    try {
      const db = this.getDrizzle();
      const data = await db
        .select()
        .from(players)
        .where(eq(players.is_active, true))
        .orderBy(players.last_name);

      return { success: true, data: data as Player[] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch active players.`);
    }
  }

  static async getCount(): Promise<ServiceResponse<number>> {
    try {
      const db = this.getDrizzle();
      const { sql } = await import('drizzle-orm');
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(players);

      return { success: true, data: Number(count) };
    } catch (err) {
      return this.formatError(err, `Failed to get player count.`);
    }
  }

  static async getById(id: string): Promise<ServiceResponse<PlayerWithTeam>> {
    try {
      const db = this.getDrizzle();
      const [data] = await db
        .select()
        .from(players)
        .where(eq(players.id, id));

      if (!data) throw new Error('Player not found');

      return { success: true, data: data as PlayerWithTeam };
    } catch (err) {
      return this.formatError(err, `Failed to fetch player by ID.`);
    }
  }

  static async getBySlug(playerSlug: string): Promise<ServiceResponse<PlayerWithTeam>> {
    try {
      const db = this.getDrizzle();

      const [data] = await db
        .select()
        .from(players)
        .where(eq(players.slug, playerSlug));

      if (!data) {
        return { success: false, error: 'Player not found' };
      }

      return { success: true, data: data as PlayerWithTeam };
    } catch (err) {
      return this.formatError(err, `Failed to fetch player by slug.`);
    }
  }

  static async getBySlugAndSchool(playerSlug: string, schoolAbbreviation: string): Promise<ServiceResponse<PlayerWithTeam>> {
    try {
      const db = this.getDrizzle();

      const [data] = await db
        .select({
          player: players
        })
        .from(players)
        .innerJoin(playerSeasons, eq(players.id, playerSeasons.player_id))
        .innerJoin(schoolsTeams, eq(playerSeasons.school_team_id, schoolsTeams.id))
        .innerJoin(schools, eq(schoolsTeams.school_id, schools.id))
        .where(and(eq(players.slug, playerSlug), eq(schools.abbreviation, schoolAbbreviation)));

      if (!data) {
        // Fallback: match just by slug
        return this.getBySlug(playerSlug);
      }

      return { success: true, data: data.player as PlayerWithTeam };
    } catch (err) {
      return this.formatError(err, `Failed to fetch player by slug and school.`);
    }
  }

  static async insert(player: PlayerInsert): Promise<ServiceResponse<Player>> {
    try {
      const db = this.getDrizzle();
      const [data] = await db
        .insert(players)
        .values(player as any)
        .returning();

      return { success: true, data: data as Player };
    } catch (err) {
      return this.formatError(err, `Failed to create player.`);
    }
  }

  static async updateById(player: PlayerUpdate): Promise<ServiceResponse<undefined>> {
    try {
      const { id, ...updateData } = player;
      const db = this.getDrizzle();
      await db
        .update(players)
        .set(updateData as any)
        .where(eq(players.id, id));

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to update player.`);
    }
  }

  static async deleteById(id: string): Promise<ServiceResponse<undefined>> {
    try {
      const db = this.getDrizzle();

      const [player] = await db
        .select({ photo_url: players.photo_url })
        .from(players)
        .where(eq(players.id, id));

      if (player?.photo_url) {
        try {
          const publicId = extractCloudinaryPublicId(player.photo_url);
          if (publicId) {
            await CloudinaryService.deleteImage(publicId, { resourceType: 'image' });
          }
        } catch (cloudinaryError) {
          console.warn('Failed to delete player photo from Cloudinary:', cloudinaryError);
        }
      }

      await db.delete(players).where(eq(players.id, id));

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to delete player.`);
    }
  }

  static async assignTeam(playerId: string, teamId: string, seasonId?: number): Promise<ServiceResponse<undefined>> {
    try {
      const db = this.getDrizzle();

      // A team belongs to exactly one season, so the team's own season takes precedence
      const [team] = await db
        .select({ season_id: schoolsTeams.season_id })
        .from(schoolsTeams)
        .where(eq(schoolsTeams.id, teamId));
      const resolvedSeasonId = team?.season_id ?? seasonId;

      if (!resolvedSeasonId) {
        throw new Error('No season found for the selected team.');
      }

      // The unique key is (player_id, season_id, school_team_id), so ON CONFLICT on
      // (player_id, season_id) is rejected by Postgres. Update the season's row instead.
      const [existing] = await db
        .select({ id: playerSeasons.id })
        .from(playerSeasons)
        .where(and(eq(playerSeasons.player_id, playerId), eq(playerSeasons.season_id, resolvedSeasonId)));

      if (existing) {
        await db
          .update(playerSeasons)
          .set({ school_team_id: teamId })
          .where(eq(playerSeasons.id, existing.id));
      } else {
        await db.insert(playerSeasons).values({
          player_id: playerId,
          school_team_id: teamId,
          season_id: resolvedSeasonId,
          is_active: true
        });
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, 'Failed to assign player to team.');
    }
  }
}
