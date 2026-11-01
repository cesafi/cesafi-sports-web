/**
 * @jest-environment node
 */
import type { Metadata } from 'next';
import { getMatchByIdWithFullDetails } from '@/actions/matches';
import { getPlayerBySlug } from '@/actions/players';
import { getSchoolByAbbreviation } from '@/actions/schools';

jest.mock('@/actions/matches', () => ({ getMatchByIdWithFullDetails: jest.fn() }));
jest.mock('@/actions/players', () => ({ getPlayerBySlug: jest.fn() }));
jest.mock('@/actions/schools', () => ({ getSchoolByAbbreviation: jest.fn() }));

describe('site-wide metadata', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://preview.cesafi.org';
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it('gives pages no homepage URL to inherit', async () => {
    const { metadata } = await import('../metadata');

    expect(metadata.alternates?.canonical).toBeUndefined();
    expect((metadata.openGraph as { url?: unknown })?.url).toBeUndefined();
  });
});

describe('page canonicals', () => {
  it.each<[string, () => Promise<{ metadata: Metadata }>, string]>([
    ['the homepage', () => import('./page'), '/'],
    ['about us', () => import('./about-us/layout'), '/about-us'],
    ['contact', () => import('./contact/page'), '/contact'],
    ['faq', () => import('./faq/page'), '/faq'],
    ['news', () => import('./news/page'), '/news'],
    ['players', () => import('./players/page'), '/players'],
    ['privacy policy', () => import('./privacy-policy/page'), '/privacy-policy'],
    ['schedule', () => import('./schedule/page'), '/schedule'],
    ['schools', () => import('./schools/page'), '/schools'],
    ['sponsors', () => import('./sponsors/page'), '/sponsors'],
    ['standings', () => import('./standings/page'), '/standings'],
    ['statistics', () => import('./statistics/page'), '/statistics'],
    ['terms of service', () => import('./terms-of-service/page'), '/terms-of-service'],
    ['volunteers', () => import('./volunteers/page'), '/volunteers']
  ])('points %s at its own URL', async (_label, load, canonical) => {
    const { metadata } = await load();

    expect(metadata.alternates?.canonical).toBe(canonical);
  });

  it('shares the homepage under its own URL rather than the old Vercel host', async () => {
    const { metadata } = await import('./page');

    expect((metadata.openGraph as { url?: unknown })?.url).toBe('/');
  });

  it('points a match at its numeric ID', async () => {
    (getMatchByIdWithFullDetails as jest.Mock).mockResolvedValue({ success: true, data: {} });
    const { generateMetadata } = await import('./matches/[matchId]/page');

    const metadata = await generateMetadata({ params: Promise.resolve({ matchId: '007' }) });

    expect(metadata.alternates?.canonical).toBe('/matches/7');
  });

  it('points a player at their slug', async () => {
    (getPlayerBySlug as jest.Mock).mockResolvedValue({
      success: true,
      data: { first_name: 'Ana', last_name: 'Reyes' }
    });
    const { generateMetadata } = await import('./players/[playerSlug]/page');

    const metadata = await generateMetadata({ params: Promise.resolve({ playerSlug: 'ana-reyes' }) });

    expect(metadata.alternates?.canonical).toBe('/players/ana-reyes');
  });

  it('points every casing of a school URL at the lowercase one the site links to', async () => {
    (getSchoolByAbbreviation as jest.Mock).mockResolvedValue({
      success: true,
      data: { name: 'University of San Carlos', abbreviation: 'USC' }
    });
    const { generateMetadata } = await import('./schools/[slug]/page');

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'UsC' }) });

    expect(metadata.alternates?.canonical).toBe('/schools/usc');
  });

  it('points every casing of a team URL at the lowercase one the site links to', async () => {
    (getSchoolByAbbreviation as jest.Mock).mockResolvedValue({
      success: true,
      data: { name: 'University of San Carlos', abbreviation: 'USC' }
    });
    const { generateMetadata } = await import('./schools/[slug]/teams/[teamSlug]/page');

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'USC', teamSlug: 'Season-1-Warriors' })
    });

    expect(metadata.alternates?.canonical).toBe('/schools/usc/teams/season-1-warriors');
  });

  it.each([
    ['match', () => import('./matches/[matchId]/page'), { matchId: '7' }, getMatchByIdWithFullDetails],
    ['player', () => import('./players/[playerSlug]/page'), { playerSlug: 'nobody' }, getPlayerBySlug],
    ['school', () => import('./schools/[slug]/page'), { slug: 'nope' }, getSchoolByAbbreviation]
  ])('gives a missing %s no canonical', async (_label, load, params, lookup) => {
    (lookup as jest.Mock).mockResolvedValue({ success: false, error: 'Not found' });
    const { generateMetadata } = (await load()) as unknown as {
      generateMetadata: (props: { params: Promise<typeof params> }) => Promise<Metadata>;
    };

    const metadata = await generateMetadata({ params: Promise.resolve(params) });

    expect(metadata.alternates).toBeUndefined();
  });
});
