'use server';

import { VolunteersPaginationOptions } from '@/lib/types/volunteers';
import { VolunteerService } from '@/services/volunteers';
import { createVolunteerSchema, updateVolunteerSchema } from '@/lib/validations/volunteers';
import { revalidatePath } from 'next/cache';

export async function getPaginatedVolunteers(options: VolunteersPaginationOptions) {
  return await VolunteerService.getPaginated(options);
}

export async function getAllVolunteers() {
  return await VolunteerService.getAll();
}

export async function getVolunteerById(id: string) {
  return await VolunteerService.getById(id);
}

export async function createVolunteer(data: unknown) {
  // Validate the input data
  const validationResult = createVolunteerSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await VolunteerService.insert(validationResult.data);
  if (result.success) {
    revalidatePath('/admin/volunteers');
  }
  return result;
}

export async function updateVolunteerById(data: unknown) {
  // Validate the input data
  const validationResult = updateVolunteerSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await VolunteerService.updateById(validationResult.data);
  if (result.success) {
    revalidatePath('/admin/volunteers');
  }
  return result;
}

export async function deleteVolunteerById(id: string) {
  const result = await VolunteerService.deleteById(id);
  if (result.success) {
    revalidatePath('/admin/volunteers');
  }
  return result;
}
