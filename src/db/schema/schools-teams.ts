import { sql } from 'drizzle-orm';
import { pgTable, uuid, timestamp, text, boolean, integer, smallint } from 'drizzle-orm/pg-core';

export const schoolsTeams = pgTable('schools_teams', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  name: text('name').default('').notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  school_id: uuid('school_id').notNull(),
  sport_category_id: integer('sport_category_id').notNull(),
  season_id: smallint('season_id').notNull()
});

export type SchoolsTeams = typeof schoolsTeams.$inferSelect;
export type NewSchoolsTeams = typeof schoolsTeams.$inferInsert;
