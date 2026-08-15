'use server';

import { getSportStatMappings, updateSportStatMappings } from '@/services/statistics';
import { revalidatePath } from 'next/cache';

export async function getSportStatMappingsAction(sportId: number): Promise<any> {
  try {
    return await getSportStatMappings(sportId);
  } catch (error) {
    return { success: false, error: 'Failed to fetch sport stat mappings' };
  }
}

export async function updateSportStatMappingsAction(
  sportId: number, 
  mappings: Array<{ stat_column: string; label: string }>
): Promise<any> {
  try {
    const result = await updateSportStatMappings(sportId, mappings);
    if (result.success) {
      revalidatePath(`/admin/sports/[slug]/stats`, 'page');
      revalidatePath(`/league-operator/sports/[slug]/stats`, 'page');
    }
    return result;
  } catch (error) {
    return { success: false, error: 'Failed to update sport stat mappings' };
  }
}
