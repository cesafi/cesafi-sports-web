import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard';
import { getCurrentUserAction } from '@/actions/auth';
import { UserRole } from '@/lib/types/auth';
import { getRoleDisplayName } from '@/lib/utils/roles';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Fetch user data server-side
  const userResult = await getCurrentUserAction();
  
  if (!userResult.success || !userResult.data) {
    redirect('/login');
  }

  const user = userResult.data;
  
  // Check if user has admin role
  if (user.userRole !== 'admin') {
    redirect('/login');
  }

  return (
    <DashboardLayout 
      userRole={user.userRole as UserRole} 
      userRoleDisplay={getRoleDisplayName(user.userRole as UserRole)}
      userName={user.userName}
      userEmail={user.email || ''}
    >
      {children}
    </DashboardLayout>
  );
}
