'use server';

import { PaginationOptions } from '@/lib/types/base';
import { GameInsert, GameUpdate } from '@/lib/types/games';
import { GameService } from '@/services/games';
import { revalidatePath } from 'next/cache';

export async function getPaginatedGames(options: PaginationOptions) {
  return await GameService.getPaginated(options);
}

export async function getAllGames() {
  return await GameService.getAll();
}

export async function getGameById(id: number) {
  return await GameService.getById(id);
}

export async function getGamesByMatchId(matchId: number) {
  return await GameService.getByMatchId(matchId);
}

export async function createGame(data: GameInsert) {
  const result = await GameService.insert(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function updateGameById(data: GameUpdate) {
  const result = await GameService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function deleteGameById(id: number) {
  const result = await GameService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function calculateMatchDuration(matchId: number) {
  return await GameService.calculateMatchDuration(matchId);
}
