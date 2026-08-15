import { sql } from 'drizzle-orm';
import { pgTable, timestamp, text, bigint, smallint, bigserial, serial } from 'drizzle-orm/pg-core';

export const games = pgTable('games', {
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  game_number: smallint('game_number').default(1).notNull(),
  duration: text('duration').default('00:00').notNull(),
  start_at: timestamp('start_at', { withTimezone: true, mode: 'string' }),
  end_at: timestamp('end_at', { withTimezone: true, mode: 'string' }),
  match_id: bigint('match_id', { mode: 'number' }).notNull(),
  id: bigserial('id', { mode: 'number' }).primaryKey()
});

export type Games = typeof games.$inferSelect;
export type NewGames = typeof games.$inferInsert;
