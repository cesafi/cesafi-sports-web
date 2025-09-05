'use server';

import { NewsService, GNewsArticle } from '@/services/news';
import { ServiceResponse } from '@/lib/types/base';

/**
 * Server action to fetch CESAFI news from GNews API
 * Falls back to sample data if API is unavailable or not configured
 */
export async function getCESAFINews(): Promise<ServiceResponse<GNewsArticle[]>> {
  return await NewsService.getCESAFINews();
}
