import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, serial } from 'drizzle-orm/pg-core';

export const cesafiTimeline = pgTable('cesafi_timeline', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  year: text('year').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  is_highlight: boolean('is_highlight').default(false).notNull(),
  image_url: text('image_url').notNull()
});

export type CesafiTimeline = typeof cesafiTimeline.$inferSelect;
export type NewCesafiTimeline = typeof cesafiTimeline.$inferInsert;
