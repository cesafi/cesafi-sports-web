/**
 * Mock Data for CESAFI Standings Development
 *
 * This file provides realistic dummy data for testing the standings page
 * without modifying the actual Supabase database.
 */

import {
  StandingsResponse,
  StandingsNavigation,
  GroupStageStandings,
  BracketStandings,
  PlayinsStandings
} from '@/lib/types/standings';

// Enable mock data in development
export const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

// Mock seasons data
export const mockSeasons = [
  {
    id: 1,
    name: '2023-2024',
    start_at: '2023-08-01',
    end_at: '2024-07-31'
  },
  {
    id: 2,
    name: '2024-2025',
    start_at: '2024-08-01',
    end_at: '2025-07-31'
  }
];

// Mock sports data
export const mockSports = [
  { id: 1, name: 'Basketball' },
  { id: 2, name: 'Volleyball' },
  { id: 3, name: 'Football' },
  { id: 4, name: 'Badminton' },
  { id: 5, name: 'Table Tennis' }
];

// Mock categories data
export const mockCategories = [
  {
    id: 1,
    division: 'men' as const,
    levels: 'college' as const,
    display_name: "Men's College"
  },
  {
    id: 2,
    division: 'women' as const,
    levels: 'college' as const,
    display_name: "Women's College"
  },
  {
    id: 3,
    division: 'men' as const,
    levels: 'high_school' as const,
    display_name: "Men's High School"
  },
  {
    id: 4,
    division: 'women' as const,
    levels: 'high_school' as const,
    display_name: "Women's High School"
  }
];

// Mock navigation data
export const mockNavigation: StandingsNavigation = {
  season: {
    id: 2,
    name: '2024-2025',
    start_at: '2024-08-01',
    end_at: '2025-07-31'
  },
  sport: {
    id: 1,
    name: 'Basketball'
  },
  category: {
    id: 1,
    division: 'men',
    levels: 'college',
    display_name: "Men's College"
  },
  stages: [
    {
      id: 1,
      name: 'Group Stage',
      competition_stage: 'group_stage',
      order: 1
    },
    {
      id: 2,
      name: 'Play-ins',
      competition_stage: 'playins',
      order: 2
    },
    {
      id: 3,
      name: 'Playoffs',
      competition_stage: 'playoffs',
      order: 3
    }
  ]
};

// Mock group stage standings
export const mockGroupStageStandings: GroupStageStandings = {
  stage_id: 1,
  stage_name: 'Group Stage',
  competition_stage: 'group_stage',
  groups: [
    {
      teams: [
        {
          team_id: 'team-1',
          team_name: 'UC Warriors',
          school_name: 'University of Cebu',
          school_abbreviation: 'UC',
          school_logo_url: null, // Will fallback to CESAFI logo
          matches_played: 7,
          wins: 6,
          losses: 1,
          draws: 0,
          goals_for: 598,
          goals_against: 512,
          goal_difference: 86,
          points: 18,
          position: 1
        },
        {
          team_id: 'team-2',
          team_name: 'USC Warriors',
          school_name: 'University of San Carlos',
          school_abbreviation: 'USC',
          school_logo_url: null, // Will fallback to CESAFI logo
          matches_played: 7,
          wins: 5,
          losses: 2,
          draws: 0,
          goals_for: 567,
          goals_against: 523,
          goal_difference: 44,
          points: 15,
          position: 2
        },
        {
          team_id: 'team-3',
          team_name: 'SWU-PHINMA Cobras',
          school_name: 'Southwestern University PHINMA',
          school_abbreviation: 'SWU-PHINMA',
          school_logo_url: null, // Will fallback to CESAFI logo
          matches_played: 7,
          wins: 5,
          losses: 2,
          draws: 0,
          goals_for: 554,
          goals_against: 543,
          goal_difference: 11,
          points: 15,
          position: 3
        },
        {
          team_id: 'team-4',
          team_name: 'CIT-U Wildcats',
          school_name: 'Cebu Institute of Technology - University',
          school_abbreviation: 'CIT-U',
          school_logo_url: null, // Will fallback to CESAFI logo
          matches_played: 7,
          wins: 4,
          losses: 3,
          draws: 0,
          goals_for: 589,
          goals_against: 567,
          goal_difference: 22,
          points: 12,
          position: 4
        },
        {
          team_id: 'team-5',
          team_name: 'USJ-R Jaguars',
          school_name: 'University of San Jose - Recoletos',
          school_abbreviation: 'USJ-R',
          school_logo_url: null, // Will fallback to CESAFI logo
          matches_played: 7,
          wins: 3,
          losses: 4,
          draws: 0,
          goals_for: 534,
          goals_against: 556,
          goal_difference: -22,
          points: 9,
          position: 5
        },
        {
          team_id: 'team-6',
          team_name: 'UV Lancers',
          school_name: 'University of the Visayas',
          school_abbreviation: 'UV',
          school_logo_url: null, // Will fallback to CESAFI logo
          matches_played: 7,
          wins: 2,
          losses: 5,
          draws: 0,
          goals_for: 498,
          goals_against: 545,
          goal_difference: -47,
          points: 6,
          position: 6
        },
        {
          team_id: 'team-7',
          team_name: 'CEC Sharks',
          school_name: 'Cebu Eastern College',
          school_abbreviation: 'CEC',
          school_logo_url: null, // Will fallback to CESAFI logo
          matches_played: 7,
          wins: 1,
          losses: 6,
          draws: 0,
          goals_for: 476,
          goals_against: 587,
          goal_difference: -111,
          points: 3,
          position: 7
        },
        {
          team_id: 'team-8',
          team_name: 'DBTC Eagles',
          school_name: 'Don Bosco Technology Center',
          school_abbreviation: 'DBTC',
          school_logo_url: null, // Will fallback to CESAFI logo
          matches_played: 7,
          wins: 1,
          losses: 6,
          draws: 0,
          goals_for: 445,
          goals_against: 588,
          goal_difference: -143,
          points: 3,
          position: 8
        }
      ]
    }
  ]
};

