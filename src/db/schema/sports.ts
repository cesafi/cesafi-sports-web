import { sql } from 'drizzle-orm';
import { pgTable, timestamp, text, smallint, serial } from 'drizzle-orm/pg-core';

export const sports = pgTable('sports', {
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  name: text('name').notNull(),
  id: serial('id').primaryKey()
});

export type Sports = typeof sports.$inferSelect;
export type NewSports = typeof sports.$inferInsert;
