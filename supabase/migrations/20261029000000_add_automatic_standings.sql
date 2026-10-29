-- ============================================================
-- CESAFI Sports Web — Automatic Standings
-- Adds: team_standings.point_diff (starting +/-) and standings_cutoffs
-- (per category: the last game date already included in starting records).
-- Additive only: no existing row is modified.
-- ============================================================

ALTER TABLE public.team_standings
  ADD COLUMN IF NOT EXISTS point_diff INTEGER NOT NULL DEFAULT 0
  CONSTRAINT team_standings_point_diff_range CHECK (point_diff BETWEEN -9999 AND 9999);

CREATE TABLE IF NOT EXISTS public.standings_cutoffs (
  season_id         INTEGER NOT NULL
                    REFERENCES public.seasons(id) ON UPDATE CASCADE ON DELETE CASCADE,
  sport_category_id INTEGER NOT NULL
                    REFERENCES public.sports_categories(id) ON UPDATE CASCADE ON DELETE CASCADE,
  counted_through   DATE NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (season_id, sport_category_id)
);

-- The team_standings trigger function only sets NEW.updated_at, so it is reused here.
DROP TRIGGER IF EXISTS trigger_standings_cutoffs_updated_at ON public.standings_cutoffs;
CREATE TRIGGER trigger_standings_cutoffs_updated_at
  BEFORE UPDATE ON public.standings_cutoffs
  FOR EACH ROW EXECUTE FUNCTION public.update_team_standings_updated_at();

-- RLS: anyone can read; only admins can write
ALTER TABLE public.standings_cutoffs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view standings cutoffs" ON public.standings_cutoffs;
CREATE POLICY "Public can view standings cutoffs"
  ON public.standings_cutoffs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert standings cutoffs" ON public.standings_cutoffs;
CREATE POLICY "Admins can insert standings cutoffs"
  ON public.standings_cutoffs FOR INSERT TO authenticated
  WITH CHECK (public.user_has_role(ARRAY['admin'::text]));

DROP POLICY IF EXISTS "Admins can update standings cutoffs" ON public.standings_cutoffs;
CREATE POLICY "Admins can update standings cutoffs"
  ON public.standings_cutoffs FOR UPDATE TO authenticated
  USING (public.user_has_role(ARRAY['admin'::text]))
  WITH CHECK (public.user_has_role(ARRAY['admin'::text]));

DROP POLICY IF EXISTS "Admins can delete standings cutoffs" ON public.standings_cutoffs;
CREATE POLICY "Admins can delete standings cutoffs"
  ON public.standings_cutoffs FOR DELETE TO authenticated
  USING (public.user_has_role(ARRAY['admin'::text]));

NOTIFY pgrst, 'reload schema';
