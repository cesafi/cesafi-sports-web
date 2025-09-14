/**
 * Date formatting utilities for consistent date display across the application
 * Inspired by LoL Esports design patterns
 */

/**
 * Format date for header display (e.g., "SUNDAY Sep 7", "TODAY")
 */
export const formatDateForHeader = (date: Date): string => {
  const today = new Date();
  const isToday = isSameDay(date, today);
  
  if (isToday) {
    return 'TODAY';
  }
  
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  
  return `${dayName} ${month} ${day}`;
};

/**
 * Format date for group display (e.g., "Wednesday Sep 10", "Yesterday", "Today")
 */
export const formatDateForGroup = (dateString: string, isToday: boolean, isYesterday: boolean): string => {
  if (isToday) {
    return 'TODAY';
  }
  
  if (isYesterday) {
    return 'YESTERDAY';
  }
  
  // Convert string to Date object
  const date = new Date(dateString);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  
  return `${dayName} ${month} ${day}`;
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDay(date, today);
};

/**
 * Check if a date is yesterday
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: Date): boolean => {
  const now = new Date();
  return date < now;
};

/**
 * Format date for short display (e.g., "Sep 7")
 */
export const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format time for display (e.g., "2:30 PM")
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format full date for display (e.g., "Monday, January 15, 2024")
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
