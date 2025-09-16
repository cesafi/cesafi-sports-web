'use server';

import { SchoolsTeamService } from '@/services/schools-teams';
import { createSchoolTeamSchema, updateSchoolTeamSchema } from '@/lib/validations/schools-teams';
import { RevalidationHelper } from '@/lib/utils/revalidation';
import { ServiceResponse } from '@/lib/types/base';

// Context-based fetching methods
export async function getSchoolsTeamsBySchoolId(schoolId: string) {
  return await SchoolsTeamService.getBySchoolId(schoolId);
}

export async function getSchoolsTeamsBySeasonId(seasonId: number) {
  return await SchoolsTeamService.getBySeasonId(seasonId);
}

export async function getSchoolsTeamsBySportCategoryId(sportCategoryId: number) {
  return await SchoolsTeamService.getBySportCategoryId(sportCategoryId);
}

export async function getSchoolsTeamsBySchoolAndSeason(schoolId: string, seasonId: number) {
  return await SchoolsTeamService.getBySchoolAndSeason(schoolId, seasonId);
}

export async function getSchoolsTeamsBySchoolAndSportCategory(schoolId: string, sportCategoryId: number) {
  return await SchoolsTeamService.getBySchoolAndSportCategory(schoolId, sportCategoryId);
}

export async function getTeamsWithFullDetails(schoolId: string) {
  return await SchoolsTeamService.getTeamsWithFullDetails(schoolId);
}

export async function getActiveTeamsBySchool(schoolId: string) {
  return await SchoolsTeamService.getActiveTeamsBySchool(schoolId);
}

export async function getTeamsByStage(stageId: number) {
  return await SchoolsTeamService.getTeamsForStage(stageId);
}

export async function createSchoolsTeam(data: unknown): Promise<ServiceResponse<undefined>> {
  // Validate the input data
  const validationResult = createSchoolTeamSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const result = await SchoolsTeamService.insert(validationResult.data);

  if (result.success) {
    RevalidationHelper.revalidateSchools();
    RevalidationHelper.revalidateSeasons();
  }

  return result;
}

export async function updateSchoolsTeamById(data: unknown): Promise<ServiceResponse<undefined>> {
  // Validate the input data
  const validationResult = updateSchoolTeamSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const result = await SchoolsTeamService.updateById(validationResult.data);

  if (result.success) {
    RevalidationHelper.revalidateSchools();
    RevalidationHelper.revalidateSeasons();
  }

  return result;
}

export async function deleteSchoolsTeamById(id: string) {
  const result = await SchoolsTeamService.deleteById(id);

  if (result.success) {
    RevalidationHelper.revalidateSchools();
    RevalidationHelper.revalidateSeasons();
  }

  return result;
}
