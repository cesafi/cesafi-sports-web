import { moderniz } from '@/lib/fonts';
import SchoolsGrid from '@/components/schools/schools-grid';
import { getActiveSchools } from '@/actions/schools';
import { School } from '@/lib/types/schools';

export default async function SchoolsPage() {
  // Fetch active schools server-side
  const schoolsResult = await getActiveSchools();
  const schools: School[] = schoolsResult.success && schoolsResult.data ? schoolsResult.data : [];

  return (
    <>
      {/* Hero Section - moved directly into page */}
      <section className="pb-12 pt-24 sm:pb-16 sm:pt-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 sm:space-y-6">
            <h1 className={`${moderniz.className} text-3xl font-bold text-foreground sm:text-4xl md:text-5xl`}>
              Member Schools
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto sm:text-lg">
              Discover the educational institutions that make up the Cebu Schools Athletic Foundation, Inc.
            </p>
          </div>
        </div>
      </section>

      {/* Schools Grid with initial data */}
      <SchoolsGrid initialSchools={schools} />
    </>
  );
}
