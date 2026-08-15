import { sql } from 'drizzle-orm';
import { pgTable, timestamp, text, bigint, smallint, bigserial, serial } from 'drizzle-orm/pg-core';

export const gameScores = pgTable('game_scores', {
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  score: smallint('score').notNull(),
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  match_participant_id: bigint('match_participant_id', { mode: 'number' }).notNull(),
  game_id: bigint('game_id', { mode: 'number' })
});

export type GameScores = typeof gameScores.$inferSelect;
export type NewGameScores = typeof gameScores.$inferInsert;
