'use server';

import { SponsorPaginationOptions } from '@/lib/types/sponsors';
import { SponsorService } from '@/services/sponsors';
import { createSponsorSchema, updateSponsorSchema } from '@/lib/validations/sponsors';
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

export async function createSponsor(data: unknown) {
  // Validate the input data
  const validationResult = createSponsorSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await SponsorService.insert(validationResult.data);

  if (result.success) {
    revalidatePath('/admin/sponsors');
  }

  return result;
}

export async function updateSponsorById(data: unknown) {
  // Validate the input data
  const validationResult = updateSponsorSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await SponsorService.updateById(validationResult.data);

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
