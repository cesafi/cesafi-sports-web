'use server';

import { PaginationOptions } from '@/lib/types/base';
import { GameService } from '@/services/games';
import { createGameSchema, updateGameSchema } from '@/lib/validations/games';
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

export async function getPaginatedGamesByMatch(matchId: number, options: PaginationOptions) {
  return await GameService.getPaginatedByMatch(matchId, options);
}

export async function createGame(data: unknown) {
  // Validate the input data
  const validationResult = createGameSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await GameService.insert(validationResult.data);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function updateGameById(data: unknown) {
  // Validate the input data
  const validationResult = updateGameSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await GameService.updateById(validationResult.data);

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
