-- ============================================================
-- CESAFI Sports Web — Article View Tracking
-- Adds: track_article_view(), the RPC the trackArticleView action calls.
-- It was never created when the action was ported from CEL, so no view has
-- ever been recorded. Counts one view per viewer per article, published only.
-- Removes: the public insert policy on article_views, which this replaces.
-- No existing row is modified.
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_article_views_article_viewer
  ON public.article_views(article_id, viewer_session);

CREATE OR REPLACE FUNCTION public.track_article_view(p_article_id UUID, p_viewer_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.article_views (article_id, viewer_session)
  SELECT a.id, p_viewer_id::text
  FROM public.articles a
  WHERE a.id = p_article_id
    AND a.status = 'published'
  ON CONFLICT (article_id, viewer_session) DO NOTHING;
$$;

REVOKE ALL ON FUNCTION public.track_article_view(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_article_view(UUID, UUID) TO anon, authenticated;

-- Views are now written only through the function above.
DROP POLICY IF EXISTS "Anyone can record article views" ON public.article_views;
