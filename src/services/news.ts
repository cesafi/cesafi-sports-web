import { ServiceResponse } from '@/lib/types/base';

// GNews API types
export interface GNewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  lang: string;
  source: {
    id: string;
    name: string;
    url: string;
    country: string;
  };
}

export class NewsService {
  private static readonly CESAFI_KEYWORDS = [
    'cesafi',
    'cebu schools athletic foundation',
    'cebu schools athletic foundation, inc.',
    'cebu schools athletic foundation, inc'
  ];

  private static getSampleNews(): GNewsArticle[] {
    return [
      {
        id: 'sample-1',
        title: 'CESAFI Basketball Championship Reaches New Heights',
        description: 'The 2024 CESAFI basketball season showcases record-breaking attendance and exceptional athletic performance across all divisions.',
        content: 'The Cebu Schools Athletic Foundation Inc. (CESAFI) basketball championship has reached unprecedented heights this season. With record-breaking attendance and exceptional athletic performance across all divisions, the tournament continues to set new standards for collegiate sports in Cebu.',
        url: '#',
        image: '/img/cesafi-banner.jpg',
        publishedAt: '2024-01-15T00:00:00.000Z',
        lang: 'en',
        source: {
          id: 'sample-1',
          name: 'Cebu Daily News',
          url: 'https://cebudailynews.inquirer.net',
          country: 'ph'
        }
      },
      {
        id: 'sample-2',
        title: 'University of San Carlos Dominates Volleyball Finals',
        description: 'USC Warriors secure their third consecutive volleyball championship with a thrilling victory over University of Cebu.',
        content: 'The University of San Carlos Warriors have once again proven their dominance in CESAFI volleyball, securing their third consecutive championship with a thrilling victory over University of Cebu. The match showcased exceptional skill and determination from both teams.',
        url: '#',
        image: '/img/cesafi-banner.jpg',
        publishedAt: '2024-01-12T00:00:00.000Z',
        lang: 'en',
        source: {
          id: 'sample-2',
          name: 'SunStar Cebu',
          url: 'https://www.sunstar.com.ph/cebu',
          country: 'ph'
        }
      },
      {
        id: 'sample-3',
        title: 'CESAFI Announces New Partnership with Sports Brands',
        description: 'Major sports equipment manufacturers join forces with CESAFI to provide better training resources for student-athletes.',
        content: 'CESAFI has announced a groundbreaking partnership with leading sports equipment manufacturers to provide better training resources for student-athletes. This collaboration aims to enhance the quality of sports programs across member schools.',
        url: '#',
        image: '/img/cesafi-banner.jpg',
        publishedAt: '2024-01-10T00:00:00.000Z',
        lang: 'en',
        source: {
          id: 'sample-3',
          name: 'The Freeman',
          url: 'https://www.thefreeman.net',
          country: 'ph'
        }
      },
      {
        id: 'sample-4',
        title: 'Cebu Sports Complex Upgrades Facilities for CESAFI',
        description: 'State-of-the-art training facilities and upgraded courts are now available for all CESAFI member schools.',
        content: 'The Cebu Sports Complex has completed major upgrades to better serve CESAFI member schools. State-of-the-art training facilities and upgraded courts are now available, providing student-athletes with world-class training environments.',
        url: '#',
        image: '/img/cesafi-banner.jpg',
        publishedAt: '2024-01-08T00:00:00.000Z',
        lang: 'en',
        source: {
          id: 'sample-4',
          name: 'Cebu News',
          url: 'https://cebunews.net',
          country: 'ph'
        }
      },
      {
        id: 'sample-5',
        title: 'Student-Athletes Excel in Academic Performance',
        description: 'CESAFI student-athletes maintain high academic standards while competing at the highest level of sports.',
        content: 'CESAFI student-athletes continue to excel both on the field and in the classroom. The organization maintains high academic standards while supporting competitive sports, ensuring well-rounded development for all participants.',
        url: '#',
        image: '/img/cesafi-banner.jpg',
        publishedAt: '2024-01-05T00:00:00.000Z',
        lang: 'en',
        source: {
          id: 'sample-5',
          name: 'Cebu Daily News',
          url: 'https://cebudailynews.inquirer.net',
          country: 'ph'
        }
      },
      {
        id: 'sample-6',
        title: 'CESAFI Football Tournament Breaks Attendance Records',
        description: 'The annual football championship attracts thousands of spectators, showcasing the growing popularity of the sport.',
        content: 'The CESAFI football tournament has broken all previous attendance records this season. The annual championship attracts thousands of spectators, showcasing the growing popularity of football in Cebu and the Philippines.',
        url: '#',
        image: '/img/cesafi-banner.jpg',
        publishedAt: '2024-01-03T00:00:00.000Z',
        lang: 'en',
        source: {
          id: 'sample-6',
          name: 'SunStar Cebu',
          url: 'https://www.sunstar.com.ph/cebu',
          country: 'ph'
        }
      }
    ];
  }

