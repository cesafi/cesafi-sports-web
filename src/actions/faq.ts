'use server';

import { revalidatePath } from 'next/cache';
import { FaqService } from '@/services/faq';
import { FaqInsert, FaqUpdate, FaqPaginationOptions } from '@/lib/types/faq';
import { createFaqSchema, updateFaqSchema } from '@/lib/validations/faq';

/**
 * Get paginated FAQ items
 */
export async function getPaginatedFaq(options: FaqPaginationOptions) {
  try {
    const result = await FaqService.getPaginated(options);
    return result;
  } catch (error) {
    console.error('Error fetching paginated FAQ:', error);
    return { success: false, error: 'Failed to fetch FAQ items' };
  }
}

/**
 * Get all FAQ items (for public display)
 */
export async function getAllFaq() {
  try {
    const faqItems = await FaqService.getAll();
    return { success: true, data: faqItems };
  } catch (error) {
    console.error('Error fetching all FAQ:', error);
    return { success: false, error: 'Failed to fetch FAQ items' };
  }
}

/**
 * Get FAQ by ID
 */
export async function getFaqById(id: number) {
  try {
    const faq = await FaqService.getById(id);
    if (!faq) {
      return { success: false, error: 'FAQ item not found' };
    }
    return { success: true, data: faq };
  } catch (error) {
    console.error('Error fetching FAQ by ID:', error);
    return { success: false, error: 'Failed to fetch FAQ item' };
  }
}

/**
 * Create new FAQ item
 */
export async function createFaq(data: FaqInsert) {
  try {
    // Validate input
    const validatedData = createFaqSchema.parse(data);
    
    const faq = await FaqService.insert(validatedData);
    
    // Revalidate relevant paths
    revalidatePath('/admin/faq');
    revalidatePath('/head-writer/faq');
    revalidatePath('/about-us');
    
    return { success: true, data: faq };
  } catch (error) {
    console.error('Error creating FAQ:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create FAQ item' };
  }
}

/**
 * Update FAQ item
 */
export async function updateFaq(id: number, data: FaqUpdate) {
  try {
    // Validate input
    const validatedData = updateFaqSchema.parse(data);
    
    const faq = await FaqService.updateById(id, validatedData);
    
    // Revalidate relevant paths
    revalidatePath('/admin/faq');
    revalidatePath('/head-writer/faq');
    revalidatePath('/about-us');
    
    return { success: true, data: faq };
  } catch (error) {
    console.error('Error updating FAQ:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update FAQ item' };
  }
}

/**
 * Delete FAQ item
 */
export async function deleteFaq(id: number) {
  try {
    await FaqService.deleteById(id);
    
    // Revalidate relevant paths
    revalidatePath('/admin/faq');
    revalidatePath('/head-writer/faq');
    revalidatePath('/about-us');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return { success: false, error: 'Failed to delete FAQ item' };
  }
}

/**
 * Reorder FAQ items
 */
export async function reorderFaq(faqIds: number[]) {
  try {
    await FaqService.reorderFaq(faqIds);
    
    // Revalidate relevant paths
    revalidatePath('/admin/faq');
    revalidatePath('/head-writer/faq');
    revalidatePath('/about-us');
    
    return { success: true };
  } catch (error) {
    console.error('Error reordering FAQ:', error);
    return { success: false, error: 'Failed to reorder FAQ items' };
  }
}
