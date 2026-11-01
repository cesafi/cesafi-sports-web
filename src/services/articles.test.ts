/** @jest-environment node */
import { getTableColumns } from 'drizzle-orm';
import { articles } from '@/db/schema';

const mockQueries: string[] = [];
let mockRows: unknown[][] = [];

// Real Drizzle over a fake driver, so these tests see the SQL that would be sent.
jest.mock('./base', () => {
  const { drizzle } = jest.requireActual('drizzle-orm/postgres-js');
  const client = {
    options: { parsers: {}, serializers: {} },
    unsafe: (query: string) => {
      mockQueries.push(query);
      return { values: async () => mockRows };
    }
  };
  const db = drizzle({ client });

  return {
    BaseService: class {
      static getDrizzle() {
        return db;
      }
      static formatError(_err: unknown, message: string) {
        return { success: false, error: message };
      }
    }
  };
});

import { ArticleService } from './articles';

const ARTICLE: Record<string, unknown> = {
  id: '3f1c2b7e-4a5d-4e6f-9a1b-2c3d4e5f6a7b',
  created_at: '2026-10-01T00:00:00+00:00',
  updated_at: '2026-10-01T00:00:00+00:00',
  title: 'Finals recap',
  content: {},
  cover_image_url: '/cover.jpg',
  published_at: '2026-10-01T00:00:00+00:00',
  status: 'published',
  authored_by: 'CESAFI Media Team',
  slug: 'finals-recap'
};

// A row as the driver returns it: positional, with the count last and as a bigint string.
const rowWithViews = (views: string) => [
  ...Object.keys(getTableColumns(articles)).map((column) => ARTICLE[column]),
  views
];

beforeEach(() => {
  mockQueries.length = 0;
  mockRows = [];
});

describe('ArticleService.getBySlug', () => {
  it('returns the view count as a number alongside the article', async () => {
    mockRows = [rowWithViews('7')];

    expect(await ArticleService.getBySlug('finals-recap')).toEqual({
      success: true,
      data: { ...ARTICLE, view_count: 7 }
    });
  });

  it('counts views of this article only', async () => {
    mockRows = [rowWithViews('0')];

    await ArticleService.getBySlug('finals-recap');

    // Unqualified names here would compare article_views to itself and always count 0.
    expect(mockQueries[0]).toContain('"article_views"."article_id" = "articles"."id"');
  });

  it('still only finds published articles', async () => {
    await ArticleService.getBySlug('finals-recap');

    expect(mockQueries[0]).toContain('"articles"."status" = $');
  });
});
