import { sql } from 'drizzle-orm';
import { pgTable, timestamp, serial, text, smallint } from 'drizzle-orm/pg-core';
import { sportDivisionsEnum, sportLevelsEnum } from './enums';

export const sportsCategories = pgTable('sports_categories', {
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  division: sportDivisionsEnum('division').notNull(),
  levels: sportLevelsEnum('levels').notNull(),
  id: serial('id').primaryKey(),
  sport_id: smallint('sport_id').notNull()
});

export type SportsCategories = typeof sportsCategories.$inferSelect;
export type NewSportsCategories = typeof sportsCategories.$inferInsert;
