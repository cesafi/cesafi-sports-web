'use server';

import { PaginationOptions } from '@/lib/types/base';
import { SportInsert, SportUpdate, SportCategoryFormData } from '@/lib/types/sports';
import { SportService } from '@/services/sports';
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

export async function createSport(data: SportInsert) {
  const result = await SportService.insert(data);
  if (result.success) {
    revalidatePath('/admin/sports');
  }
  return result;
}

export async function createSportWithCategories(
  sportData: SportInsert,
  categories: SportCategoryFormData[]
) {
  const result = await SportService.insertWithCategories(sportData, categories);
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

export async function updateSportById(data: SportUpdate) {
  const result = await SportService.updateById(data);
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