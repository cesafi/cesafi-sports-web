'use server';

import { PaginationOptions } from '@/lib/types/base';
import { DepartmentService } from '@/services/departments';
import { createDepartmentSchema, updateDepartmentSchema } from '@/lib/validations/departments';
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

export async function createDepartment(data: unknown) {
  // Validate the input data
  const validationResult = createDepartmentSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await DepartmentService.insert(validationResult.data);

  if (result.success) {
    revalidatePath('/admin/departments');
  }

  return result;
}

export async function updateDepartmentById(data: unknown) {
  // Validate the input data
  const validationResult = updateDepartmentSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await DepartmentService.updateById(validationResult.data);

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
