'use server';

import { PaginationOptions } from '@/lib/types/base';
import { SchoolsTeamInsert, SchoolsTeamUpdate } from '@/lib/types/schools-teams';
import { SchoolsTeamService } from '@/services/schools-teams';
import { revalidatePath } from 'next/cache';

export async function getPaginatedSchoolsTeams(options: PaginationOptions) {
  return await SchoolsTeamService.getPaginated(options);
}

export async function getAllSchoolsTeams() {
  return await SchoolsTeamService.getAll();
}

export async function getSchoolsTeamById(id: string) {
  return await SchoolsTeamService.getById(id);
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
