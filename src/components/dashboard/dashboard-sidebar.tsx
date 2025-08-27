'use client';

import {
  BarChart3,
  Building2,
  FileText,
  Grid3X3,
  Key,
  Trophy,
  Users,
  Volleyball,
  Calendar,
  Target,
  Shield,
  Group
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SeasonSwitcher } from '@/components/admin/season-switcher';
import { useSeason } from '@/components/contexts/season-provider';

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
  const { currentSeason } = useSeason();

  const getGeneralNavigationItems = (role: string): NavigationItem[] => {
    const baseItems: NavigationItem[] = [{ href: '/admin', label: 'Overview', icon: Grid3X3 }];

    switch (role) {
      case 'admin':
        return [
          ...baseItems,
          { href: '/admin/accounts', label: 'Accounts', icon: Key },
          { href: '/admin/schools', label: 'Schools', icon: Building2 },
          { href: '/admin/seasons', label: 'Seasons', icon: Trophy },
          { href: '/admin/sports', label: 'Sports', icon: Volleyball },
          { href: '/admin/articles', label: 'Articles', icon: FileText },
          { href: '/admin/departments', label: 'Departments', icon: Users }
        ];
      case 'head_writer':
        return [
          ...baseItems,
          { href: '/head-writer/articles', label: 'Articles', icon: FileText },
          { href: '/head-writer/writers', label: 'Writers', icon: Users }
        ];
      case 'writer':
        return [
          ...baseItems,
          { href: '/writer/articles', label: 'My Articles', icon: FileText },
          { href: '/writer/drafts', label: 'Drafts', icon: FileText }
        ];
      case 'league_operator':
        return [
          ...baseItems,
          { href: '/league-operator/schedules', label: 'Schedules', icon: BarChart3 },
          { href: '/league-operator/results', label: 'Results', icon: Trophy },
          { href: '/league-operator/standings', label: 'Standings', icon: BarChart3 }
        ];
      default:
        return baseItems;
    }
  };

  const getSeasonalNavigationItems = (): NavigationItem[] => {
    return [
      { href: '/admin/league-stage', label: 'League Stages', icon: Group },
      { href: '/admin/school-teams', label: 'School Teams', icon: Shield },
      { href: '/admin/volunteers', label: 'Volunteers', icon: Users },
      { href: '/admin/matches', label: 'Matches', icon: Target },
      { href: '/admin/games', label: 'Games', icon: Calendar },
      { href: '/admin/game-scores', label: 'Game Scores', icon: Trophy }
    ];
  };

  const generalItems = getGeneralNavigationItems(userRole);
  const seasonalItems = getSeasonalNavigationItems();

  return (
    <aside className="border-border bg-sidebar flex h-screen w-64 flex-col border-r">
      {/* Logo and Season Switcher */}
      <div className="border-border flex h-16 w-full items-center gap-3 border-b px-6">
        <div className="flex items-center">
          <Image
            src="/img/cesafi-logo.webp"
            alt="CESAFI Logo"
            width={64}
            height={64}
            className="rounded-lg"
          />
        </div>
        <SeasonSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 p-4">
        {/* General Category */}
        <div className="space-y-2">
          <h3 className="text-sidebar-foreground/70 text-xs font-semibold tracking-wider uppercase">
            General
          </h3>
          <div className="space-y-1">
            {generalItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-primary border-l-4'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground'
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Seasonal Category */}
        <div className="space-y-2">
          <h3 className="text-sidebar-foreground/70 text-xs font-semibold tracking-wider uppercase">
            {currentSeason ? `Season ${currentSeason.id}` : 'Season'}
          </h3>
          <div className="space-y-1">
            {seasonalItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-primary border-l-4'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground'
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-border border-t p-4">
        <div className="text-sidebar-foreground flex flex-col items-center justify-center space-y-1 text-xs">
          <p className="font-medium">Cebu Schools Athletics Foundation, Inc.</p>
          <p>© 2025</p>
        </div>
      </div>
    </aside>
  );
}
