'use server';

import { PaginationOptions } from '@/lib/types/base';
import { ArticleInsert, ArticleUpdate } from '@/lib/types/articles';
import { ArticleService } from '@/services/articles';
import { revalidatePath } from 'next/cache';

export async function getPaginatedArticles(options: PaginationOptions) {
  return await ArticleService.getPaginated(options);
}

export async function getAllArticles() {
  return await ArticleService.getAll();
}

export async function getArticleById(id: string) {
  return await ArticleService.getById(id);
}

export async function createArticle(data: ArticleInsert) {
  const result = await ArticleService.insert(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/articles');
    revalidatePath('/articles');
  }

  return result;
}

export async function updateArticleById(data: ArticleUpdate) {
  const result = await ArticleService.updateById(data);

  if (result.success) {
    revalidatePath('/admin/dashboard/articles');
    revalidatePath('/articles');
    if (data.id) {
      revalidatePath(`/articles/${data.id}`);
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