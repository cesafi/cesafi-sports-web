'use server';

import { PaginationOptions } from '@/lib/types/base';
import {
  MatchInsert,
  MatchUpdate,
  SchedulePaginationOptions,
  ScheduleFilters
} from '@/lib/types/matches';
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

export async function getMatchByIdBasic(id: number) {
  return await MatchService.getByIdBasic(id);
}

export async function getMatchesByStageId(stageId: number) {
  return await MatchService.getByStageId(stageId);
}

export async function getMatchesBySportAndCategory(sportId: number, sportCategoryId: number) {
  return await MatchService.getBySportAndCategory(sportId, sportCategoryId);
}

export async function getMatchesBySeason(seasonId: number) {
  return await MatchService.getBySeason(seasonId);
}

export async function createMatch(data: MatchInsert) {
  const result = await MatchService.insert(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function createMatchWithParticipants(data: MatchInsert, participantTeamIds: string[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (MatchService as any).insertWithParticipants(data, participantTeamIds);

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

// New server actions for schedule feature
export async function getScheduleMatches(options: SchedulePaginationOptions) {
  return await MatchService.getScheduleMatches(options);
}

export async function getScheduleMatchesByDate(options: ScheduleFilters) {
  return await MatchService.getScheduleMatchesByDate(options);
}
