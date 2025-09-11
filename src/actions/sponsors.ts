'use server';

import { SponsorInsert, SponsorUpdate, SponsorPaginationOptions } from '@/lib/types/sponsors';
import { SponsorService } from '@/services/sponsors';
import { revalidatePath } from 'next/cache';

export async function getPaginatedSponsors(options: SponsorPaginationOptions) {
  return await SponsorService.getPaginated(options);
}

export async function getAllSponsors() {
  return await SponsorService.getAll();
}

export async function getActiveSponsors() {
  return await SponsorService.getActive();
}

export async function getSponsorById(id: string) {
  return await SponsorService.getById(id);
}

export async function createSponsor(data: SponsorInsert) {
  const result = await SponsorService.insert(data);

  if (result.success) {
    revalidatePath('/admin/sponsors');
  }

  return result;
}

export async function updateSponsorById(data: SponsorUpdate) {
  const result = await SponsorService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/sponsors');
  }

  return result;
}

export async function deleteSponsorById(id: string) {
  const result = await SponsorService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/sponsors');
  }

  return result;
}
