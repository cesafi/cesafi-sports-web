import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, serial } from 'drizzle-orm/pg-core';

export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  name: text('name').notNull()
});

export type Departments = typeof departments.$inferSelect;
export type NewDepartments = typeof departments.$inferInsert;
