import { ScheduleMatch } from '@/lib/types/matches';
import { getSchoolLogo } from './utils';

// Helper function to create a ScheduleMatch from simplified data
function createScheduleMatch(data: {
  id: number;
  name: string;
  description: string;
  scheduled_at: string;
  start_at?: string | null;
  end_at?: string | null;
  venue: string;
  status: 'finished' | 'ongoing' | 'upcoming' | 'cancelled';
  best_of: number;
  sportName: string;
  sportLevel: 'college' | 'high_school';
  sportDivision: 'men' | 'women';
  stage: 'finals' | 'semifinals' | 'quarterfinals';
  participants: {
    teamName: string;
    schoolName: string;
    schoolAbbreviation: string;
    score: number | null;
  }[];
  displayTime: string;
  isToday: boolean;
  isPast: boolean;
  isUpcoming: boolean;
}): ScheduleMatch {
  const displayDate = new Date(data.scheduled_at).toISOString().split('T')[0];

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    scheduled_at: data.scheduled_at,
    start_at: data.start_at ?? null,
    end_at: data.end_at ?? null,
    venue: data.venue,
    status: data.status,
    best_of: data.best_of,
    stage_id: 1, // Mock stage ID
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sports_seasons_stages: {
      id: 1,
      competition_stage: (() => {
        if (data.stage === 'semifinals' || data.stage === 'quarterfinals') {
          return 'playoffs';
        }
        return data.stage;
      })(),
      season_id: 1,
      sport_category_id: 1,
      sports_categories: {
        id: 1,
        division: data.sportDivision,
        levels: data.sportLevel,
        sports: {
          id: 1,
          name: data.sportName
        }
      },
      seasons: {
        id: 1,
        start_at: new Date().toISOString(),
        end_at: new Date().toISOString()
      }
    },
    match_participants: data.participants.map((participant, index) => ({
      id: index + 1,
      match_id: data.id,
      team_id: `${participant.schoolAbbreviation.toLowerCase()}-${participant.teamName.toLowerCase().replace(/\s+/g, '-')}`,
      match_score: participant.score,
      schools_teams: {
        id: `${participant.schoolAbbreviation.toLowerCase()}-${participant.teamName.toLowerCase().replace(/\s+/g, '-')}`,
        name: participant.teamName,
        schools: {
          name: participant.schoolName,
          abbreviation: participant.schoolAbbreviation,
          logo_url: getSchoolLogo(participant.schoolAbbreviation)
        }
      }
    })),
    displayDate,
    displayTime: data.displayTime,
    isToday: data.isToday,
    isPast: data.isPast,
    isUpcoming: data.isUpcoming
  };
}

