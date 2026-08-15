import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Drizzle ORM client — primary data access layer.
 * Connects directly to Supabase PostgreSQL via DATABASE_URL.
 *
 * NOTE: Supabase Auth still uses @supabase/ssr — Drizzle handles all data queries.
 */

function createDrizzleClient() {
  const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/postgres';

  const client = postgres(databaseUrl, {
    // Supabase requires SSL when connecting to remote DB
    ssl: process.env.DATABASE_URL ? 'require' : false,
    // Connection pool settings for Next.js server environment
    max: 10,
    idle_timeout: 20,
    connect_timeout: 30
  });

  return drizzle(client, { schema, logger: process.env.NODE_ENV === 'development' });
}

// Singleton pattern — reuse across hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __drizzle: ReturnType<typeof createDrizzleClient> | undefined;
}

export const db =
  process.env.NODE_ENV === 'production'
    ? createDrizzleClient()
    : (global.__drizzle ?? (global.__drizzle = createDrizzleClient()));

export type DrizzleClient = typeof db;
