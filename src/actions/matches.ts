'use server';

import { PaginationOptions } from '@/lib/types/base';
import { MatchInsert, MatchUpdate } from '@/lib/types/matches';
import { MatchService } from '@/services/matches';
import { revalidatePath } from 'next/cache';

export async function getPaginatedMatches(options: PaginationOptions) {
  return await MatchService.getPaginated(options);
}

export async function getAllMatches() {
  return await MatchService.getAll();
}

export async function getMatchById(id: number) {
  return await MatchService.getById(id);
}

export async function createMatch(data: MatchInsert) {
  const result = await MatchService.insert(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function updateMatchById(data: MatchUpdate) {
  const result = await MatchService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function deleteMatchById(id: number) {
  const result = await MatchService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}
