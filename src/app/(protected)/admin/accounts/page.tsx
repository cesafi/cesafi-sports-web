'use client';

import { useState } from 'react';
import { 
  Eye, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2, 
  User,
  Key,
  AlertTriangle
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Account {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

export default function AccountsManagementPage() {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Mock data - replace with actual data from your API
  const accounts: Account[] = [
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

  const handleResetPassword = (account: Account) => {
    setSelectedAccount(account);
    setShowResetModal(true);
    setNewPassword('');
    setConfirmPassword('');
  };

  const confirmResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsResetting(true);
    
    try {
      // TODO: Implement actual password reset API call
      // await resetUserPassword(selectedAccount!.id, newPassword);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Password reset successfully for ${selectedAccount!.email}`);
      setShowResetModal(false);
      setSelectedAccount(null);
    } catch {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
  };

  return (
    <DashboardLayout userRole="admin" userRoleDisplay="Admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Accounts Management</h1>
          <p className="text-muted-foreground">
            View and manage various portal accounts. Passwords can only be reset by administrators.
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
              <div className="grid grid-cols-4 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                <div>Account Information</div>
                <div>Role</div>
                <div>Actions</div>
                <div>Password</div>
              </div>

              {/* Table Rows */}
              {accounts.map((account) => (
                <div key={account.id} className="grid grid-cols-4 gap-4 px-4 py-3 items-center border-b last:border-b-0">
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

                  {/* Password Reset */}
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleResetPassword(account)}
                      className="flex items-center gap-2"
                    >
                      <Key className="h-4 w-4" />
                      Reset Password
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

        {/* Password Reset Modal */}
        {showResetModal && selectedAccount && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <h3 className="text-lg font-semibold">Reset Password</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Resetting password for: <span className="font-medium text-foreground">{selectedAccount.email}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <Input
                    type="text"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={generateSecurePassword}
                    className="flex-1"
                  >
                    Generate Secure Password
                  </Button>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowResetModal(false)}
                    className="flex-1"
                    disabled={isResetting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmResetPassword}
                    className="flex-1"
                    disabled={isResetting || !newPassword || !confirmPassword}
                  >
                    {isResetting ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
