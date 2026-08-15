import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1 });

async function fixSequence() {
  console.log('🔍 Connecting to database to fix sequence...');
  
  // Fix the sequence for the sports table
  await sql.unsafe(`SELECT setval('sports_id_seq', COALESCE((SELECT MAX(id) FROM sports), 1));`);
  
  // Also check sports_categories just in case
  await sql.unsafe(`SELECT setval('sports_categories_id_seq', COALESCE((SELECT MAX(id) FROM sports_categories), 1));`);

  console.log('✅ Sequence fixed!');
  await sql.end();
}

fixSequence().catch(err => {
  console.error('❌ Error during fix sequence:', err);
  process.exit(1);
});
