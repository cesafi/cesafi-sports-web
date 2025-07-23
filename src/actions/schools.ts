'use server';

import { PaginationOptions } from '@/lib/types/base';
import { SchoolInsert, SchoolUpdate } from '@/lib/types/schools';
import { SchoolService } from '@/services/schools';
import { revalidatePath } from 'next/cache';

export async function getPaginatedSchools(options: PaginationOptions) {
  return await SchoolService.getPaginated(options);
}

export async function getAllSchools() {
  return await SchoolService.getAll();
}

export async function getSchoolById(id: string) {
  return await SchoolService.getById(id);
}

export async function createSchool(data: SchoolInsert) {
  const result = await SchoolService.insert(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/schools');
  }

  return result;
}

export async function updateSchoolById(data: SchoolUpdate) {
  const result = await SchoolService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/schools');
  }

  return result;
}

export async function deleteSchoolById(id: string) {
  const result = await SchoolService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/dashboard/schools');
  }

  return result;
}
