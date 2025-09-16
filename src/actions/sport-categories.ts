'use server';

import { SportCategoryService } from '@/services/sport-categories';
import { createSportCategorySchema, updateSportCategorySchema } from '@/lib/validations/sport-categories';
import { RevalidationHelper } from '@/lib/utils/revalidation';
import { ServiceResponse } from '@/lib/types/base';

// Context-based fetching methods
export async function getSportCategoriesBySportId(sportId: number) {
  return await SportCategoryService.getBySportId(sportId);
}

export async function getSportCategoriesByDivision(division: 'men' | 'women' | 'mixed') {
  return await SportCategoryService.getByDivision(division);
}

export async function getSportCategoriesByLevel(level: 'elementary' | 'high_school' | 'college') {
  return await SportCategoryService.getByLevel(level);
}

export async function getSportCategoriesBySportAndDivision(sportId: number, division: 'men' | 'women' | 'mixed') {
  return await SportCategoryService.getBySportAndDivision(sportId, division);
}

export async function getSportCategoriesBySportAndLevel(sportId: number, level: 'elementary' | 'high_school' | 'college') {
  return await SportCategoryService.getBySportAndLevel(sportId, level);
}

// Utility methods
export async function getAllSportCategories() {
  return await SportCategoryService.getAll();
}

export async function getSportCategoryById(id: number) {
  return await SportCategoryService.getById(id);
}

export async function getCategoriesWithSportDetails() {
  return await SportCategoryService.getCategoriesWithSportDetails();
}

export async function getUniqueDivisions() {
  return await SportCategoryService.getUniqueDivisions();
}

export async function getUniqueLevels() {
  return await SportCategoryService.getUniqueLevels();
}

export async function createSportCategory(data: unknown): Promise<ServiceResponse<undefined>> {
  // Validate the input data
  const validationResult = createSportCategorySchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const result = await SportCategoryService.insert(validationResult.data);
  if (result.success) {
    RevalidationHelper.revalidateSports(); // Sport categories affect sports
  }
  return result;
}

export async function updateSportCategoryById(data: unknown): Promise<ServiceResponse<undefined>> {
  // Validate the input data
  const validationResult = updateSportCategorySchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const result = await SportCategoryService.updateById(validationResult.data);
  if (result.success) {
    RevalidationHelper.revalidateSports(); // Sport categories affect sports
  }
  return result;
}

export async function deleteSportCategoryById(id: number) {
  const result = await SportCategoryService.deleteById(id);
  if (result.success) {
    RevalidationHelper.revalidateSports(); // Sport categories affect sports
  }
  return result;
}

export async function getCategoryCountBySportId(sportId: number) {
  return await SportCategoryService.getCountBySportId(sportId);
}
