'use server';

import { PaginationOptions } from '@/lib/types/base';
import { SeasonInsert, SeasonUpdate } from '@/lib/types/seasons';
import { SeasonService } from '@/services/seasons';
import { revalidatePath } from 'next/cache';

export async function getPaginatedSeasons(options: PaginationOptions) {
  return await SeasonService.getPaginated(options);
}

export async function getAllSeasons() {
  return await SeasonService.getAll();
}

export async function getSeasonById(id: string) {
  return await SeasonService.getById(id);
}

export async function createSeason(data: SeasonInsert) {
  const result = await SeasonService.insert(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/seasons');
  }

  return result;
}

export async function updateSeasonById(data: SeasonUpdate) {
  const result = await SeasonService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/seasons');
  }

  return result;
}

export async function deleteSeasonById(id: string) {
  const result = await SeasonService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/dashboard/seasons');
  }

  return result;
}