import { ServiceResponse } from '@/lib/types/base';
import { GNewsArticle, GNewsApiArticle } from '@/lib/types/news';

export class NewsService {
  private static readonly CESAFI_KEYWORDS = [
    'cesafi',
    'cebu schools athletic foundation',
    'cebu schools athletic foundation, inc.',
    'cebu schools athletic foundation, inc'
  ];

  static async getCESAFINews(): Promise<ServiceResponse<GNewsArticle[]>> {
    try {
      const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

      if (!GNEWS_API_KEY || GNEWS_API_KEY === 'your-api-key-here' || GNEWS_API_KEY.trim() === '') {
        return { 
          success: false, 
          error: 'GNews API key is not configured. Please set GNEWS_API_KEY in your environment variables.' 
        };
      }

      const query = 'CESAFI OR "Cebu Schools Athletic Foundation"';
      const apiUrl = new URL('https://gnews.io/api/v4/search');

      apiUrl.searchParams.set('q', query);
      apiUrl.searchParams.set('lang', 'en');
      apiUrl.searchParams.set('country', 'ph');
      apiUrl.searchParams.set('max', '10');
      apiUrl.searchParams.set('sortby', 'publish-time');
      apiUrl.searchParams.set('token', GNEWS_API_KEY);

      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        },
        next: { revalidate: 86400 } // Cache for 1 day
      });

      if (!response.ok) {
        throw new Error(`GNews API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.articles || data.articles.length === 0) {
        return { success: true, data: [] };
      }

      const filteredArticles = data.articles
        .filter((article: GNewsApiArticle) => {
          const title = article.title?.toLowerCase() || '';
          const description = article.description?.toLowerCase() || '';
          const content = article.content?.toLowerCase() || '';

          return this.CESAFI_KEYWORDS.some(
            (keyword) =>
              title.includes(keyword) || description.includes(keyword) || content.includes(keyword)
          );
        })
        .slice(0, 6)
        .map((article: GNewsApiArticle, index: number) => ({
          id: `gnews-${index + 1}`,
          title: article.title || 'CESAFI News Update',
          description: article.description || 'Latest news from CESAFI',
          content: article.content || article.description || 'Read more about this CESAFI update.',
          url: article.url || '#',
          image: article.image || '/img/cesafi-banner.jpg',
          publishedAt: article.publishedAt || new Date().toISOString(),
          lang: 'en',
          source: {
            id: `source-${index + 1}`,
            name: article.source?.name || 'CESAFI News',
            url: article.source?.url || 'https://cesafi.org',
            country: 'ph'
          }
        }));

      return { success: true, data: filteredArticles };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to fetch CESAFI news: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}
