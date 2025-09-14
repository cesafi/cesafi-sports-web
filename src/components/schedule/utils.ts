import { ScheduleMatch } from '@/lib/types/matches';
import { isYesterday, formatDate } from '@/lib/utils/date-formatting';

export interface ScheduleDateGroup {
  date: string;
  displayDate: string;
  isToday: boolean;
  isYesterday: boolean;
  isPast: boolean;
  matches: ScheduleMatch[];
}

// School logo mapping - using CESAFI logo for all schools for now
export const getSchoolLogo = (_schoolAbbreviation: string): string => {
  // For now, all schools use the CESAFI logo
  // Later this can be replaced with actual school logos from Cloudinary
  return '/img/cesafi-logo.webp';
};

// Date formatting utilities are now in @/lib/utils/date-formatting

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
        const matchDate = new Date(match.scheduled_at ?? new Date());
        acc[date] = {
          date: match.displayDate,
          displayDate: formatDate(matchDate),
          isToday: match.isToday,
          isYesterday: isYesterday(matchDate),
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
