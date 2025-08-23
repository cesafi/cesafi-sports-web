import { 
  Eye, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2 
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SchoolsManagementPage() {
  // Mock data - replace with actual data from your API
  const schools = [
    {
      id: 1,
      name: 'Cebu Eastern College',
      abbreviation: 'CEC',
      logo: '🔵', // Placeholder for actual logo
      createdAt: '8/14/2025'
    },
    {
      id: 2,
      name: 'Cebu Institute of Technology - University',
      abbreviation: 'CIT-U',
      logo: '🟠', // Placeholder for actual logo
      createdAt: '8/14/2025'
    },
    {
      id: 3,
      name: 'University of San Carlos',
      abbreviation: 'USC',
      logo: '🟢', // Placeholder for actual logo
      createdAt: '8/14/2025'
    },
    {
      id: 4,
      name: 'University of the Philippines Cebu',
      abbreviation: 'UPC',
      logo: '🟤', // Placeholder for actual logo
      createdAt: '8/14/2025'
    },
    {
      id: 5,
      name: 'University of the Visayas',
      abbreviation: 'UV',
      logo: '🟢', // Placeholder for actual logo
      createdAt: '8/14/2025'
    }
  ];

  return (
    <DashboardLayout userRole="admin" userRoleDisplay="Admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Schools Management</h1>
          <p className="text-muted-foreground">
            View and manage CESAFI affiliated schools and their respective teams.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search schools by name, or abbreviation"
              className="pl-10"
            />
          </div>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add School
          </Button>
        </div>

        {/* Schools Table */}
        <Card>
          <CardHeader>
            <CardTitle>Affiliated Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Table Headers */}
              <div className="grid grid-cols-3 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                <div>School Information</div>
                <div>Abbreviation</div>
                <div>Actions</div>
              </div>

              {/* Table Rows */}
              {schools.map((school) => (
                <div key={school.id} className="grid grid-cols-3 gap-4 px-4 py-3 items-center border-b last:border-b-0">
                  {/* School Information */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg">
                      {school.logo}
                    </div>
                    <div>
                      <p className="font-medium">{school.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Created at {school.createdAt}
                      </p>
                    </div>
                  </div>

                  {/* Abbreviation */}
                  <div>
                    <span className="font-mono text-lg font-bold text-primary">
                      {school.abbreviation}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows per page:</span>
                <select className="border rounded px-2 py-1">
                  <option>5</option>
                  <option>10</option>
                  <option>25</option>
                </select>
                <span>1-5 of 99</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm">{"<<"}</Button>
                <Button variant="outline" size="sm">{"<"}</Button>
                <Button variant="default" size="sm">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <span className="px-2">...</span>
                <Button variant="outline" size="sm">99</Button>
                <Button variant="outline" size="sm">{">"}</Button>
                <Button variant="outline" size="sm">{">>"}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
