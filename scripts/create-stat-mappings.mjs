import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require', max: 5 });

async function createTable() {
  console.log('🔍 Connecting to database to create sport_stat_mappings...');

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS sport_stat_mappings (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        sport_id INTEGER NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
        stat_column VARCHAR(20) NOT NULL,
        label VARCHAR(50) NOT NULL
      );
    `;
    console.log('✅ Successfully created sport_stat_mappings table!');
  } catch (error) {
    console.error('❌ Error creating table:', error);
  } finally {
    await sql.end();
  }
}

createTable();
