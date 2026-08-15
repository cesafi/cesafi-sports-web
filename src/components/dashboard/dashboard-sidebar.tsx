'use client';

import { useState } from 'react';
import {
  Building2,
  FileText,
  Grid3X3,
  Key,
  Trophy,
  Users,
  Target,
  Shield,
  Group,
  Home,
  HelpCircle,
  Calendar,
  Image as ImageIcon,
  HandHeart,
  ExternalLink,
  BarChart3,
  Volleyball,
  ChevronDown,
  ChevronRight,
  List
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SeasonSwitcher } from '@/components/admin/season-switcher';
import { useSeason } from '@/components/contexts/season-provider';
import { useAllSports } from '@/hooks/use-sports';
import { SportIcon } from '@/components/ui/sport-icon';

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
  const [expandedSports, setExpandedSports] = useState<number[]>([]);
  
  // Always call the hook, but only use the result when needed
  const seasonContext = useSeason();
  const needsSeasonContext = userRole === 'admin' || userRole === 'league_operator';
  const currentSeason = needsSeasonContext ? seasonContext?.currentSeason : null;

  // Fetch sports for the SPORTS category
  const { data: sports = [] } = useAllSports();

  const toggleSportExpanded = (sportId: number) => {
    setExpandedSports(prev =>
      prev.includes(sportId)
        ? prev.filter(id => id !== sportId)
        : [...prev, sportId]
    );
  };

  const getGeneralNavigationItems = (role: string): NavigationItem[] => {
    switch (role) {
      case 'admin':
        return [
          { href: '/admin', label: 'Overview', icon: Grid3X3 },
          { href: '/admin/accounts', label: 'Accounts', icon: Key },
          { href: '/admin/schools', label: 'Schools', icon: Building2 },
          { href: '/admin/seasons', label: 'Seasons', icon: Trophy },
          { href: '/admin/sports', label: 'Sports', icon: Volleyball },
          { href: '/admin/sponsors', label: 'Sponsors', icon: HandHeart },
          { href: '/admin/articles', label: 'Articles', icon: FileText },
          { href: '/admin/departments', label: 'Departments', icon: Users },
          { href: '/admin/production', label: 'Production', icon: BarChart3 }
        ];
      case 'head_writer':
        return [
          { href: '/head-writer', label: 'Overview', icon: Grid3X3 },
          { href: '/head-writer/articles', label: 'Articles', icon: FileText },
          { href: '/head-writer/production', label: 'Production', icon: BarChart3 }
        ];
      case 'writer':
        return [
          { href: '/writer', label: 'Overview', icon: Grid3X3 },
          { href: '/writer/articles', label: 'My Articles', icon: FileText }
        ];
      case 'league_operator':
        return [
          { href: '/league-operator', label: 'Overview', icon: Grid3X3 },
          { href: '/league-operator/matches', label: 'Matches', icon: Target },
          { href: '/league-operator/production', label: 'Production', icon: BarChart3 }
        ];
      default:
        return [{ href: '/admin', label: 'Overview', icon: Grid3X3 }];
    }
  };

  const getLandingPageNavigationItems = (role: string): NavigationItem[] => {
    const basePath = role === 'head_writer' ? '/head-writer' : '/admin';
    
    if (role === 'head_writer') {
      // Head writers can only manage Timeline and FAQ
      return [
        { href: `${basePath}/timeline`, label: 'Timeline', icon: Calendar },
        { href: `${basePath}/faq`, label: 'FAQ', icon: HelpCircle },
      ];
    }
    
    // Admins get full access to all landing page content
    return [
      { href: `${basePath}/timeline`, label: 'Timeline', icon: Calendar },
      { href: `${basePath}/faq`, label: 'FAQ', icon: HelpCircle },
      { href: `${basePath}/hero-section`, label: 'Hero Section', icon: Home },
      { href: `${basePath}/photo-gallery`, label: 'Photo Gallery', icon: ImageIcon },
    ];
  };

  const getSeasonalNavigationItems = (role: string): NavigationItem[] => {
    switch (role) {
      case 'admin':
        return [
          { href: '/admin/league-stage', label: 'League Stages', icon: Group },
          { href: '/admin/school-teams', label: 'School Teams', icon: Shield },
          { href: '/admin/volunteers', label: 'Volunteers', icon: Users },
          { href: '/admin/matches', label: 'Matches', icon: Target },
        ];
      default:
        // Other roles (league_operator, head_writer, writer) don't get seasonal items
        // League operators already have Matches in their General section
        return [];
    }
  };

  const generalItems = getGeneralNavigationItems(userRole);
  const landingPageItems = getLandingPageNavigationItems(userRole);
  const seasonalItems = getSeasonalNavigationItems(userRole);

  return (
    <aside className="border-border bg-sidebar flex h-screen w-64 flex-col border-r overflow-hidden">
      {/* Logo and Season Switcher */}
      <div className="border-border flex h-16 w-full items-center gap-3 border-b px-6 flex-shrink-0">
        <div className="flex items-center">
          <Image
            src="/img/cesafi-logo.webp"
            alt="CESAFI Logo"
            width={64}
            height={64}
            className="rounded-lg"
          />
        </div>
        {needsSeasonContext && <SeasonSwitcher />}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-6 p-4">
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
                      ? 'bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary border-l-4'
                      : 'text-sidebar-foreground hover:bg-sidebar-primary/5 hover:text-sidebar-foreground'
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

        {/* SPORTS Category - Only show for admin and league_operator */}
        {(userRole === 'admin' || userRole === 'league_operator') && sports.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sidebar-foreground/70 text-xs font-semibold tracking-wider uppercase">
              Sports
            </h3>
            <div className="space-y-1">
              {sports.map((sport) => {
                const isExpanded = expandedSports.includes(sport.id);
                const slug = sport.name.toLowerCase().replace(/\s+/g, '-');
                const basePath = userRole === 'league_operator' ? '/league-operator' : '/admin';
                const categoriesHref = `${basePath}/sports/${slug}/categories`;
                const statsHref = `${basePath}/sports/${slug}/stats`;
                
                const isCategoriesActive = pathname === categoriesHref;
                const isStatsActive = pathname === statsHref;
                
                const isAnyChildActive = isCategoriesActive || isStatsActive;

                return (
                  <div key={sport.id}>
                    {/* Sport Header - Expandable */}
                    <button
                      onClick={() => toggleSportExpanded(sport.id)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isAnyChildActive
                          ? 'bg-sidebar-primary/10 text-sidebar-primary'
                          : 'text-sidebar-foreground hover:bg-sidebar-primary/5 hover:text-sidebar-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {(sport as any).icon_url ? (
                          <Image
                            src={(sport as any).icon_url}
                            alt={sport.name}
                            width={20}
                            height={20}
                            className="h-5 w-5 rounded object-cover"
                          />
                        ) : (
                          <SportIcon sportName={sport.name} className="h-5 w-5" iconClassName="text-inherit" />
                        )}
                        <span className="truncate">{sport.name}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    {/* Sub-menu Items */}
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                        <Link
                          href={categoriesHref}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                            isCategoriesActive
                              ? 'bg-sidebar-primary/10 text-sidebar-primary font-medium'
                              : 'text-sidebar-foreground hover:bg-sidebar-primary/5 hover:text-sidebar-foreground'
                          )}
                        >
                          <List className="h-4 w-4" />
                          Categories
                        </Link>
                        <Link
                          href={statsHref}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                            isStatsActive
                              ? 'bg-sidebar-primary/10 text-sidebar-primary font-medium'
                              : 'text-sidebar-foreground hover:bg-sidebar-primary/5 hover:text-sidebar-foreground'
                          )}
                        >
                          <BarChart3 className="h-4 w-4" />
                          Statistics
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Landing Page Content Category - Only show for admin and head_writer */}
        {(userRole === 'admin' || userRole === 'head_writer') && (
          <div className="space-y-2">
            <h3 className="text-sidebar-foreground/70 text-xs font-semibold tracking-wider uppercase">
              Landing Page Content
            </h3>
            <div className="space-y-1">
              {landingPageItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary border-l-4'
                        : 'text-sidebar-foreground hover:bg-sidebar-primary/5 hover:text-sidebar-foreground'
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
        )}

        {/* Seasonal Category - Only show for roles that need season context */}
        {needsSeasonContext && seasonalItems.length > 0 && (
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
                        ? 'bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary border-l-4'
                        : 'text-sidebar-foreground hover:bg-sidebar-primary/5 hover:text-sidebar-foreground'
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
        )}
      </nav>

      {/* View Website Section */}
      <div className="border-border border-t p-4 flex-shrink-0">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-primary/5 hover:text-sidebar-foreground transition-colors"
        >
          <ExternalLink className="h-5 w-5" />
          <span>View Website</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="border-border border-t p-4 flex-shrink-0">
        <div className="text-sidebar-foreground flex flex-col items-center justify-center space-y-1 text-xs">
          <p className="font-medium text-center">Cebu Schools Athletics Foundation, Inc.</p>
          <p>© 2025. All rights reserved.</p>
        </div>
      </div>
    </aside>
  );
}
