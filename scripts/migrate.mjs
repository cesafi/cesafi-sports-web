import { config } from 'dotenv';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1 });

async function migrate() {
  console.log('🔍 Connecting to database for migration...');
  const migrationPath = join('supabase', 'migrations', '20260801000000_add_sports_features.sql');
  const migrationSql = readFileSync(migrationPath, 'utf8');

  console.log('🚀 Running migration...');
  await sql.unsafe(migrationSql);

  console.log('✅ Migration complete!');
  await sql.end();
}

migrate().catch(err => {
  console.error('❌ Error during migration:', err);
  process.exit(1);
});
