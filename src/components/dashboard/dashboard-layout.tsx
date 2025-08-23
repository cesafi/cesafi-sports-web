'use client';

import { ReactNode } from 'react';
import DashboardHeader from './dashboard-header';
import DashboardSidebar from './dashboard-sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: 'admin' | 'head_writer' | 'writer' | 'league_operator';
  userRoleDisplay?: string;
  userName?: string;
}

export default function DashboardLayout({
  children,
  userRole = 'admin',
  userRoleDisplay,
  userName = 'Admin'
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar userRole={userRole} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader 
          userRole={userRoleDisplay || userRole} 
          userName={userName} 
        />
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
