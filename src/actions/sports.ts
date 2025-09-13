'use server';

import { PaginationOptions } from '@/lib/types/base';
import { SportCategoryFormData } from '@/lib/types/sports';
import { SportService } from '@/services/sports';
import { createSportSchema, updateSportSchema } from '@/lib/validations/sports';
import { revalidatePath } from 'next/cache';

export async function getPaginatedSports(options: PaginationOptions) {
  try {
    const result = await SportService.getPaginated(options);
    
    if (!result.success || !result.data) {
      return { success: false, error: result.success === false ? result.error : 'Failed to fetch sports' };
    }

    return {
      success: true,
      data: {
        data: result.data.data,
        totalCount: result.data.totalCount,
        pageCount: result.data.pageCount,
        currentPage: result.data.currentPage
      }
    };
  } catch {
    return { success: false, error: 'Failed to fetch sports' };
  }
}

export async function getAllSports() {
  return await SportService.getAll();
}

export async function getSportById(id: number) {
  return await SportService.getById(id);
}

export async function createSport(data: unknown) {
  // Validate the input data
  const validationResult = createSportSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await SportService.insert(validationResult.data);
  if (result.success) {
    revalidatePath('/admin/sports');
  }
  return result;
}

export async function createSportWithCategories(
  sportData: unknown,
  categories: SportCategoryFormData[]
) {
  // Validate the input data
  const validationResult = createSportSchema.safeParse(sportData);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await SportService.insertWithCategories(validationResult.data, categories);
  if (result.success) {
    revalidatePath('/admin/sports');
    revalidatePath('/admin/sport-categories');
  }
  return result;
}

export async function addCategoriesToExistingSport(
  sportId: number,
  categories: SportCategoryFormData[]
) {
  const result = await SportService.addCategoriesToExistingSport(sportId, categories);
  if (result.success) {
    revalidatePath('/admin/sports');
    revalidatePath('/admin/sport-categories');
  }
  return result;
}

export async function updateSportById(data: unknown) {
  // Validate the input data
  const validationResult = updateSportSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await SportService.updateById(validationResult.data);
  if (result.success) {
    revalidatePath('/admin/sports');
  }
  return result;
}

export async function deleteSportById(id: number) {
  const result = await SportService.deleteById(id);
  if (result.success) {
    revalidatePath('/admin/sports');
  }
  return result;
}