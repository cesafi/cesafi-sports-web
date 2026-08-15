import { sql } from 'drizzle-orm';
import { pgTable, uuid, timestamp, text, jsonb } from 'drizzle-orm/pg-core';
import { articleStatusEnum } from './enums';

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  title: text('title').notNull(),
  content: jsonb('content').notNull(),
  cover_image_url: text('cover_image_url').notNull(),
  published_at: timestamp('published_at', { withTimezone: true, mode: 'string' }),
  status: articleStatusEnum('status').default('review').notNull(),
  authored_by: text('authored_by').notNull(),
  slug: text('slug').notNull()
});

export type Articles = typeof articles.$inferSelect;
export type NewArticles = typeof articles.$inferInsert;
