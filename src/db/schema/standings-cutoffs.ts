import { pgTable, integer, date, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const standingsCutoffs = pgTable(
  'standings_cutoffs',
  {
    season_id: integer('season_id').notNull(),
    sport_category_id: integer('sport_category_id').notNull(),
    counted_through: date('counted_through', { mode: 'string' }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
  },
  (t) => [primaryKey({ columns: [t.season_id, t.sport_category_id] })]
);

export type StandingsCutoffs = typeof standingsCutoffs.$inferSelect;
export type NewStandingsCutoffs = typeof standingsCutoffs.$inferInsert;
