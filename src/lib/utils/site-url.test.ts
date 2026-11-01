import { getShareIntentUrl } from './site-url';

const ARTICLE_URL = 'https://preview.cesafi.org/news/bc-cheetahs-emerge-on-top';

describe('getShareIntentUrl', () => {
  it('builds an X post carrying the article title and URL', () => {
    const intent = new URL(getShareIntentUrl('x', 'BC Cheetahs & Co', ARTICLE_URL));

    expect(`${intent.origin}${intent.pathname}`).toBe('https://x.com/intent/post');
    expect(intent.searchParams.get('text')).toBe('BC Cheetahs & Co');
    expect(intent.searchParams.get('url')).toBe(ARTICLE_URL);
  });

  it('shortens long titles so the X post stays under the character limit', () => {
    const intent = new URL(getShareIntentUrl('x', 'A'.repeat(300), ARTICLE_URL));

    expect(intent.searchParams.get('text')).toBe(`${'A'.repeat(200)}...`);
  });

  it('builds a Facebook share dialog for the article URL', () => {
    const intent = new URL(getShareIntentUrl('facebook', 'Ignored title', ARTICLE_URL));

    expect(`${intent.origin}${intent.pathname}`).toBe('https://www.facebook.com/sharer/sharer.php');
    expect(intent.searchParams.get('u')).toBe(ARTICLE_URL);
  });
});
