-- ============================================================
-- CESAFI Sports Web — New Tables Migration
-- Adds: article_views, players, player_seasons, game_stats
-- Sports-adapted from cel-web's esports features
-- ============================================================

-- ============================================================
-- 1. article_views — track article page views
-- ============================================================
CREATE TABLE IF NOT EXISTS public.article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  viewer_session TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast view count queries by article
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON public.article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at ON public.article_views(viewed_at);

-- RLS: anyone can insert a view, only admins can read
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record article views"
  ON public.article_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read article views"
  ON public.article_views FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- 2. players — sports athletes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  player_number INTEGER,
  position TEXT,  -- Sport-specific position: "Point Guard", "Setter", "Striker", etc.
  photo_url TEXT,
  school_team_id UUID NOT NULL REFERENCES public.schools_teams(id) ON DELETE CASCADE,
  sport_id INTEGER NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  
  -- Constraints
  CONSTRAINT players_slug_not_empty CHECK (slug <> '')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_players_school_team_id ON public.players(school_team_id);
CREATE INDEX IF NOT EXISTS idx_players_sport_id ON public.players(sport_id);
CREATE INDEX IF NOT EXISTS idx_players_slug ON public.players(slug);
CREATE INDEX IF NOT EXISTS idx_players_is_active ON public.players(is_active);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.update_players_updated_at();

-- RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active players"
  ON public.players FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins and league operators can manage players"
  ON public.players FOR ALL
  TO authenticated
  USING (true);

-- ============================================================
-- 3. player_seasons — player participation per season
-- ============================================================
CREATE TABLE IF NOT EXISTS public.player_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  season_id INTEGER NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  stage_id BIGINT REFERENCES public.sports_seasons_stages(id) ON DELETE SET NULL,
  school_team_id UUID NOT NULL REFERENCES public.schools_teams(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- One player per season per team
  UNIQUE(player_id, season_id, school_team_id)
);

CREATE INDEX IF NOT EXISTS idx_player_seasons_player_id ON public.player_seasons(player_id);
CREATE INDEX IF NOT EXISTS idx_player_seasons_season_id ON public.player_seasons(season_id);
CREATE INDEX IF NOT EXISTS idx_player_seasons_stage_id ON public.player_seasons(stage_id);

ALTER TABLE public.player_seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view player seasons"
  ON public.player_seasons FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage player seasons"
  ON public.player_seasons FOR ALL
  TO authenticated
  USING (true);

-- ============================================================
-- 4. game_stats — per-game player statistics (sport-agnostic)
-- ============================================================
-- stat1-stat12 are flexible and mapped by sport:
--
-- BASKETBALL:
--   stat1=points  stat2=rebounds  stat3=assists
--   stat4=steals  stat5=blocks    stat6=turnovers
--   stat7=fg_made stat8=fg_att    stat9=3pt_made  stat10=3pt_att
--   stat11=ft_made stat12=ft_att
--
-- VOLLEYBALL:
--   stat1=kills   stat2=assists   stat3=aces
--   stat4=blocks  stat5=digs      stat6=service_errors
--   stat7=att_errors stat8=rec_errors
--
-- FOOTBALL/SOCCER:
--   stat1=goals   stat2=assists   stat3=shots
--   stat4=shots_on_target stat5=yellow_cards stat6=red_cards
--   stat7=minutes_played  stat8=passes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.game_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  game_id BIGINT NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.schools_teams(id) ON DELETE CASCADE,
  is_mvp BOOLEAN NOT NULL DEFAULT false,
  stat1 REAL,
  stat2 REAL,
  stat3 REAL,
  stat4 REAL,
  stat5 REAL,
  stat6 REAL,
  stat7 REAL,
  stat8 REAL,
  stat9 REAL,
  stat10 REAL,
  stat11 REAL,
  stat12 REAL,
  notes TEXT,
  
  -- One stat record per player per game
  UNIQUE(game_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_game_stats_game_id ON public.game_stats(game_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_player_id ON public.game_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_team_id ON public.game_stats(team_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_is_mvp ON public.game_stats(is_mvp);

ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view game stats"
  ON public.game_stats FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins and league operators can manage game stats"
  ON public.game_stats FOR ALL
  TO authenticated
  USING (true);

-- ============================================================
-- 5. sport_stat_mappings — dynamic statistics configuration
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sport_stat_mappings (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sport_id INTEGER NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  stat_column VARCHAR(20) NOT NULL,
  label VARCHAR(50) NOT NULL
);

ALTER TABLE public.sport_stat_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view sport stat mappings"
  ON public.sport_stat_mappings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins and league operators can manage sport stat mappings"
  ON public.sport_stat_mappings FOR ALL
  TO authenticated
  USING (true);
