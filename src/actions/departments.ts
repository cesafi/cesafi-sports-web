'use server';

import { PaginationOptions, ServiceResponse } from '@/lib/types/base';
import { DepartmentService } from '@/services/departments';
import { createDepartmentSchema, updateDepartmentSchema } from '@/lib/validations/departments';
import { Department } from '@/lib/types/departments';
// import { revalidatePath } from 'next/cache';
import { RevalidationHelper } from '@/lib/utils/revalidation';

export async function getPaginatedDepartments(options: PaginationOptions) {
  return await DepartmentService.getPaginated(options);
}

export async function getAllDepartments() {
  return await DepartmentService.getAll();
}

export async function getDepartmentById(id: number) {
  return await DepartmentService.getById(id);
}

export async function createDepartment(data: unknown): Promise<ServiceResponse<Department>> {
  // Validate the input data
  const validationResult = createDepartmentSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const result = await DepartmentService.insert(validationResult.data);

  if (result.success) {
    RevalidationHelper.revalidateDepartments();
  }

  return result;
}

export async function updateDepartmentById(data: unknown): Promise<ServiceResponse<Department>> {
  // Validate the input data
  const validationResult = updateDepartmentSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const result = await DepartmentService.updateById(validationResult.data);

  if (result.success) {
    RevalidationHelper.revalidateDepartments();
  }

  return result;
}

export async function deleteDepartmentById(id: number) {
  const result = await DepartmentService.deleteById(id);

  if (result.success) {
    RevalidationHelper.revalidateDepartments();
  }

  return result;
}
