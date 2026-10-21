-- ============================================================
-- CESAFI Sports Web — Team Standings
-- Adds: team_standings (manual season win/loss totals per team)
-- Additive only: no existing table or row is modified.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.team_standings (
  team_id    UUID PRIMARY KEY
             REFERENCES public.schools_teams(id) ON UPDATE CASCADE ON DELETE CASCADE,
  wins       INTEGER NOT NULL DEFAULT 0 CONSTRAINT team_standings_wins_non_negative CHECK (wins >= 0),
  losses     INTEGER NOT NULL DEFAULT 0 CONSTRAINT team_standings_losses_non_negative CHECK (losses >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at (also used as the optimistic-concurrency token)
CREATE OR REPLACE FUNCTION public.update_team_standings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_team_standings_updated_at ON public.team_standings;
CREATE TRIGGER trigger_team_standings_updated_at
  BEFORE UPDATE ON public.team_standings
  FOR EACH ROW EXECUTE FUNCTION public.update_team_standings_updated_at();

-- RLS: anyone can read; only admins can write
ALTER TABLE public.team_standings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view team standings" ON public.team_standings;
CREATE POLICY "Public can view team standings"
  ON public.team_standings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert team standings" ON public.team_standings;
CREATE POLICY "Admins can insert team standings"
  ON public.team_standings FOR INSERT TO authenticated
  WITH CHECK (public.user_has_role(ARRAY['admin'::text]));

DROP POLICY IF EXISTS "Admins can update team standings" ON public.team_standings;
CREATE POLICY "Admins can update team standings"
  ON public.team_standings FOR UPDATE TO authenticated
  USING (public.user_has_role(ARRAY['admin'::text]))
  WITH CHECK (public.user_has_role(ARRAY['admin'::text]));

DROP POLICY IF EXISTS "Admins can delete team standings" ON public.team_standings;
CREATE POLICY "Admins can delete team standings"
  ON public.team_standings FOR DELETE TO authenticated
  USING (public.user_has_role(ARRAY['admin'::text]));

-- Make the new table visible to the Supabase REST API immediately
NOTIFY pgrst, 'reload schema';
