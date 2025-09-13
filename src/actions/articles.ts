'use server';

import { ArticlePaginationOptions } from '@/lib/types/articles';
import { ArticleService } from '@/services/articles';
import { createArticleSchema, updateArticleSchema } from '@/lib/validations/articles';
import { revalidatePath } from 'next/cache';

export async function getPaginatedArticles(options: ArticlePaginationOptions) {
  return await ArticleService.getPaginated(options);
}

export async function getAllArticles() {
  return await ArticleService.getAll();
}

export async function getArticleById(id: string) {
  return await ArticleService.getById(id);
}

export async function createArticle(data: unknown) {
  // Validate the input data
  const validationResult = createArticleSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await ArticleService.insert(validationResult.data);

  if (result.success) {
    revalidatePath('/admin/dashboard/articles');
    revalidatePath('/articles');
  }

  return result;
}

export async function updateArticleById(data: unknown) {
  // Validate the input data
  const validationResult = updateArticleSchema.safeParse(data);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: validationResult.error.flatten().fieldErrors
    };
  }

  const result = await ArticleService.updateById(validationResult.data);

  if (result.success) {
    revalidatePath('/admin/dashboard/articles');
    revalidatePath('/articles');
    if (validationResult.data.id) {
      revalidatePath(`/articles/${validationResult.data.id}`);
    }
  }

  return result;
}

export async function deleteArticleById(id: string) {
  const result = await ArticleService.deleteById(id);

  if (result.success) {
    revalidatePath('/admin/dashboard/articles');
    revalidatePath('/articles');
  }

  return result;
}