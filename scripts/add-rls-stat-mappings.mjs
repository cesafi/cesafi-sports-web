import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require', max: 5 });

async function addRLS() {
  console.log('🔍 Connecting to database to apply RLS on sport_stat_mappings...');

  try {
    await sql`ALTER TABLE public.sport_stat_mappings ENABLE ROW LEVEL SECURITY;`;
    
    // Drop policies if they exist to avoid errors on rerun
    await sql`DROP POLICY IF EXISTS "Public can view sport stat mappings" ON public.sport_stat_mappings;`;
    await sql`DROP POLICY IF EXISTS "Admins and league operators can manage sport stat mappings" ON public.sport_stat_mappings;`;

    await sql`
      CREATE POLICY "Public can view sport stat mappings"
        ON public.sport_stat_mappings FOR SELECT
        TO anon, authenticated
        USING (true);
    `;

    await sql`
      CREATE POLICY "Admins and league operators can manage sport stat mappings"
        ON public.sport_stat_mappings FOR ALL
        TO authenticated
        USING (true);
    `;
    
    console.log('✅ Successfully applied RLS policies!');
  } catch (error) {
    console.error('❌ Error applying RLS:', error);
  } finally {
    await sql.end();
  }
}

addRLS();
