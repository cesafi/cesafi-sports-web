import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard';
import { getCurrentUserAction } from '@/actions/auth';
import { UserRole } from '@/lib/types/auth';
import { getRoleDisplayName } from '@/lib/utils/roles';

interface HeadWriterLayoutProps {
  children: React.ReactNode;
}

export default async function HeadWriterLayout({ children }: HeadWriterLayoutProps) {
  // Fetch user data server-side
  const userResult = await getCurrentUserAction();

  if (!userResult.success || !userResult.data) {
    redirect('/login');
  }

  const user = userResult.data;

  // Check if user has head_writer role
  if (user.userRole !== 'head_writer') {
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
