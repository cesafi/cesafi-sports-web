import { sql } from 'drizzle-orm';
import { pgTable, timestamp, bigint, uuid, integer, bigserial, serial } from 'drizzle-orm/pg-core';

export const matchParticipants = pgTable('match_participants', {
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  match_id: bigint('match_id', { mode: 'number' }).notNull(),
  team_id: uuid('team_id').notNull(),
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  match_score: integer('match_score').default(0)
});

export type MatchParticipants = typeof matchParticipants.$inferSelect;
export type NewMatchParticipants = typeof matchParticipants.$inferInsert;
