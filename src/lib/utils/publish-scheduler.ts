/**
 * Simple publish scheduler utility
 * This can be called periodically (e.g., via a cron job or API route)
 * to check for articles that should be published
 */

import { ArticleService } from '@/services/articles';

export async function checkAndPublishScheduledArticles() {
  try {
    // Get all articles scheduled for publishing
    const result = await ArticleService.getScheduledForPublishing();
    
    if (!result.success || !result.data) {
      console.error('Failed to fetch articles for publishing check');
      return;
    }

    const articlesToPublish = result.data;

    // Update each article to 'published' status
    for (const article of articlesToPublish) {
      await ArticleService.updateById({
        id: article.id,
        status: 'published'
      });
      
      console.log(`Published article: ${article.title}`);
    }

    if (articlesToPublish.length > 0) {
      console.log(`Successfully published ${articlesToPublish.length} articles`);
    }

  } catch (error) {
    console.error('Error in publish scheduler:', error);
  }
}

/**
 * API route handler for the publish scheduler
 * This can be called by a cron service like Vercel Cron or similar
 */
export async function handlePublishScheduler() {
  await checkAndPublishScheduledArticles();
  return { success: true, message: 'Publish check completed' };
}
