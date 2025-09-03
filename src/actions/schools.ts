'use server';

import { PaginationOptions, FilterValue } from '@/lib/types/base';
import { SchoolInsert, SchoolUpdate } from '@/lib/types/schools';
import { SchoolService } from '@/services/schools';
import { revalidatePath } from 'next/cache';



export async function getPaginatedSchools(options: PaginationOptions<Record<string, FilterValue>>) {
  try {
    const result = await SchoolService.getPaginated(options);
    
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

export async function getAllSchools() {
  return await SchoolService.getAll();
}

export async function getSchoolById(id: string) {
  return await SchoolService.getById(id);
}

export async function createSchool(data: SchoolInsert) {
  const result = await SchoolService.insert(data);

  if (result.success) {
    revalidatePath('/admin/schools');
  }

  return result;
}

export async function updateSchoolById(data: SchoolUpdate) {
  const result = await SchoolService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/schools');
  }

  return result;
}

export async function deleteSchoolById(id: string) {
  const result = await SchoolService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/schools');
  }

  return result;
}
