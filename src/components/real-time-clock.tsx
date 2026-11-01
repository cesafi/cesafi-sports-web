'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getBrowserTimezone } from '@/lib/utils/utc-time';
import { cn } from '@/lib/utils';

interface RealTimeClockProps {
  className?: string;
  showIcon?: boolean;
  showTimezone?: boolean;
  showDate?: boolean;
  format?: '12h' | '24h';
  size?: 'sm' | 'md' | 'lg';
}

export function RealTimeClock({
  className,
  showIcon = true,
  showTimezone = false,
  showDate = false,
  format = '12h',
  size = 'md'
}: RealTimeClockProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [timezone, setTimezone] = useState<string>('');

  useEffect(() => {
    // Set time and timezone on client side to avoid hydration mismatch
    setTimezone(getBrowserTimezone());
    setCurrentTime(new Date());

    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: format === '12h'
    };

    if (showDate) {
      options.weekday = 'short';
      options.month = 'short';
      options.day = 'numeric';
    }

    return date.toLocaleString('en-US', options);
  };

  // A fixed string, not a formatted date, so the server and client always agree.
  // It has the same shape as the formatted time, so it reserves the time's width.
  const reservedTime = `${showDate ? 'Mon, Jan 01, ' : ''}00:00:00${format === '12h' ? ' AM' : ''}`;

  const timeSlot = (
    <span
      className={cn('font-mono font-medium', !currentTime && 'invisible')}
      aria-hidden={currentTime ? undefined : true}
    >
      {currentTime ? formatTime(currentTime) : reservedTime}
    </span>
  );

  const getTimezoneAbbreviation = (timezone: string) => {
    try {
      const date = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
      });
      
      const parts = formatter.formatToParts(date);
      const timeZonePart = parts.find(part => part.type === 'timeZoneName');
      return timeZonePart?.value || timezone.split('/')[1]?.replace('_', ' ') || 'Local';
    } catch {
      return 'Local';
    }
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={cn(
      'flex items-center gap-2 text-muted-foreground',
      sizeClasses[size],
      className
    )}>
      {showIcon && (
        <Clock className={cn('flex-shrink-0', iconSizes[size])} />
      )}
      {showTimezone && timezone ? (
        <div className="flex flex-col">
          {timeSlot}
          <span className="text-xs opacity-75">
            {getTimezoneAbbreviation(timezone)}
          </span>
        </div>
      ) : (
        timeSlot
      )}
    </div>
  );
}

// Compact version for tight spaces
export function CompactClock({ className }: { className?: string }) {
  return (
    <RealTimeClock
      className={className}
      showIcon={false}
      showTimezone={false}
      showDate={false}
      size="sm"
    />
  );
}

// Full featured version for dashboard headers
export function DashboardClock({ className }: { className?: string }) {
  return (
    <RealTimeClock
      className={className}
      showIcon={true}
      showTimezone={false}
      showDate={true}
      size="md"
    />
  );
}