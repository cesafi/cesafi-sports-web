import { 
  Eye, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2, 
  User 
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountsManagementPage() {
  // Mock data - replace with actual data from your API
  const accounts = [
    {
      id: 1,
      email: 'cesafi.website@gmail.com',
      role: 'Admin',
      createdAt: '8/14/2025'
    },
    {
      id: 2,
      email: 'writer1@cesafi.com',
      role: 'Writer',
      createdAt: '8/14/2025'
    },
    {
      id: 3,
      email: 'headwriter@cesafi.com',
      role: 'Head Writer',
      createdAt: '8/14/2025'
    },
    {
      id: 4,
      email: 'leagueop@cesafi.com',
      role: 'League Operator',
      createdAt: '8/14/2025'
    },
    {
      id: 5,
      email: 'admin2@cesafi.com',
      role: 'Admin',
      createdAt: '8/14/2025'
    }
  ];

  return (
    <DashboardLayout userRole="admin" userRoleDisplay="Admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Accounts Management</h1>
          <p className="text-muted-foreground">
            View and manage various portal accounts.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search accounts by name, or email."
              className="pl-10"
            />
          </div>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>

        {/* Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Portal Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Table Headers */}
              <div className="grid grid-cols-3 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                <div>Account Information</div>
                <div>Role</div>
                <div>Actions</div>
              </div>

              {/* Table Rows */}
              {accounts.map((account) => (
                <div key={account.id} className="grid grid-cols-3 gap-4 px-4 py-3 items-center border-b last:border-b-0">
                  {/* Account Information */}
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{account.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Created at {account.createdAt}
                      </p>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                      {account.role}
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
