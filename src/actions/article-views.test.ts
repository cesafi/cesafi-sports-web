/** @jest-environment node */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const mockCookies = { get: jest.fn(), set: jest.fn() };
const mockRpc = jest.fn();

jest.mock('next/headers', () => ({ cookies: async () => mockCookies }));
jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServer: async () => ({ rpc: mockRpc })
}));

import { trackArticleView } from './article-views';

const ARTICLE = '3f1c2b7e-4a5d-4e6f-9a1b-2c3d4e5f6a7b';
const VIEWER = '9b2d7c1a-8e3f-4b6a-a5d2-1f0e9c8b7a6d';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

beforeEach(() => {
  jest.clearAllMocks();
  mockCookies.get.mockReturnValue(undefined);
  mockRpc.mockResolvedValue({ error: null });
});

describe('trackArticleView', () => {
  it('records the view under the viewer id from the cookie', async () => {
    mockCookies.get.mockReturnValue({ value: VIEWER });

    expect(await trackArticleView(ARTICLE)).toEqual({ success: true });
    expect(mockRpc).toHaveBeenCalledWith('track_article_view', {
      p_article_id: ARTICLE,
      p_viewer_id: VIEWER
    });
    expect(mockCookies.set).not.toHaveBeenCalled();
  });

  it('gives a first-time viewer a cookie and records the view under that id', async () => {
    expect(await trackArticleView(ARTICLE)).toEqual({ success: true });

    const [name, viewerId, options] = mockCookies.set.mock.calls[0];
    expect(name).toBe('cel_viewer_id');
    expect(viewerId).toMatch(UUID_PATTERN);
    expect(options).toMatchObject({ httpOnly: true, path: '/' });
    expect(mockRpc).toHaveBeenCalledWith('track_article_view', {
      p_article_id: ARTICLE,
      p_viewer_id: viewerId
    });
  });

  it('reports failure when the RPC returns an error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockRpc.mockResolvedValue({ error: { message: 'Could not find the function' } });

    expect(await trackArticleView(ARTICLE)).toEqual({ success: false });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

// The action shipped without this function once, so views silently never counted.
describe('track_article_view migration', () => {
  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
  const migrations = readdirSync(migrationsDir)
    .map((file) => readFileSync(join(migrationsDir, file), 'utf8'))
    .join('\n');

  it('defines the function with the parameter names the action sends', () => {
    expect(migrations).toMatch(
      /CREATE OR REPLACE FUNCTION public\.track_article_view\(p_article_id UUID, p_viewer_id UUID\)/
    );
  });

  it('lets signed-out visitors call it', () => {
    expect(migrations).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.track_article_view\(UUID, UUID\) TO anon, authenticated/
    );
  });
});
