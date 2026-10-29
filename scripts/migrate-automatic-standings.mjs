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

const readMigration = (name) => readFileSync(join('supabase', 'migrations', name), 'utf8');

async function migrate() {
  console.log('🔍 Connecting to database for automatic standings migration...');
  const schema = readMigration('20261029000000_add_automatic_standings.sql');
  const seed = readMigration('20261029000100_seed_season_26_standings.sql');

  console.log('🚀 Running migrations in one transaction...');
  await sql.begin(async (tx) => {
    await tx.unsafe(schema);
    await tx.unsafe(seed);
  });

  const perCategory = await sql`
    SELECT st.sport_category_id, count(*)::int AS teams, sum(ts.point_diff)::int AS point_diff_sum
    FROM public.team_standings ts
    JOIN public.schools_teams st ON st.id = ts.team_id
    WHERE st.season_id = 26 AND st.is_active
    GROUP BY st.sport_category_id
    ORDER BY st.sport_category_id`;
  console.table(perCategory);

  const cutoffs = await sql`SELECT * FROM public.standings_cutoffs ORDER BY season_id, sport_category_id`;
  console.table(cutoffs.map((c) => ({ ...c, counted_through: String(c.counted_through) })));

  console.log('✅ Migration complete!');
  await sql.end();
}

migrate().catch(async (err) => {
  console.error('❌ Error during migration:', err);
  await sql.end();
  process.exit(1);
});
