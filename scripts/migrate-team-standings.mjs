import { config } from 'dotenv';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

// Prefer .env.local (Next.js convention); fall back to .env without overriding.
config({ path: '.env.local' });
config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1 });

async function migrate() {
  console.log('🔍 Connecting to database for team_standings migration...');
  const migrationPath = join('supabase', 'migrations', '20261022000000_add_team_standings.sql');
  const migrationSql = readFileSync(migrationPath, 'utf8');

  console.log('🚀 Running migration...');
  await sql.unsafe(migrationSql);

  const [{ t }] = await sql`SELECT to_regclass('public.team_standings') AS t`;
  console.log(`✅ Migration complete! Table: ${t}`);
  await sql.end();
}

migrate().catch(async (err) => {
  console.error('❌ Error during migration:', err);
  await sql.end();
  process.exit(1);
});
