'use server';

import { AuthService } from '@/services/auth';
import { MatchImportService } from '@/services/match-import';
import { MatchImportResponse } from '@/lib/types/match-import';
import { importMatchesInputSchema } from '@/lib/validations/match-import';
import { RevalidationHelper } from '@/lib/utils/revalidation';

/**
 * Bulk-creates matches from a CSV for one league stage. Admin only: the import writes through
 * Drizzle, which bypasses row-level security, so the role is enforced here.
 */
export async function importMatchesFromCsv(stageId: unknown, csvText: unknown): Promise<MatchImportResponse> {
  const auth = await AuthService.checkAuth(['admin']);
  if (!auth.authenticated) {
    return { success: false, error: 'You must be signed in to import matches.' };
  }
  if (!auth.authorized) {
    return { success: false, error: 'You do not have permission to import matches.' };
  }

  const input = importMatchesInputSchema.safeParse({ stageId, csvText });
  if (!input.success) {
    return { success: false, error: 'Invalid import request.' };
  }

  const result = await MatchImportService.importFromCsv(input.data.stageId, input.data.csvText);

  if (result.success) {
    RevalidationHelper.revalidateMatches();
  }

  return result;
}
