import { pgTable, uuid, timestamp, integer } from 'drizzle-orm/pg-core';

export const teamStandings = pgTable('team_standings', {
  team_id: uuid('team_id').primaryKey(),
  wins: integer('wins').default(0).notNull(),
  losses: integer('losses').default(0).notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
});

export type TeamStandings = typeof teamStandings.$inferSelect;
export type NewTeamStandings = typeof teamStandings.$inferInsert;
