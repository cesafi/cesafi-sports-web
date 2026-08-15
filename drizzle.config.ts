import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env.local (Next.js convention) before drizzle-kit reads env vars
config({ path: '.env.local' });

export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  // Introspect only the public schema
  schemaFilter: ['public'],
  verbose: true,
  strict: true
});
