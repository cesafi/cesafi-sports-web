'use client';

import { ChevronDown, User, Settings, LogOut, Building2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ThemeSwitcher from '../theme-switcher';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { logoutAction } from '@/actions/auth';

interface DashboardHeaderProps {
  userRole?: string;
  userName?: string;
}

export default function DashboardHeader({ 
  userRole = 'Admin', 
  userName = 'Admin' 
}: DashboardHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logoutAction();
      toast.success('Signed out successfully');
      router.push('/login');
    } catch {
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      {/* Left side - Logo and Brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Image 
            src="/img/cesafi-logo.webp" 
            alt="CESAFI Logo" 
            width={40} 
            height={40}
            className="rounded-lg"
          />
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-foreground">CESAFI</h1>
            <p className="text-xs text-muted-foreground">Management Portal</p>
          </div>
        </div>
      </div>

      {/* Right side - Theme switcher and User menu */}
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-3 px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium leading-none">{userName}</span>
                <span className="text-xs leading-none text-muted-foreground">{userRole}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-64">
            {/* User Info Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-medium">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">{userRole}</p>
                <p className="text-xs leading-none text-muted-foreground">cesafi.webops@gmail.com</p>
              </div>
            </div>
            
            <DropdownMenuSeparator />
            
            {/* Menu Items */}
            <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent">
              <Building2 className="h-4 w-4" />
              <span>Organization</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Sign Out */}
            <DropdownMenuItem 
              className="flex items-center gap-3 px-4 py-3 cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
