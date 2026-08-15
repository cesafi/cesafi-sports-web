import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  timestamp,
  integer,
  bigint,
  real,
  boolean,
  text} from 'drizzle-orm/pg-core';

/**
 * game_stats — per-game player statistics
 * Stored as flexible numeric fields that map to different sport metrics:
 *
 * BASKETBALL:
 *   stat1 = points, stat2 = rebounds, stat3 = assists
 *   stat4 = steals, stat5 = blocks, stat6 = turnovers
 *   stat7 = fg_made, stat8 = fg_attempted, stat9 = three_pt_made, stat10 = three_pt_attempted
 *   stat11 = ft_made, stat12 = ft_attempted
 *
 * VOLLEYBALL:
 *   stat1 = kills, stat2 = assists, stat3 = aces
 *   stat4 = blocks, stat5 = digs, stat6 = service_errors
 *   stat7 = attack_errors, stat8 = reception_errors
 *
 * FOOTBALL (soccer):
 *   stat1 = goals, stat2 = assists, stat3 = shots
 *   stat4 = shots_on_target, stat5 = yellow_cards, stat6 = red_cards
 *   stat7 = minutes_played, stat8 = passes
 *
 * The sport_id on the parent match/game determines which mapping to use.
 */
export const gameStats = pgTable('game_stats', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  game_id: bigint('game_id', { mode: 'number' }).notNull(),
  player_id: uuid('player_id').notNull(),
  team_id: uuid('team_id').notNull(),
  is_mvp: boolean('is_mvp').default(false).notNull(),
  // Flexible stat columns — mapped based on sport
  stat1: real('stat1'),
  stat2: real('stat2'),
  stat3: real('stat3'),
  stat4: real('stat4'),
  stat5: real('stat5'),
  stat6: real('stat6'),
  stat7: real('stat7'),
  stat8: real('stat8'),
  stat9: real('stat9'),
  stat10: real('stat10'),
  stat11: real('stat11'),
  stat12: real('stat12'),
  notes: text('notes')
});

export type GameStats = typeof gameStats.$inferSelect;
export type NewGameStats = typeof gameStats.$inferInsert;
