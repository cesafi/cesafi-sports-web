import { sql } from 'drizzle-orm';
import {
  pgTable,
  serial,
  timestamp,
  integer,
  varchar,
} from 'drizzle-orm/pg-core';
import { sports } from './sports';

/**
 * sport_stat_mappings — maps flexible game_stats columns (stat1..stat12) to sport-specific labels
 */
export const sportStatMappings = pgTable('sport_stat_mappings', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  sport_id: integer('sport_id').references(() => sports.id, { onDelete: 'cascade' }).notNull(),
  stat_column: varchar('stat_column', { length: 20 }).notNull(), // e.g., 'stat1'
  label: varchar('label', { length: 50 }).notNull(), // e.g., 'Points'
});

export type SportStatMapping = typeof sportStatMappings.$inferSelect;
export type NewSportStatMapping = typeof sportStatMappings.$inferInsert;
