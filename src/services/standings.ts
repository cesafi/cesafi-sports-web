import { ServiceResponse } from '@/lib/types/base';
import { BaseService } from './base';
import {
  USE_MOCK_DATA,
  getMockStandings,
  mockSeasons,
  mockSports,
  mockCategories,
  mockNavigation
} from '@/lib/mock-data';
import {
  StandingsEntry,
  GroupStageStandings,
  BracketStandings,
  StandingsNavigation,
  StandingsResponse,
  StandingsFilters,
  BracketMatch,
  BracketTeam
} from '@/lib/types/standings';
import { formatCategoryName } from '@/lib/utils/sports';

const MATCHES_TABLE = 'matches';
const MATCH_PARTICIPANTS_TABLE = 'match_participants';
const SCHOOLS_TEAMS_TABLE = 'schools_teams';
const SCHOOLS_TABLE = 'schools';
const SPORTS_SEASONS_STAGES_TABLE = 'sports_seasons_stages';
const SPORTS_CATEGORIES_TABLE = 'sports_categories';
const SPORTS_TABLE = 'sports';
const SEASONS_TABLE = 'seasons';

export class StandingsService extends BaseService {
  /**
   * Get complete standings data with navigation and standings
   */
  static async getStandings(
    filters: StandingsFilters
  ): Promise<ServiceResponse<StandingsResponse>> {
    try {
      // Use mock data in development
      if (USE_MOCK_DATA) {
        const mockData = getMockStandings(filters.stage_id);
        return {
          success: true,
          data: mockData
        };
      }

      const { season_id, sport_id, sport_category_id, stage_id } = filters;

      if (!season_id || !sport_id || !sport_category_id) {
        return {
          success: false,
          error: 'Season, sport, and category are required for standings.'
        };
      }

      // Get navigation data
      const navigationResult = await this.getStandingsNavigation(filters);
      if (!navigationResult.success || !navigationResult.data) {
        return {
          success: false,
          error: navigationResult.error || 'Failed to get navigation data.'
        };
      }

      // If no specific stage is provided, use the first stage
      const targetStageId = stage_id ?? navigationResult.data.stages[0]?.id;
      if (!targetStageId) {
        return {
          success: false,
          error: 'No stages found for the specified filters.'
        };
      }

      // Get the target stage details
      const targetStage = navigationResult.data.stages.find((s) => s.id === targetStageId);
      if (!targetStage) {
        return {
          success: false,
          error: 'Invalid stage ID provided.'
        };
      }

      // Get standings based on competition stage type
      let standingsData;
      if (targetStage.competition_stage === 'group_stage') {
        const result = await this.getGroupStageStandings(targetStageId);
        if (!result.success || !result.data) {
          return {
            success: false,
            error: result.error || 'Failed to get group stage standings.'
          };
        }
        standingsData = result.data;
      } else {
        // For playoffs, finals, playins - use bracket format
        const result = await this.getBracketStandings(targetStageId);
        if (!result.success || !result.data) {
          return {
            success: false,
            error: result.error || 'Failed to get bracket standings.'
          };
        }
        standingsData = result.data;
      }

      return {
        success: true,
        data: {
          navigation: navigationResult.data,
          standings: standingsData
        }
      };
    } catch (err) {
      return this.formatError(err, 'Failed to retrieve standings data.');
    }
  }

