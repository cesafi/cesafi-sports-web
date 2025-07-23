'use server';

import { PaginationOptions } from '@/lib/types/base';
import { GameScoreInsert, GameScoreUpdate } from '@/lib/types/game-scores';
import { GameScoreService } from '@/services/game-scores';
import { revalidatePath } from 'next/cache';

export async function getPaginatedGameScores(options: PaginationOptions) {
  return await GameScoreService.getPaginated(options);
}

export async function getAllGameScores() {
  return await GameScoreService.getAll();
}

export async function getGameScoreById(id: string) {
  return await GameScoreService.getById(id);
}

export async function getGameScoresByGameId(gameId: string) {
  return await GameScoreService.getByGameId(gameId);
}

export async function getGameScoresByParticipantId(participantId: string) {
  return await GameScoreService.getByParticipantId(participantId);
}

export async function createGameScore(data: GameScoreInsert) {
  const result = await GameScoreService.insert(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function updateGameScoreById(data: GameScoreUpdate) {
  const result = await GameScoreService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function deleteGameScoreById(id: string) {
  const result = await GameScoreService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
  }

  return result;
}

export async function getParticipantMatchAggregate(participantId: string) {
  return await GameScoreService.getParticipantMatchAggregate(participantId);
}

export async function getGameScoresWithDetails(gameId: string) {
  return await GameScoreService.getScoresWithDetails(gameId);
}
