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
  console.log('🔍 Connecting to database for article view tracking migration...');
  const migration = readFileSync(
    join('supabase', 'migrations', '20261102000000_add_track_article_view.sql'),
    'utf8'
  );

  console.log('🚀 Running migration in one transaction...');
  await sql.begin(async (tx) => {
    await tx.unsafe(migration);
  });

  const [{ fn }] = await sql`SELECT to_regprocedure('public.track_article_view(uuid, uuid)')::text AS fn`;
  console.log('Function:', fn);

  console.log('✅ Migration complete!');
  await sql.end();
}

migrate().catch(async (err) => {
  console.error('❌ Error during migration:', err);
  await sql.end();
  process.exit(1);
});
