'use server';

import { PaginationOptions } from '@/lib/types/base';
import { SportInsert, SportUpdate } from '@/lib/types/sports';
import { SportService } from '@/services/sports';
import { revalidatePath } from 'next/cache';

export async function getPaginatedSports(options: PaginationOptions) {
  return await SportService.getPaginated(options);
}

export async function getAllSports() {
  return await SportService.getAll();
}

export async function getSportById(id: string) {
  return await SportService.getById(id);
}

export async function createSport(data: SportInsert) {
  const result = await SportService.insert(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/sports');
  }

  return result;
}

export async function updateSportById(data: SportUpdate) {
  const result = await SportService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/sports');
  }

  return result;
}

export async function deleteSportById(id: string) {
  const result = await SportService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/dashboard/sports');
  }

  return result;
}