// Mock bracket standings (playoffs)
export const mockBracketStandings: BracketStandings = {
  stage_id: 2,
  stage_name: 'Playoffs',
  competition_stage: 'playoffs',
  bracket: [
    {
      match_id: 201,
      match_name: 'Quarterfinal 1',
      round: 1,
      position: 1,
      team1: {
        team_id: 'team-1',
        team_name: 'UC Warriors',
        school_name: 'University of Cebu',
        school_abbreviation: 'UC',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 87
      },
      team2: {
        team_id: 'team-8',
        team_name: 'DBTC Tigers',
        school_name: 'Don Bosco Technology Center',
        school_abbreviation: 'DBTC',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 73
      },
      winner: {
        team_id: 'team-1',
        team_name: 'UC Warriors',
        school_name: 'University of Cebu',
        school_abbreviation: 'UC',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 87
      },
      match_status: 'finished',
      scheduled_at: '2024-03-15T14:00:00Z',
      venue: 'UC Main Gym'
    },
    {
      match_id: 202,
      match_name: 'Quarterfinal 2',
      round: 1,
      position: 2,
      team1: {
        team_id: 'team-4',
        team_name: 'CIT-U Wildcats',
        school_name: 'Cebu Institute of Technology - University',
        school_abbreviation: 'CIT-U',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 82
      },
      team2: {
        team_id: 'team-5',
        team_name: 'USJ-R Jaguars',
        school_name: 'University of San Jose - Recoletos',
        school_abbreviation: 'USJ-R',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 79
      },
      winner: {
        team_id: 'team-4',
        team_name: 'CIT-U Wildcats',
        school_name: 'Cebu Institute of Technology - University',
        school_abbreviation: 'CIT-U',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 82
      },
      match_status: 'finished',
      scheduled_at: '2024-03-15T16:00:00Z',
      venue: 'CIT-U Gymnasium'
    },
    {
      match_id: 203,
      match_name: 'Quarterfinal 3',
      round: 1,
      position: 3,
      team1: {
        team_id: 'team-2',
        team_name: 'USC Warriors',
        school_name: 'University of San Carlos',
        school_abbreviation: 'USC',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 91
      },
      team2: {
        team_id: 'team-7',
        team_name: 'UV Green Lancers',
        school_name: 'University of the Visayas',
        school_abbreviation: 'UV',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 85
      },
      winner: {
        team_id: 'team-2',
        team_name: 'USC Warriors',
        school_name: 'University of San Carlos',
        school_abbreviation: 'USC',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 91
      },
      match_status: 'finished',
      scheduled_at: '2024-03-16T14:00:00Z',
      venue: 'USC Main Gymnasium'
    },
    {
      match_id: 204,
      match_name: 'Quarterfinal 4',
      round: 1,
      position: 4,
      team1: {
        team_id: 'team-3',
        team_name: 'SWU-PHINMA Cobras',
        school_name: 'Southwestern University PHINMA',
        school_abbreviation: 'SWU-PHINMA',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 88
      },
      team2: {
        team_id: 'team-6',
        team_name: 'CEC Dragons',
        school_name: 'Cebu Eastern College',
        school_abbreviation: 'CEC',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 84
      },
      winner: {
        team_id: 'team-3',
        team_name: 'SWU-PHINMA Cobras',
        school_name: 'Southwestern University PHINMA',
        school_abbreviation: 'SWU-PHINMA',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 88
      },
      match_status: 'finished',
      scheduled_at: '2024-03-16T16:00:00Z',
      venue: 'SWU Gymnasium'
    },
    {
      match_id: 205,
      match_name: 'Semifinal 1',
      round: 2,
      position: 1,
      team1: {
        team_id: 'team-1',
        team_name: 'UC Warriors',
        school_name: 'University of Cebu',
        school_abbreviation: 'UC',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 91
      },
      team2: {
        team_id: 'team-4',
        team_name: 'CIT-U Wildcats',
        school_name: 'Cebu Institute of Technology - University',
        school_abbreviation: 'CIT-U',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 78
      },
      winner: {
        team_id: 'team-1',
        team_name: 'UC Warriors',
        school_name: 'University of Cebu',
        school_abbreviation: 'UC',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 91
      },
      match_status: 'finished',
      scheduled_at: '2024-03-22T18:00:00Z',
      venue: 'Cebu Coliseum'
    },
    {
      match_id: 206,
      match_name: 'Semifinal 2',
      round: 2,
      position: 2,
      team1: {
        team_id: 'team-2',
        team_name: 'USC Warriors',
        school_name: 'University of San Carlos',
        school_abbreviation: 'USC',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 89
      },
      team2: {
        team_id: 'team-3',
        team_name: 'SWU-PHINMA Cobras',
        school_name: 'Southwestern University PHINMA',
        school_abbreviation: 'SWU-PHINMA',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 86
      },
      winner: {
        team_id: 'team-2',
        team_name: 'USC Warriors',
        school_name: 'University of San Carlos',
        school_abbreviation: 'USC',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: 89
      },
      match_status: 'finished',
      scheduled_at: '2024-03-23T18:00:00Z',
      venue: 'Cebu Coliseum'
    },
    {
      match_id: 207,
      match_name: 'Championship Final',
      round: 3,
      position: 1,
      team1: {
        team_id: 'team-1',
        team_name: 'UC Warriors',
        school_name: 'University of Cebu',
        school_abbreviation: 'UC',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: null
      },
      team2: {
        team_id: 'team-2',
        team_name: 'USC Warriors',
        school_name: 'University of San Carlos',
        school_abbreviation: 'USC',
        school_logo_url: null, // Will fallback to CESAFI logo
        score: null
      },
      winner: null, // Match hasn't been played yet
      match_status: 'upcoming',
      scheduled_at: '2024-03-30T19:00:00Z',
      venue: 'CESAFI Championship Arena'
    }
  ]
};

