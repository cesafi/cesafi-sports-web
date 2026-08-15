import { sql } from 'drizzle-orm';
import { pgTable, uuid, timestamp, text, boolean } from 'drizzle-orm/pg-core';

export const schools = pgTable('schools', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  name: text('name').default('').notNull(),
  abbreviation: text('abbreviation').default('').notNull(),
  logo_url: text('logo_url').default(''),
  is_active: boolean('is_active').notNull()
});

export type Schools = typeof schools.$inferSelect;
export type NewSchools = typeof schools.$inferInsert;
