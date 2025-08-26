'use server';

import { SchoolsTeamInsert, SchoolsTeamUpdate } from '@/lib/types/schools-teams';
import { SchoolsTeamService } from '@/services/schools-teams';
import { revalidatePath } from 'next/cache';

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

export async function createSchoolsTeam(data: SchoolsTeamInsert) {
  const result = await SchoolsTeamService.insert(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/schools');
    revalidatePath('/admin/dashboard/seasons');
    revalidatePath('/admin/dashboard/sports');
  }

  return result;
}

export async function updateSchoolsTeamById(data: SchoolsTeamUpdate) {
  const result = await SchoolsTeamService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/schools');
    revalidatePath('/admin/dashboard/seasons');
    revalidatePath('/admin/dashboard/sports');
  }

  return result;
}

export async function deleteSchoolsTeamById(id: string) {
  const result = await SchoolsTeamService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/dashboard/schools');
    revalidatePath('/admin/dashboard/seasons');
    revalidatePath('/admin/dashboard/sports');
  }

  return result;
}