// Mock playins standings (simple list of matches for teams that didn't qualify for playoffs)
export const mockPlayinsStandings: PlayinsStandings = {
  stage_id: 2,
  stage_name: 'Play-ins',
  competition_stage: 'playins',
  matches: [
    {
      match_id: 101,
      match_name: 'Play-in Round 1: UV vs USJR',
      team1: {
        team_id: 'team-5',
        team_name: 'UV Lancers',
        school_name: 'University of the Visayas',
        school_abbreviation: 'UV',
        school_logo_url: null,
        score: 87
      },
      team2: {
        team_id: 'team-6',
        team_name: 'USJR Jaguars',
        school_name: 'University of San Jose-Recoletos',
        school_abbreviation: 'USJR',
        school_logo_url: null,
        score: 82
      },
      winner: {
        team_id: 'team-5',
        team_name: 'UV Lancers',
        school_name: 'University of the Visayas',
        school_abbreviation: 'UV',
        school_logo_url: null,
        score: 87
      },
      match_status: 'finished',
      scheduled_at: '2024-03-10T16:00:00Z',
      venue: 'Cebu Coliseum'
    },
    {
      match_id: 102,
      match_name: 'Play-in Round 2: CTU vs SMC',
      team1: {
        team_id: 'team-7',
        team_name: 'CTU Wildcats',
        school_name: 'Cebu Technological University',
        school_abbreviation: 'CTU',
        school_logo_url: null,
        score: 79
      },
      team2: {
        team_id: 'team-8',
        team_name: 'SMC Stallions',
        school_name: 'Saint Michael College',
        school_abbreviation: 'SMC',
        school_logo_url: null,
        score: 85
      },
      winner: {
        team_id: 'team-8',
        team_name: 'SMC Stallions',
        school_name: 'Saint Michael College',
        school_abbreviation: 'SMC',
        school_logo_url: null,
        score: 85
      },
      match_status: 'finished',
      scheduled_at: '2024-03-11T16:00:00Z',
      venue: 'Cebu Coliseum'
    },
    {
      match_id: 103,
      match_name: 'Play-in Final: UV vs SMC',
      team1: {
        team_id: 'team-5',
        team_name: 'UV Lancers',
        school_name: 'University of the Visayas',
        school_abbreviation: 'UV',
        school_logo_url: null,
        score: null
      },
      team2: {
        team_id: 'team-8',
        team_name: 'SMC Stallions',
        school_name: 'Saint Michael College',
        school_abbreviation: 'SMC',
        school_logo_url: null,
        score: null
      },
      winner: null,
      match_status: 'upcoming',
      scheduled_at: '2024-03-15T18:00:00Z',
      venue: 'Cebu Coliseum'
    }
  ]
};

// Export mock standings response
export function getMockStandings(stage_id?: number): StandingsResponse {
  let standings;

  switch (stage_id) {
    case 1: // Group Stage
      standings = mockGroupStageStandings;
      break;
    case 2: // Play-ins
      standings = mockPlayinsStandings;
      break;
    case 3: // Playoffs
      standings = mockBracketStandings;
      break;
    default:
      standings = mockGroupStageStandings;
  }

  return {
    navigation: mockNavigation,
    standings
  };
}
