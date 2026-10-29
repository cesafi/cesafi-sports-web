'use server';

import { z } from 'zod';
import { AuthService } from '@/services/auth';
import { StandingsService } from '@/services/standings';
import { SavedStandingsCutoff, SavedTeamStanding, SeasonStandings, StandingsResult } from '@/lib/types/standings';
import {
  standingsSeasonIdSchema,
  updateStandingsCutoffSchema,
  updateTeamStandingSchema
} from '@/lib/validations/standings';
import { RevalidationHelper } from '@/lib/utils/revalidation';

/** Public, read-only: ranked standings for every category with active teams in the season. */
export async function getStandings(seasonId: unknown): Promise<StandingsResult<SeasonStandings>> {
  const parsed = standingsSeasonIdSchema.safeParse(seasonId);
  if (!parsed.success) {
    return { success: false, code: 'VALIDATION', error: 'Invalid season.' };
  }

  return StandingsService.getSeasonStandings(parsed.data);
}

async function checkAdmin(): Promise<StandingsResult<never> | null> {
  const auth = await AuthService.checkAuth(['admin']);
  if (!auth.authenticated) {
    return { success: false, code: 'UNAUTHENTICATED', error: 'You must be signed in to update standings.' };
  }
  if (!auth.authorized) {
    return { success: false, code: 'FORBIDDEN', error: 'You do not have permission to update standings.' };
  }
  return null;
}

/**
 * Saves one team's starting record (wins, losses, +/-). Admin only: checked here and again by
 * row-level security.
 */
export async function updateTeamStanding(input: unknown): Promise<StandingsResult<SavedTeamStanding>> {
  const denied = await checkAdmin();
  if (denied) return denied;

  const parsed = updateTeamStandingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      code: 'VALIDATION',
      error: 'Please fix the highlighted fields.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors
    };
  }

  const result = await StandingsService.saveRecord(parsed.data);

  if (result.success) {
    RevalidationHelper.revalidateStandings();
  }

  return result;
}

/**
 * Sets or clears a category's "starting record covers games through" date. Admin only: checked
 * here and again by row-level security.
 */
export async function updateStandingsCutoff(input: unknown): Promise<StandingsResult<SavedStandingsCutoff>> {
  const denied = await checkAdmin();
  if (denied) return denied;

  const parsed = updateStandingsCutoffSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      code: 'VALIDATION',
      error: 'Please fix the highlighted fields.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors
    };
  }

  const result = await StandingsService.saveCutoff(parsed.data);

  if (result.success) {
    RevalidationHelper.revalidateStandings();
  }

  return result;
}
