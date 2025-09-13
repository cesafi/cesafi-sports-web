'use server';

import {
  MatchPaginationOptions,
  SchedulePaginationOptions,
  ScheduleFilters,
  Match
} from '@/lib/types/matches';
import { MatchService } from '@/services/matches';
import { createMatchSchema, updateMatchSchema } from '@/lib/validations/matches';
import { ServiceResponse } from '@/lib/types/base';
import { revalidatePath } from 'next/cache';

export async function getPaginatedMatches(options: MatchPaginationOptions) {
  return await MatchService.getPaginated(options);
}

export async function getAllMatches() {
  return await MatchService.getAll();
}

export async function getMatchById(id: number) {
  return await MatchService.getById(id);
}

export async function getMatchByIdWithDetails(id: number) {
  return await MatchService.getByIdWithDetails(id);
}

export async function getMatchByIdWithFullDetails(id: number) {
  return await MatchService.getByIdWithDetails(id);
}

export async function getMatchByIdBasic(id: number) {
  return await MatchService.getById(id);
}

export async function getMatchesByStageId(stageId: number) {
  return await MatchService.getByStageId(stageId);
}

export async function getMatchesBySportAndCategory(sportId: number, sportCategoryId: number) {
  return await MatchService.getBySportCategory(sportCategoryId);
}

export async function getMatchesBySeason(seasonId: number) {
  return await MatchService.getBySeason(seasonId);
}

export async function createMatch(data: unknown): Promise<ServiceResponse<Match>> {
  // Validate the input data
  const validationResult = createMatchSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const result = await MatchService.insert(validationResult.data);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function createMatchWithParticipants(data: unknown, participantTeamIds: string[]): Promise<ServiceResponse<Match>> {
  // Validate the input data
  const validationResult = createMatchSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const result = await MatchService.insertWithParticipants(validationResult.data, participantTeamIds);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function updateMatchById(data: unknown): Promise<ServiceResponse<Match>> {
  // Validate the input data
  const validationResult = updateMatchSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const result = await MatchService.updateById(validationResult.data);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function deleteMatchById(id: number) {
  const result = await MatchService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

// New server actions for schedule feature
export async function getScheduleMatches(options: SchedulePaginationOptions) {
  return await MatchService.getScheduleMatches(options);
}

export async function getScheduleMatchesByDate(options: ScheduleFilters) {
  return await MatchService.getScheduleMatchesByDate(options);
}

export async function getMatchesBySchoolId(
  schoolId: string,
  options: {
    limit?: number;
    season_id?: number;
    direction?: 'future' | 'past';
  } = {}
) {
  return await MatchService.getMatchesBySchoolId(schoolId, options);
}
