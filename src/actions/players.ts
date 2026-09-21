'use server';

import { revalidatePath } from 'next/cache';
import { PlayerService } from '@/services/players';
import { PlayerInsert, PlayerUpdate } from '@/lib/types/players';
import { PaginationOptions, FilterValue, ServiceResponse } from '@/lib/types/base';
import { createPlayerSchema, updatePlayerSchema } from '@/lib/validations/players';

export async function getPaginatedPlayers(options: PaginationOptions<Record<string, FilterValue>>) {
  return PlayerService.getPaginated(options);
}

export async function getAllPlayers() {
  return PlayerService.getAll();
}

export async function getAllPlayersWithTeams() {
  return PlayerService.getAllWithTeams();
}

export async function getPlayersByTeamId(teamId: string) {
  return PlayerService.getByTeamId(teamId);
}

export async function getActivePlayers() {
  return PlayerService.getActivePlayers();
}

export async function getPlayerById(id: string) {
  return PlayerService.getById(id);
}

export async function getPlayerBySlugAndSchool(slug: string, schoolAbbreviation: string) {
  return PlayerService.getBySlugAndSchool(slug, schoolAbbreviation);
}

export async function getPlayerBySlug(slug: string) {
  return PlayerService.getBySlug(slug);
}

export async function createPlayer(
  data: unknown,
  teamId?: string | null,
  seasonId?: number
): Promise<ServiceResponse<{ id: string } | undefined>> {
  // Validate input with Zod before passing to the service
  const validationResult = createPlayerSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const { school_team_id, ...playerData } = validationResult.data;

  // Use validated school_team_id as the teamId if not explicitly passed
  const resolvedTeamId = teamId ?? school_team_id;

  const result = await PlayerService.insert(playerData as PlayerInsert);

  if (result.success && result.data && resolvedTeamId) {
    await PlayerService.assignTeam(result.data.id, resolvedTeamId, seasonId);
  }

  if (result.success) {
    revalidatePath('/admin/players');
  }

  return result;
}

export async function updatePlayerById(
  data: unknown,
  teamId?: string | null,
  seasonId?: number
): Promise<ServiceResponse<undefined>> {
  // Validate input with Zod before passing to the service
  const validationResult = updatePlayerSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const { school_team_id, ...playerData } = validationResult.data;

  // Use validated school_team_id as the teamId if not explicitly passed
  const resolvedTeamId = teamId ?? school_team_id ?? null;

  const result = await PlayerService.updateById(playerData as PlayerUpdate);

  if (result.success && resolvedTeamId) {
    await PlayerService.assignTeam(playerData.id, resolvedTeamId, seasonId);
  }

  if (result.success) {
    revalidatePath('/admin/players');
  }

  return result;
}

export async function deletePlayerById(id: string) {
  const result = await PlayerService.deleteById(id);
  if (result.success) {
    revalidatePath('/admin/players');
  }
  return result;
}
