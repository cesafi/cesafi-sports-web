import { notFound } from 'next/navigation';
import { getAllSports } from '@/actions/sports';
import { StatsMappingForm } from '@/components/admin/sports/stats';

export default async function LeagueOperatorSportStatsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Fetch all sports to find the matching sport by slug
  const sportsResult = await getAllSports();
  
  if (!sportsResult.success || !sportsResult.data) {
    return <div>Failed to load sports data.</div>;
  }

  // Find the sport that matches the slug
  const sport = sportsResult.data.find(
    s => s.name.toLowerCase().replace(/\s+/g, '-') === slug
  );

  if (!sport) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{sport.name} Statistics</h1>
        <p className="text-muted-foreground">
          Configure the statistics mapping and view stats for {sport.name}.
        </p>
      </div>
      
      <StatsMappingForm sportId={sport.id} />
    </div>
  );
}
