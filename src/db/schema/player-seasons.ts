import { sql } from 'drizzle-orm';
import { pgTable, uuid, timestamp, integer, bigint, boolean} from 'drizzle-orm/pg-core';

/**
 * player_seasons — tracks a player's participation per season
 * Links players to their active team and season
 */
export const playerSeasons = pgTable('player_seasons', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  player_id: uuid('player_id').notNull(),
  season_id: integer('season_id').notNull(),
  stage_id: bigint('stage_id', { mode: 'number' }),
  school_team_id: uuid('school_team_id').notNull(),
  is_active: boolean('is_active').default(true).notNull()
});

export type PlayerSeasons = typeof playerSeasons.$inferSelect;
export type NewPlayerSeasons = typeof playerSeasons.$inferInsert;
