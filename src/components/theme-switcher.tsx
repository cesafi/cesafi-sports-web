'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export default function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="p-0 text-muted-foreground hover:text-foreground transition-colors duration-200"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {/* The theme is unknown on the server, so both render and the theme class picks one */}
            <SunIcon className="hidden h-6 w-auto dark:block" />
            <MoonIcon className="h-6 w-auto dark:hidden" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{resolvedTheme === 'dark' ? 'Toggle Light Mode' : 'Toggle Dark Mode'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider >
  );
}
