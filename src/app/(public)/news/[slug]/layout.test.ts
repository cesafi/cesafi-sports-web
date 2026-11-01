import { generateMetadata } from './layout';
import { getArticleBySlug } from '@/actions/articles';

jest.mock('@/actions/articles', () => ({ getArticleBySlug: jest.fn() }));

const SITE_URL = 'https://preview.cesafi.org';
const SLUG = 'bc-cheetahs-emerge-on-top';
const ARTICLE_URL = `${SITE_URL}/news/${SLUG}`;
const COVER = 'https://res.cloudinary.com/demo/cover.jpg';

const article = {
  title: 'BC Cheetahs emerge on top',
  cover_image_url: COVER,
  content: {
    root: {
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'The first round has concluded with the Cheetahs on top.' }]
        }
      ]
    }
  }
};

const metadataFor = (overrides = {}) => {
  (getArticleBySlug as jest.Mock).mockResolvedValue({
    success: true,
    data: { ...article, ...overrides }
  });
  return generateMetadata({ params: Promise.resolve({ slug: SLUG }), children: null });
};

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = SITE_URL;
});

afterAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
});

describe('article share metadata', () => {
  it('points the canonical and Open Graph URLs at the article, not the homepage', async () => {
    const metadata = await metadataFor();

    expect(metadata.alternates?.canonical).toBe(ARTICLE_URL);
    expect(metadata.openGraph?.url).toBe(ARTICLE_URL);
  });

  it('gives X a card for this article instead of the site-wide one', async () => {
    const metadata = await metadataFor();

    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: article.title,
      images: [COVER]
    });
  });

  it('describes the article from its own text', async () => {
    const metadata = await metadataFor();

    expect(metadata.description).toContain('The first round has concluded');
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter?.description).toBe(metadata.description);
  });

  it('falls back to the site banner when the article has no cover image', async () => {
    const metadata = await metadataFor({ cover_image_url: null });

    expect(metadata.openGraph?.images).toEqual([{ url: '/img/cesafi-banner.jpg' }]);
    expect(metadata.twitter).toMatchObject({ images: ['/img/cesafi-banner.jpg'] });
  });
});
