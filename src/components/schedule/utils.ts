import { ScheduleMatch } from '@/lib/types/matches';

export interface ScheduleDateGroup {
  date: string;
  displayDate: string;
  isToday: boolean;
  isPast: boolean;
  matches: ScheduleMatch[];
}

// School logo mapping - using CESAFI logo for all schools for now
export const getSchoolLogo = (_schoolAbbreviation: string): string => {
  // For now, all schools use the CESAFI logo
  // Later this can be replaced with actual school logos from Cloudinary
  return '/img/cesafi-logo.webp';
};

// Date formatting utilities
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isPast = (date: Date): boolean => {
  const now = new Date();
  return date < now;
};

export const isUpcoming = (date: Date): boolean => {
  const now = new Date();
  return date > now;
};

// Group matches by date
export const groupMatchesByDate = (matches: ScheduleMatch[]): ScheduleDateGroup[] => {
  const grouped = matches.reduce(
    (acc, match) => {
      const date = match.displayDate;
      if (!acc[date]) {
        acc[date] = {
          date: match.displayDate,
          displayDate: formatDate(new Date(match.scheduled_at ?? new Date())),
          isToday: match.isToday,
          isPast: match.isPast,
          matches: []
        };
      }
      acc[date].matches.push(match);
      return acc;
    },
    {} as Record<string, ScheduleDateGroup>
  );

  return Object.values(grouped).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
};

// Determine winner for completed matches
export const determineWinner = (
  participants: Array<{
    id: number;
    teamName: string;
    schoolName: string;
    schoolAbbreviation: string;
    schoolLogo: string | null;
    score: number | null;
    isWinner?: boolean;
  }>
) => {
  if (participants.length !== 2) return participants;

  const [team1, team2] = participants;

  if (team1.score === null || team2.score === null) {
    return participants; // Match not completed
  }

  if (team1.score > team2.score) {
    return [
      { ...team1, isWinner: true },
      { ...team2, isWinner: false }
    ];
  } else if (team2.score > team1.score) {
    return [
      { ...team1, isWinner: false },
      { ...team2, isWinner: true }
    ];
  }

  return participants; // Tie
};
