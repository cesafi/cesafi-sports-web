'use client';

import {
  BarChart3,
  Building2,
  FileText,
  Grid3X3,
  Key,
  Trophy,
  Users,
  Volleyball
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardSidebarProps {
  userRole?: 'admin' | 'head_writer' | 'writer' | 'league_operator';
}

export default function DashboardSidebar({ userRole = 'admin' }: DashboardSidebarProps) {
  const pathname = usePathname();

  // Define navigation items based on user role
  const getNavigationItems = (role: string): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      { href: '/admin', label: 'Overview', icon: Grid3X3 },
    ];

    switch (role) {
      case 'admin':
        return [
          ...baseItems,
          { href: '/admin/accounts', label: 'Accounts', icon: Key },
          { href: '/admin/schools', label: 'Schools', icon: Building2 },
          { href: '/admin/seasons', label: 'Seasons', icon: Trophy },
          { href: '/admin/sports', label: 'Sports', icon: Volleyball },
          { href: '/admin/articles', label: 'Articles', icon: FileText },
          { href: '/admin/volunteers', label: 'Volunteers', icon: Users },
        ];
      case 'head_writer':
        return [
          ...baseItems,
          { href: '/head-writer/articles', label: 'Articles', icon: FileText },
          { href: '/head-writer/writers', label: 'Writers', icon: Users },
        ];
      case 'writer':
        return [
          ...baseItems,
          { href: '/writer/articles', label: 'My Articles', icon: FileText },
          { href: '/writer/drafts', label: 'Drafts', icon: FileText },
        ];
      case 'league_operator':
        return [
          ...baseItems,
          { href: '/league-operator/schedules', label: 'Schedules', icon: BarChart3 },
          { href: '/league-operator/results', label: 'Results', icon: Trophy },
          { href: '/league-operator/standings', label: 'Standings', icon: BarChart3 },
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems(userRole);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-border">
        <div className="flex items-center gap-3">
          <Image 
            src="/img/cesafi-logo.webp" 
            alt="CESAFI Logo" 
            width={40} 
            height={40}
            className="rounded-lg"
          />
          <span className="text-xl font-bold text-sidebar-foreground">CESAFI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5',
                isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground'
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="text-xs text-sidebar-foreground space-y-1">
          <p className="font-medium">Cebu Schools Athletics Foundation, Inc.</p>
          <p>© 2025</p>
        </div>
      </div>
    </aside>
  );
}
