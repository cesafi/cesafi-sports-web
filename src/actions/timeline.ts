'use server';

import { PaginationOptions, FilterValue } from '@/lib/types/base';
import { TimelineInsert, TimelineUpdate } from '@/lib/types/timeline';
import { TimelineService } from '@/services/timeline';
import { revalidatePath } from 'next/cache';

export async function getPaginatedTimeline(
  options: PaginationOptions<Record<string, FilterValue>>
) {
  try {
    const result = await TimelineService.getPaginated(options);

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.success === false ? result.error : 'No data returned from service'
      };
    }

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

export async function getAllTimeline() {
  return await TimelineService.getAll();
}

export async function getTimelineById(id: number) {
  return await TimelineService.getById(id);
}

export async function getTimelineHighlights() {
  return await TimelineService.getHighlights();
}

export async function getTimelineByCategory(category: string) {
  return await TimelineService.getByCategory(category);
}

export async function createTimeline(data: TimelineInsert) {
  const result = await TimelineService.insert(data);

  if (result.success) {
    revalidatePath('/admin/timeline');
    revalidatePath('/head-writer/timeline');
    revalidatePath('/about-us');
  }

  return result;
}

export async function updateTimelineById(data: TimelineUpdate) {
  const result = await TimelineService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/timeline');
    revalidatePath('/head-writer/timeline');
    revalidatePath('/about-us');
  }

  return result;
}

export async function deleteTimelineById(id: number) {
  const result = await TimelineService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/timeline');
    revalidatePath('/head-writer/timeline');
    revalidatePath('/about-us');
  }

  return result;
}

export async function reorderTimeline(ids: number[]) {
  const result = await TimelineService.reorderTimeline(ids);

  if (result.success) {
    revalidatePath('/admin/timeline');
    revalidatePath('/head-writer/timeline');
    revalidatePath('/about-us');
  }

  return result;
}

