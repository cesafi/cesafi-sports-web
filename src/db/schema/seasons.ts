import { sql } from 'drizzle-orm';
import { pgTable, timestamp, text, serial } from 'drizzle-orm/pg-core';

export const seasons = pgTable('seasons', {
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  start_at: timestamp('start_at', { withTimezone: true, mode: 'string' }).notNull(),
  end_at: timestamp('end_at', { withTimezone: true, mode: 'string' }).notNull(),
  id: serial('id').primaryKey()
});

export type Seasons = typeof seasons.$inferSelect;
export type NewSeasons = typeof seasons.$inferInsert;
