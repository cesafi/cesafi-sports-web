import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1 });

async function querySports() {
  console.log('🔍 Querying sports table...');
  const sports = await sql`SELECT * FROM sports ORDER BY name ASC;`;
  console.log(sports);
  await sql.end();
}

querySports().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
