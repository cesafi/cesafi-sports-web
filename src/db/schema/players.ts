import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp, integer, boolean} from 'drizzle-orm/pg-core';


/**
 * players — athletes registered in the CESAFI sports platform
 * Supports basketball, volleyball, football and other sports
 * player_number = jersey number
 * position = sport-specific position (e.g. "Point Guard", "Setter", "Striker")
 */
export const players = pgTable('players', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  player_number: integer('player_number'),
  position: text('position'),
  photo_url: text('photo_url'),
  school_team_id: uuid('school_team_id').notNull(),
  sport_id: integer('sport_id').notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  slug: text('slug').notNull(),
  bio: text('bio')
});

export type Players = typeof players.$inferSelect;
export type NewPlayers = typeof players.$inferInsert;
