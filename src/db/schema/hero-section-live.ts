import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, serial } from 'drizzle-orm/pg-core';

export const heroSectionLive = pgTable('hero_section_live', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  video_link: text('video_link').notNull(),
  end_at: timestamp('end_at', { withTimezone: true, mode: 'string' }).notNull()
});

export type HeroSectionLive = typeof heroSectionLive.$inferSelect;
export type NewHeroSectionLive = typeof heroSectionLive.$inferInsert;