// Mock data that matches the database schema
export const mockScheduleMatches: ScheduleMatch[] = [
  // Past matches
  createScheduleMatch({
    id: 1,
    name: 'USC vs UC',
    description: 'Basketball Championship Finals',
    scheduled_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    start_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    end_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    venue: 'Cebu Coliseum',
    status: 'finished',
    best_of: 3,
    sportName: 'Basketball',
    sportLevel: 'college',
    sportDivision: 'men',
    stage: 'finals',
    participants: [
      {
        teamName: 'USC Warriors',
        schoolName: 'University of San Carlos',
        schoolAbbreviation: 'USC',
        score: 2
      },
      {
        teamName: 'UC Webmasters',
        schoolName: 'University of Cebu',
        schoolAbbreviation: 'UC',
        score: 1
      }
    ],
    displayTime: '2:00 PM',
    isToday: false,
    isPast: true,
    isUpcoming: false
  }),

  createScheduleMatch({
    id: 2,
    name: 'USJ-R vs UV',
    description: 'Volleyball Semifinals',
    scheduled_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    start_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    end_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
    venue: 'USC Gymnasium',
    status: 'finished',
    best_of: 5,
    sportName: 'Volleyball',
    sportLevel: 'college',
    sportDivision: 'women',
    stage: 'semifinals',
    participants: [
      {
        teamName: 'USJ-R Jaguars',
        schoolName: 'University of San Jose - Recoletos',
        schoolAbbreviation: 'USJ-R',
        score: 3
      },
      {
        teamName: 'UV Green Lancers',
        schoolName: 'University of the Visayas',
        schoolAbbreviation: 'UV',
        score: 2
      }
    ],
    displayTime: '4:00 PM',
    isToday: false,
    isPast: true,
    isUpcoming: false
  }),

  // Today's matches
  createScheduleMatch({
    id: 3,
    name: 'USC vs UC',
    description: 'Basketball Championship Finals',
    scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    venue: 'Cebu Coliseum',
    status: 'upcoming',
    best_of: 3,
    sportName: 'Basketball',
    sportLevel: 'college',
    sportDivision: 'men',
    stage: 'finals',
    participants: [
      {
        teamName: 'USC Warriors',
        schoolName: 'University of San Carlos',
        schoolAbbreviation: 'USC',
        score: null
      },
      {
        teamName: 'UC Webmasters',
        schoolName: 'University of Cebu',
        schoolAbbreviation: 'UC',
        score: null
      }
    ],
    displayTime: '2:00 PM',
    isToday: true,
    isPast: false,
    isUpcoming: true
  }),

  createScheduleMatch({
    id: 4,
    name: 'USJ-R vs UV',
    description: 'Volleyball Semifinals',
    scheduled_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    venue: 'USC Gymnasium',
    status: 'upcoming',
    best_of: 5,
    sportName: 'Volleyball',
    sportLevel: 'college',
    sportDivision: 'women',
    stage: 'semifinals',
    participants: [
      {
        teamName: 'USJ-R Jaguars',
        schoolName: 'University of San Jose - Recoletos',
        schoolAbbreviation: 'USJ-R',
        score: null
      },
      {
        teamName: 'UV Green Lancers',
        schoolName: 'University of the Visayas',
        schoolAbbreviation: 'UV',
        score: null
      }
    ],
    displayTime: '4:00 PM',
    isToday: true,
    isPast: false,
    isUpcoming: true
  }),

  // Future matches
  createScheduleMatch({
    id: 5,
    name: 'USC vs USJ-R',
    description: 'Basketball Championship Finals',
    scheduled_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    venue: 'Cebu Coliseum',
    status: 'upcoming',
    best_of: 5,
    sportName: 'Basketball',
    sportLevel: 'college',
    sportDivision: 'men',
    stage: 'finals',
    participants: [
      {
        teamName: 'USC Warriors',
        schoolName: 'University of San Carlos',
        schoolAbbreviation: 'USC',
        score: null
      },
      {
        teamName: 'USJ-R Jaguars',
        schoolName: 'University of San Jose - Recoletos',
        schoolAbbreviation: 'USJ-R',
        score: null
      }
    ],
    displayTime: '2:00 PM',
    isToday: false,
    isPast: false,
    isUpcoming: true
  }),

  createScheduleMatch({
    id: 6,
    name: 'UC vs UV',
    description: 'Volleyball Championship Finals',
    scheduled_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // Tomorrow + 4 hours
    venue: 'USC Gymnasium',
    status: 'upcoming',
    best_of: 5,
    sportName: 'Volleyball',
    sportLevel: 'college',
    sportDivision: 'women',
    stage: 'finals',
    participants: [
      {
        teamName: 'UC Webmasters',
        schoolName: 'University of Cebu',
        schoolAbbreviation: 'UC',
        score: null
      },
      {
        teamName: 'UV Green Lancers',
        schoolName: 'University of the Visayas',
        schoolAbbreviation: 'UV',
        score: null
      }
    ],
    displayTime: '6:00 PM',
    isToday: false,
    isPast: false,
    isUpcoming: true
  })
];
