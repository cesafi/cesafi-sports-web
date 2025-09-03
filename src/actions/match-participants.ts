'use server';

import { MatchParticipantInsert, MatchParticipantUpdate } from '@/lib/types/match-participants';
import { MatchParticipantService } from '@/services/match-participants';
import { revalidatePath } from 'next/cache';

// Core context-based fetching actions
export async function getMatchParticipantsByMatchId(matchId: number) {
  return await MatchParticipantService.getByMatchId(matchId);
}

export async function getMatchParticipantsByTeamId(teamId: string) {
  return await MatchParticipantService.getByTeamId(teamId);
}

export async function getMatchParticipantByMatchAndTeam(matchId: number, teamId: string) {
  return await MatchParticipantService.getByMatchAndTeam(matchId, teamId);
}

// CRUD operations
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

export async function deleteMatchParticipantById(id: number) {
  const result = await MatchParticipantService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/dashboard/matches');
    revalidatePath('/admin/dashboard/schools');
  }

  return result;
}

// Utility actions for specific business logic
export async function getMatchParticipantsWithDetails(matchId: number) {
  return await MatchParticipantService.getMatchParticipantsWithDetails(matchId);
}

export async function getTeamMatchHistory(teamId: string) {
  return await MatchParticipantService.getTeamMatchHistory(teamId);
}

export async function updateMatchScores(
  scoreUpdates: Array<{ match_id: number; team_id: string; match_score: number | null }>
) {
  const result = await MatchParticipantService.updateMatchScores(scoreUpdates);

  if (result.success) {
    // Revalidate relevant paths
    revalidatePath('/admin/dashboard/matches');
    revalidatePath('/admin/dashboard/schools');
    // Also revalidate any match detail pages
    if (scoreUpdates.length > 0) {
      const matchId = scoreUpdates[0].match_id;
      revalidatePath(`/admin/dashboard/matches/${matchId}`);
    }
  }

  return result;
}
