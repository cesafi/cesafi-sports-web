import { sql } from 'drizzle-orm';
import { pgTable, uuid, timestamp, text, boolean, smallint } from 'drizzle-orm/pg-core';
import { sponsorTypeEnum } from './enums';

export const sponsors = pgTable('sponsors', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  logo_url: text('logo_url'),
  dark_logo_url: text('dark_logo_url'),
  title: text('title').notNull(),
  tagline: text('tagline').notNull(),
  type: sponsorTypeEnum('type'),
  display_order: smallint('display_order'),
  is_active: boolean('is_active').notNull()
});

export type Sponsors = typeof sponsors.$inferSelect;
export type NewSponsors = typeof sponsors.$inferInsert;
