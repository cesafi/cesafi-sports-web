import { TimelineTable } from '@/components/admin/timeline/timeline-table';
import { getPaginatedTimeline } from '@/actions/timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Star, TrendingUp } from 'lucide-react';

export default async function AdminTimelinePage() {
  // Fetch initial timeline data
  const timelineResult = await getPaginatedTimeline({
    page: 1,
    pageSize: 10,
    sortBy: 'year',
    sortOrder: 'asc'
  });

  const timelineData = timelineResult.success && timelineResult.data ? timelineResult.data : null;

  return (
    <div className="w-full space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timelineData?.totalCount || 0}</div>
            <p className="text-muted-foreground text-xs">Timeline events created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highlight Events</CardTitle>
            <Star className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timelineData?.data.filter((event) => event.is_highlight).length || 0}
            </div>
            <p className="text-muted-foreground text-xs">Featured timeline events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timelineData?.data.filter((event) => {
                const createdDate = new Date(event.created_at);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return createdDate > thirtyDaysAgo;
              }).length || 0}
            </div>
            <p className="text-muted-foreground text-xs">Events added in last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Table */}
      <TimelineTable
        initialData={timelineData || undefined}
        initialPagination={{
          page: 1,
          pageSize: 10,
          sortBy: 'year',
          sortOrder: 'asc'
        }}
      />
    </div>
  );
}
