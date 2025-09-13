'use server';

import { PaginationOptions, ServiceResponse } from '@/lib/types/base';
import { SportsSeasonsStageService } from '@/services/sports-seasons-stages';
import { createSportsSeasonsStageSchema, updateSportsSeasonsStageSchema } from '@/lib/validations/sports-seasons-stages';
import { revalidatePath } from 'next/cache';

export async function getPaginatedSportsSeasonsStages(options: PaginationOptions) {
  return await SportsSeasonsStageService.getPaginated(options);
}

export async function getAllSportsSeasonsStages() {
  return await SportsSeasonsStageService.getAll();
}

export async function getSportsSeasonsStagesBySeason(seasonId: number) {
  return await SportsSeasonsStageService.getBySeason(seasonId);
}

export async function getSportsSeasonsStageById(id: number) {
  return await SportsSeasonsStageService.getById(id);
}

export async function createSportsSeasonsStage(data: unknown): Promise<ServiceResponse<undefined>> {
  // Validate the input data
  const validationResult = createSportsSeasonsStageSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const result = await SportsSeasonsStageService.insert(validationResult.data);

  if (result.success) {
    revalidatePath('/admin/league-stage');
  }

  return result;
}

export async function updateSportsSeasonsStageById(data: unknown): Promise<ServiceResponse<undefined>> {
  // Validate the input data
  const validationResult = updateSportsSeasonsStageSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const result = await SportsSeasonsStageService.updateById(validationResult.data);

  if (result.success) {
    revalidatePath('/admin/league-stage');
  }

  return result;
}

export async function deleteSportsSeasonsStageById(id: number) {
  const result = await SportsSeasonsStageService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/league-stage');
  }

  return result;
}
