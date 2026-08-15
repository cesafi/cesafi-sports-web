import { notFound } from 'next/navigation';
import { getAllSports } from '@/actions/sports';
import { CategoriesTable } from '@/components/admin/sports/categories';

export default async function LeagueOperatorSportCategoriesPage({
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
        <h1 className="text-3xl font-bold tracking-tight">{sport.name} Categories</h1>
        <p className="text-muted-foreground">
          Manage the divisions and levels for {sport.name}.
        </p>
      </div>
      
      <CategoriesTable sportId={sport.id} />
    </div>
  );
}
