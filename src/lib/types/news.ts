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

// GNews API response types
export interface GNewsApiArticle {
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  lang?: string;
  source?: {
    id?: string;
    name?: string;
    url?: string;
    country?: string;
  };
}

export interface GNewsApiResponse {
  articles: GNewsApiArticle[];
  totalArticles: number;
}