  static async getCESAFINews(): Promise<ServiceResponse<GNewsArticle[]>> {
    try {
      // Get API key from server environment (never exposed to client)
      // Make sure to set GNEWS_API_KEY in your .env.local file
      const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
      
      // Check if API key is configured
      if (!GNEWS_API_KEY || GNEWS_API_KEY === 'your-api-key-here' || GNEWS_API_KEY.trim() === '') {
        return { success: true, data: this.getSampleNews() };
      }

      // Use direct fetch to ensure correct API usage according to GNews documentation
      const query = 'CESAFI OR "Cebu Schools Athletic Foundation"';
      const apiUrl = new URL('https://gnews.io/api/v4/search');
      
      // Add required parameters according to GNews API specification
      apiUrl.searchParams.set('q', query);
      apiUrl.searchParams.set('lang', 'en');
      apiUrl.searchParams.set('country', 'ph');
      apiUrl.searchParams.set('max', '10');
      apiUrl.searchParams.set('sortby', 'publish-time');
      apiUrl.searchParams.set('token', GNEWS_API_KEY);
      
      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 86400 } // Cache for 1 day (86400 seconds)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();

      if (!data.articles || data.articles.length === 0) {
        return { success: true, data: this.getSampleNews() };
      }

      // Filter and map articles to our interface
      const filteredArticles = data.articles
        .filter((article: any) => {
          const title = article.title?.toLowerCase() || '';
          const description = article.description?.toLowerCase() || '';
          const content = article.content?.toLowerCase() || '';
          
          // Check if article contains CESAFI-related keywords (case-insensitive)
          return this.CESAFI_KEYWORDS.some(keyword => 
            title.includes(keyword) ||
            description.includes(keyword) ||
            content.includes(keyword)
          );
        })
        .slice(0, 6) // Limit to 6 articles
        .map((article: any, index: number) => ({
          id: `gnews-${index + 1}`,
          title: article.title || 'CESAFI News Update',
          description: article.description || 'Latest news from CESAFI',
          content: article.content || article.description || 'Read more about this CESAFI update.',
          url: article.url || '#',
          image: article.image || '/img/cesafi-banner.jpg',
          publishedAt: article.publishedAt || new Date().toISOString(),
          lang: 'en', // GNews doesn't provide lang per article
          source: {
            id: `source-${index + 1}`, // GNews doesn't provide source.id
            name: article.source?.name || 'CESAFI News',
            url: article.source?.url || 'https://cesafi.org',
            country: 'ph' // GNews doesn't provide source.country
          }
        }));

      // If no relevant articles found, use sample data
      if (filteredArticles.length === 0) {
        return { success: true, data: this.getSampleNews() };
      }

      return { success: true, data: filteredArticles };
    } catch (error) {
      return { success: true, data: this.getSampleNews() };
    }
  }
}