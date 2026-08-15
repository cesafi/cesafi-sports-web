import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp} from 'drizzle-orm/pg-core';

/**
 * article_views — tracks anonymous and authenticated article views
 * Used for view counting and analytics on articles
 */
export const articleViews = pgTable('article_views', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  article_id: uuid('article_id').notNull(),
  viewer_ip: text('viewer_ip'),
  viewer_session: text('viewer_session'),
  viewed_at: timestamp('viewed_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
});

export type ArticleViews = typeof articleViews.$inferSelect;
export type NewArticleViews = typeof articleViews.$inferInsert;
