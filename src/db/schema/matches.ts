import { sql } from 'drizzle-orm';
import { pgTable, timestamp, text, bigint, smallint, bigserial, serial } from 'drizzle-orm/pg-core';
import { matchStatusEnum } from './enums';

export const matches = pgTable('matches', {
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  scheduled_at: timestamp('scheduled_at', { withTimezone: true, mode: 'string' }),
  start_at: timestamp('start_at', { withTimezone: true, mode: 'string' }),
  end_at: timestamp('end_at', { withTimezone: true, mode: 'string' }),
  best_of: smallint('best_of').default(1).notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  stage_id: bigint('stage_id', { mode: 'number' }).notNull(),
  venue: text('venue').notNull(),
  status: matchStatusEnum('status').default('upcoming').notNull()
});

export type Matches = typeof matches.$inferSelect;
export type NewMatches = typeof matches.$inferInsert;
