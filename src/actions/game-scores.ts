'use server';

import { GameScoreService } from '@/services/game-scores';
import { createGameScoreSchema, updateGameScoreSchema } from '@/lib/validations/game-scores';
import { revalidatePath } from 'next/cache';

// Core context-based fetching actions
export async function getGameScoresByGameId(gameId: number) {
  return await GameScoreService.getByGameId(gameId);
}

export async function getGameScoresByParticipantId(participantId: number) {
  return await GameScoreService.getByParticipantId(participantId);
}

export async function getGameScoresByMatchId(matchId: number) {
  return await GameScoreService.getByMatchId(matchId);
}

// CRUD operations
export async function createGameScore(data: unknown) {
  // Validate the input data
  const validationResult = createGameScoreSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await GameScoreService.insert(validationResult.data);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function updateGameScoreById(data: unknown) {
  // Validate the input data
  const validationResult = updateGameScoreSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await GameScoreService.updateById(validationResult.data);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function deleteGameScoreById(id: number) {
  const result = await GameScoreService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

// Utility actions for specific business logic
export async function getParticipantMatchAggregate(matchId: number, participantId: number) {
  return await GameScoreService.getParticipantMatchAggregate(matchId, participantId);
}

export async function getGameScoresWithDetails(gameId: number) {
  return await GameScoreService.getScoresWithDetails(gameId);
}
