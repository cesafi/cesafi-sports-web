import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp, boolean, smallint } from 'drizzle-orm/pg-core';

export const volunteers = pgTable('volunteers', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  full_name: text('full_name').default('').notNull(),
  image_url: text('image_url'),
  title: text('title'),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  season_id: smallint('season_id'),
  is_active: boolean('is_active'),
  department_id: smallint('department_id')
});

export type Volunteers = typeof volunteers.$inferSelect;
export type NewVolunteers = typeof volunteers.$inferInsert;
