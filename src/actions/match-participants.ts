'use server';

import { PaginationOptions } from '@/lib/types/base';
import { MatchParticipantInsert, MatchParticipantUpdate } from '@/lib/types/match-participants';
import { MatchParticipantService } from '@/services/match-participants';
import { revalidatePath } from 'next/cache';

export async function getPaginatedMatchParticipants(options: PaginationOptions) {
  return await MatchParticipantService.getPaginated(options);
}

export async function getAllMatchParticipants() {
  return await MatchParticipantService.getAll();
}

export async function getMatchParticipantById(id: string) {
  return await MatchParticipantService.getById(id);
}

export async function createMatchParticipant(data: MatchParticipantInsert) {
  const result = await MatchParticipantService.insert(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
    revalidatePath('/admin/dashboard/schools');
  }

  return result;
}

export async function updateMatchParticipantById(data: MatchParticipantUpdate) {
  const result = await MatchParticipantService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
    revalidatePath('/admin/dashboard/schools');
  }

  return result;
}

export async function deleteMatchParticipantById(id: string) {
  const result = await MatchParticipantService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
    revalidatePath('/admin/dashboard/schools');
  }

  return result;
}
