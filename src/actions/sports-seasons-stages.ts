'use server';

import { PaginationOptions } from '@/lib/types/base';
import {
  SportsSeasonsStageInsert,
  SportsSeasonsStageUpdate
} from '@/lib/types/sports-seasons-stages';
import { SportsSeasonsStageService } from '@/services/sports-seasons-stages';
import { revalidatePath } from 'next/cache';

export async function getPaginatedSportsSeasonsStages(options: PaginationOptions) {
  return await SportsSeasonsStageService.getPaginated(options);
}

export async function getAllSportsSeasonsStages() {
  return await SportsSeasonsStageService.getAll();
}

export async function getSportsSeasonsStageById(id: string) {
  return await SportsSeasonsStageService.getById(id);
}

export async function createSportsSeasonsStage(data: SportsSeasonsStageInsert) {
  const result = await SportsSeasonsStageService.insert(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/seasons');
  }

  return result;
}

export async function updateSportsSeasonsStageById(data: SportsSeasonsStageUpdate) {
  const result = await SportsSeasonsStageService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/seasons');
  }

  return result;
}

export async function deleteSportsSeasonsStageById(id: string) {
  const result = await SportsSeasonsStageService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/dashboard/seasons');
  }

  return result;
}
