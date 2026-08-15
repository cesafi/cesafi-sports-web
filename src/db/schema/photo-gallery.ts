import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, serial } from 'drizzle-orm/pg-core';

export const photoGallery = pgTable('photo_gallery', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  photo_url: text('photo_url').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  caption: text('caption').notNull(),
  photo_by: text('photo_by').notNull()
});

export type PhotoGallery = typeof photoGallery.$inferSelect;
export type NewPhotoGallery = typeof photoGallery.$inferInsert;
