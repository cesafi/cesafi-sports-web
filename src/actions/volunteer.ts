'use server';

import { VolunteersPaginationOptions } from '@/lib/types/volunteers';
import { VolunteerInsert, VolunteerUpdate } from '@/lib/types/volunteers';
import { VolunteerService } from '@/services/volunteers';
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

export async function getVolunteersByDepartment(department: string) {
  return await VolunteerService.getByDepartment(department);
}

export async function getVolunteerDepartments() {
  return await VolunteerService.getDepartments();
}

export async function createVolunteer(data: VolunteerInsert) {
  const result = await VolunteerService.insert(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/volunteers');
  }

  return result;
}

export async function updateVolunteerById(data: VolunteerUpdate) {
  const result = await VolunteerService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/volunteers');
  }

  return result;
}

export async function deleteVolunteerById(id: string) {
  const result = await VolunteerService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/dashboard/volunteers');
  }

  return result;
}
