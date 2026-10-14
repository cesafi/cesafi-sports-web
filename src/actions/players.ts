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

  // players.school_team_id is NOT NULL, so it must be part of the insert
  const result = await PlayerService.insert({ ...playerData, school_team_id: resolvedTeamId } as PlayerInsert);

  if (result.success && result.data && resolvedTeamId) {
    const assignResult = await PlayerService.assignTeam(result.data.id, resolvedTeamId, seasonId);
    if (!assignResult.success) {
      revalidatePath('/admin/players');
      return { success: false, error: `Player was created, but adding them to the team failed: ${assignResult.error}` };
    }
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

  const result = await PlayerService.updateById(
    (resolvedTeamId ? { ...playerData, school_team_id: resolvedTeamId } : playerData) as PlayerUpdate
  );

  if (result.success && resolvedTeamId) {
    const assignResult = await PlayerService.assignTeam(playerData.id, resolvedTeamId, seasonId);
    if (!assignResult.success) {
      revalidatePath('/admin/players');
      return { success: false, error: `Player was updated, but changing their team failed: ${assignResult.error}` };
    }
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
