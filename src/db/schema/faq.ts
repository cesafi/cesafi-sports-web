import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, serial, smallint } from 'drizzle-orm/pg-core';

export const faq = pgTable('faq', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  is_open: boolean('is_open').notNull(),
  display_order: smallint('display_order').notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  category: text('category').default('General').notNull(),
  is_highlight: boolean('is_highlight').default(false).notNull()
});

export type Faq = typeof faq.$inferSelect;
export type NewFaq = typeof faq.$inferInsert;
