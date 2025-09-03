'use server';

import { PaginationOptions } from '@/lib/types/base';
import { DepartmentInsert, DepartmentUpdate } from '@/lib/types/departments';
import { DepartmentService } from '@/services/departments';
import { revalidatePath } from 'next/cache';

export async function getPaginatedDepartments(options: PaginationOptions) {
  return await DepartmentService.getPaginated(options);
}

export async function getAllDepartments() {
  return await DepartmentService.getAll();
}

export async function getDepartmentById(id: number) {
  return await DepartmentService.getById(id);
}

export async function createDepartment(data: DepartmentInsert) {
  const result = await DepartmentService.insert(data);

  if (result.success) {
    revalidatePath('/admin/departments');
  }

  return result;
}

export async function updateDepartmentById(data: DepartmentUpdate) {
  const result = await DepartmentService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/departments');
  }

  return result;
}

export async function deleteDepartmentById(id: number) {
  const result = await DepartmentService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/departments');
  }

  return result;
}
