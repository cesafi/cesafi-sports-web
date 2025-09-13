'use server';

import { NewsService } from '@/services/news';
import { ServiceResponse } from '@/lib/types/base';
import { GNewsArticle } from '@/lib/types/news';

/**
 * Server action to fetch CESAFI news from GNews API
 * Falls back to sample data if API is unavailable or not configured
 */
export async function getCESAFINews(): Promise<ServiceResponse<GNewsArticle[]>> {
  return await NewsService.getCESAFINews();
}
