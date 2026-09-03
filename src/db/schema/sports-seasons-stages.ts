import { sql } from 'drizzle-orm';
import { pgTable, timestamp, bigint, text, integer, smallint, bigserial, serial } from 'drizzle-orm/pg-core';
import { competitionStageEnum } from './enums';

export const sportsSeasonsStages = pgTable('sports_seasons_stages', {
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  competition_stage: text('competition_stage').notNull(),
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  season_id: smallint('season_id'),
  sport_category_id: integer('sport_category_id')
});

export type SportsSeasonsStages = typeof sportsSeasonsStages.$inferSelect;
export type NewSportsSeasonsStages = typeof sportsSeasonsStages.$inferInsert;