  /**
   * Get navigation structure for standings
   */
  static async getStandingsNavigation(
    filters: StandingsFilters
  ): Promise<ServiceResponse<StandingsNavigation>> {
    try {
      const supabase = await this.getClient();
      const { season_id, sport_id, sport_category_id } = filters;

      // Get season, sport, category, and stages data
      const { data, error } = await supabase
        .from(SPORTS_SEASONS_STAGES_TABLE)
        .select(
          `
          id,
          name,
          competition_stage,
          order_index,
          sports_categories!inner (
            id,
            division,
            levels,
            sports!inner (
              id,
              name
            )
          ),
          seasons!inner (
            id,
            start_at,
            end_at
          )
        `
        )
        .eq('sports_categories.sports.id', sport_id)
        .eq('sports_categories.id', sport_category_id)
        .eq('seasons.id', season_id)
        .order('order_index', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'No stages found for the specified filters.'
        };
      }

      const firstStage = data[0];
      const season = firstStage.seasons;
      const sport = firstStage.sports_categories.sports;
      const category = firstStage.sports_categories;

      const navigation: StandingsNavigation = {
        season: {
          id: season.id,
          name: `${season.start_at.split('-')[0]}-${season.end_at.split('-')[0]}`,
          start_at: season.start_at,
          end_at: season.end_at
        },
        sport: {
          id: sport.id,
          name: sport.name
        },
        category: {
          id: category.id,
          division: category.division,
          levels: category.levels,
          display_name: formatCategoryName(category.division, category.levels)
        },
        stages: data.map((stage) => ({
          id: stage.id,
          name: stage.name,
          competition_stage: stage.competition_stage,
          order: stage.order_index
        }))
      };

      return {
        success: true,
        data: navigation
      };
    } catch (err) {
      return this.formatError(err, 'Failed to retrieve standings navigation.');
    }
  }

  /**
   * Calculate group stage standings (table format)
   */
  static async getGroupStageStandings(
    stageId: number
  ): Promise<ServiceResponse<GroupStageStandings>> {
    try {
      const supabase = await this.getClient();

      // Get stage details
      const { data: stage, error: stageError } = await supabase
        .from(SPORTS_SEASONS_STAGES_TABLE)
        .select('id, name, competition_stage')
        .eq('id', stageId)
        .single();

      if (stageError) throw stageError;

      // Get all matches for this stage with participants and scores
      const { data: matches, error: matchesError } = await supabase
        .from(MATCHES_TABLE)
        .select(
          `
          id,
          status,
          match_participants!inner (
            id,
            team_id,
            match_score,
            schools_teams!inner (
              id,
              name,
              schools!inner (
                id,
                name,
                abbreviation,
                logo_url
              )
            )
          )
        `
        )
        .eq('stage_id', stageId)
        .eq('status', 'finished'); // Only count finished matches

      if (matchesError) throw matchesError;

      // Calculate standings
      const teamStats = new Map<string, StandingsEntry>();

      // Initialize all teams that have participated
      matches?.forEach((match) => {
        match.match_participants.forEach((participant) => {
          const team = participant.schools_teams;
          const school = team.schools;

          if (!teamStats.has(participant.team_id)) {
            teamStats.set(participant.team_id, {
              team_id: participant.team_id,
              team_name: team.name,
              school_name: school.name,
              school_abbreviation: school.abbreviation,
              school_logo_url: school.logo_url,
              matches_played: 0,
              wins: 0,
              losses: 0,
              draws: 0,
              goals_for: 0,
              goals_against: 0,
              goal_difference: 0,
              points: 0,
              position: 0
            });
          }
        });
      });

      // Calculate match results
      matches?.forEach((match) => {
        if (match.match_participants.length === 2) {
          const [team1, team2] = match.match_participants;
          const score1 = team1.match_score ?? 0;
          const score2 = team2.match_score ?? 0;

          // Update team1 stats
          const team1Stats = teamStats.get(team1.team_id)!;
          team1Stats.matches_played++;
          team1Stats.goals_for += score1;
          team1Stats.goals_against += score2;
          team1Stats.goal_difference = team1Stats.goals_for - team1Stats.goals_against;

          // Update team2 stats
          const team2Stats = teamStats.get(team2.team_id)!;
          team2Stats.matches_played++;
          team2Stats.goals_for += score2;
          team2Stats.goals_against += score1;
          team2Stats.goal_difference = team2Stats.goals_for - team2Stats.goals_against;

          // Determine winner and award points
          if (score1 > score2) {
            // Team1 wins
            team1Stats.wins++;
            team1Stats.points += 3;
            team2Stats.losses++;
          } else if (score2 > score1) {
            // Team2 wins
            team2Stats.wins++;
            team2Stats.points += 3;
            team1Stats.losses++;
          } else {
            // Draw
            team1Stats.draws++;
            team1Stats.points += 1;
            team2Stats.draws++;
            team2Stats.points += 1;
          }
        }
      });

      // Convert to array and sort by points, then by goal difference
      const standings = Array.from(teamStats.values()).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
        return b.goals_for - a.goals_for;
      });

      // Assign positions
      standings.forEach((team, index) => {
        team.position = index + 1;
      });

      const groupStageStandings: GroupStageStandings = {
        stage_id: stage.id,
        stage_name: stage.name,
        competition_stage: stage.competition_stage,
        groups: [
          {
            group_name: undefined, // Single group for now
            teams: standings
          }
        ]
      };

      return {
        success: true,
        data: groupStageStandings
      };
    } catch (err) {
      return this.formatError(err, 'Failed to calculate group stage standings.');
    }
  }

  /**
   * Get bracket/tournament standings (bracket format)
   */
  static async getBracketStandings(stageId: number): Promise<ServiceResponse<BracketStandings>> {
    try {
      const supabase = await this.getClient();

      // Get stage details
      const { data: stage, error: stageError } = await supabase
        .from(SPORTS_SEASONS_STAGES_TABLE)
        .select('id, name, competition_stage')
        .eq('id', stageId)
        .single();

      if (stageError) throw stageError;

      // Get all matches for this stage with participants
      const { data: matches, error: matchesError } = await supabase
        .from(MATCHES_TABLE)
        .select(
          `
          id,
          name,
          status,
          scheduled_at,
          venue,
          match_participants!inner (
            id,
            team_id,
            match_score,
            schools_teams!inner (
              id,
              name,
              schools!inner (
                id,
                name,
                abbreviation,
                logo_url
              )
            )
          )
        `
        )
        .eq('stage_id', stageId)
        .order('scheduled_at', { ascending: true });

      if (matchesError) throw matchesError;

      // Convert matches to bracket format
      const bracketMatches: BracketMatch[] =
        matches?.map((match, index) => {
          const participants = match.match_participants;

          let team1: BracketTeam | null = null;
          let team2: BracketTeam | null = null;
          let winner: BracketTeam | null = null;

          if (participants.length >= 1) {
            const p1 = participants[0];
            team1 = {
              team_id: p1.team_id,
              team_name: p1.schools_teams.name,
              school_name: p1.schools_teams.schools.name,
              school_abbreviation: p1.schools_teams.schools.abbreviation,
              school_logo_url: p1.schools_teams.schools.logo_url,
              score: p1.match_score
            };
          }

          if (participants.length >= 2) {
            const p2 = participants[1];
            team2 = {
              team_id: p2.team_id,
              team_name: p2.schools_teams.name,
              school_name: p2.schools_teams.schools.name,
              school_abbreviation: p2.schools_teams.schools.abbreviation,
              school_logo_url: p2.schools_teams.schools.logo_url,
              score: p2.match_score
            };
          }

          // Determine winner if match is finished
          if (match.status === 'finished' && team1 && team2) {
            if (team1.score !== null && team2.score !== null) {
              if (team1.score > team2.score) {
                winner = team1;
              } else if (team2.score > team1.score) {
                winner = team2;
              }
            }
          }

          return {
            match_id: match.id,
            match_name: match.name,
            round: Math.floor(index / 2) + 1, // Simple round calculation
            position: index,
            team1,
            team2,
            winner,
            match_status: match.status,
            scheduled_at: match.scheduled_at,
            venue: match.venue
          };
        }) || [];

      const bracketStandings: BracketStandings = {
        stage_id: stage.id,
        stage_name: stage.name,
        competition_stage: stage.competition_stage,
        bracket: bracketMatches
      };

      return {
        success: true,
        data: bracketStandings
      };
    } catch (err) {
      return this.formatError(err, 'Failed to get bracket standings.');
    }
  }

  /**
   * Get available seasons with sports data
   */
  static async getAvailableSeasons(): Promise<
    ServiceResponse<Array<{ id: number; name: string; start_at: string; end_at: string }>>
  > {
    try {
      // Use mock data in development
      if (USE_MOCK_DATA) {
        return {
          success: true,
          data: mockSeasons
        };
      }
      const supabase = await this.getClient();

      const { data, error } = await supabase
        .from(SEASONS_TABLE)
        .select('id, start_at, end_at')
        .order('start_at', { ascending: false });

      if (error) throw error;

      const seasons =
        data?.map((season) => ({
          id: season.id,
          name: `${season.start_at.split('-')[0]}-${season.end_at.split('-')[0]}`,
          start_at: season.start_at,
          end_at: season.end_at
        })) || [];

      return {
        success: true,
        data: seasons
      };
    } catch (err) {
      return this.formatError(err, 'Failed to get available seasons.');
    }
  }

  /**
   * Get available sports for a season
   */
  static async getAvailableSports(
    seasonId: number
  ): Promise<ServiceResponse<Array<{ id: number; name: string }>>> {
    try {
      // Use mock data in development
      if (USE_MOCK_DATA) {
        return {
          success: true,
          data: mockSports
        };
      }
      const supabase = await this.getClient();

      const { data, error } = await supabase
        .from(SPORTS_SEASONS_STAGES_TABLE)
        .select(
          `
          sports_categories!inner (
            sports!inner (
              id,
              name
            )
          )
        `
        )
        .eq('season_id', seasonId);

      if (error) throw error;

      // Remove duplicates
      const sportsMap = new Map();
      data?.forEach((stage) => {
        const sport = stage.sports_categories.sports;
        sportsMap.set(sport.id, sport);
      });

      const sports = Array.from(sportsMap.values());

      return {
        success: true,
        data: sports
      };
    } catch (err) {
      return this.formatError(err, 'Failed to get available sports.');
    }
  }

  /**
   * Get available categories for a season and sport
   */
  static async getAvailableCategories(
    seasonId: number,
    sportId: number
  ): Promise<
    ServiceResponse<Array<{ id: number; division: string; levels: string; display_name: string }>>
  > {
    try {
      // Use mock data in development
      if (USE_MOCK_DATA) {
        return {
          success: true,
          data: mockCategories
        };
      }
      const supabase = await this.getClient();

      const { data, error } = await supabase
        .from(SPORTS_SEASONS_STAGES_TABLE)
        .select(
          `
          sports_categories!inner (
            id,
            division,
            levels
          )
        `
        )
        .eq('season_id', seasonId)
        .eq('sports_categories.sport_id', sportId);

      if (error) throw error;

      // Remove duplicates
      const categoriesMap = new Map();
      data?.forEach((stage) => {
        const category = stage.sports_categories;
        categoriesMap.set(category.id, {
          id: category.id,
          division: category.division,
          levels: category.levels,
          display_name: formatCategoryName(category.division, category.levels)
        });
      });

      const categories = Array.from(categoriesMap.values());

      return {
        success: true,
        data: categories
      };
    } catch (err) {
      return this.formatError(err, 'Failed to get available categories.');
    }
  }
}
