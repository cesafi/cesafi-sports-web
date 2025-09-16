'use server';

import { SponsorPaginationOptions } from '@/lib/types/sponsors';
import { SponsorService } from '@/services/sponsors';
import { createSponsorSchema, updateSponsorSchema } from '@/lib/validations/sponsors';
import { RevalidationHelper } from '@/lib/utils/revalidation';
import { ServiceResponse } from '@/lib/types/base';

export async function getPaginatedSponsors(options: SponsorPaginationOptions) {
  try {
    const result = await SponsorService.getPaginated(options);
    
    if (!result.success || !result.data) {
      return { 
        success: false, 
        error: result.success === false ? result.error : 'No data returned from service' 
      };
    }

    // Transform the data to match the expected format
    return {
      success: true,
      data: {
        data: result.data.data,
        totalCount: result.data.totalCount,
        pageCount: result.data.pageCount,
        currentPage: result.data.currentPage
      }
    };
  } catch {
    return { 
      success: false, 
      error: 'Unknown error occurred' 
    };
  }
}

export async function getAllSponsors() {
  return await SponsorService.getAll();
}

export async function getActiveSponsors() {
  return await SponsorService.getActiveSponsors();
}

export async function getSponsorById(id: string) {
  return await SponsorService.getById(id);
}

export async function createSponsor(data: unknown): Promise<ServiceResponse<undefined>> {
  // Validate the input data
  const validationResult = createSponsorSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const result = await SponsorService.insert(validationResult.data);

  if (result.success) {
    RevalidationHelper.revalidateSponsors();
  }

  return result;
}

export async function updateSponsorById(data: unknown): Promise<ServiceResponse<undefined>> {
  // Validate the input data
  const validationResult = updateSponsorSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const result = await SponsorService.updateById(validationResult.data);

  if (result.success) {
    RevalidationHelper.revalidateSponsors();
  }

  return result;
}

export async function deleteSponsorById(id: string) {
  const result = await SponsorService.deleteById(id);

  if (result.success) {
    RevalidationHelper.revalidateSponsors();
  }

  return result;
}

