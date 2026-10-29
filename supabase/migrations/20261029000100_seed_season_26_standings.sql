-- ============================================================
-- CESAFI Sports Web — Season 26 starting +/- and cut-offs
-- Starting point differences copied from https://cesafi.ph/standings/basketball/
-- on 2026-10-29. Their W/L already match team_standings. Matches dated on or
-- before 2026-10-29 are included in these totals, hence the cut-offs.
-- ============================================================

DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.team_standings ts
  SET point_diff = v.point_diff
  FROM (VALUES
    -- College (3)
    (3, 'BC', 100), (3, 'UV', 83), (3, 'CIT-U', 21), (3, 'USC', 18), (3, 'USJR', -1),
    (3, 'UCMN', 56), (3, 'UCLM', -120), (3, 'UP', -68), (3, 'USPF', -89),
    -- High School (9)
    (9, 'UCLM', 166), (9, 'CIT-U', 79), (9, 'UCMN', 150), (9, 'SHS-AdC', 71), (9, 'USJR', 123),
    (9, 'UV', 37), (9, 'CEC', -29), (9, 'SRCDC', -138), (9, 'BC', -50), (9, 'SCSC', -66),
    (9, 'USPF', -47), (9, 'DBTC', -120), (9, 'PSS', -176),
    -- 12 Under (10)
    (10, 'CEC', 191), (10, 'USJR', 192), (10, 'CIT-U', 248), (10, 'BC', 11), (10, 'SHS-AdC', 81),
    (10, 'SCSC', -310), (10, 'DBTC', -413),
    -- 15 Under (11)
    (11, 'UV', 113), (11, 'USPF', 91), (11, 'CIT-U', 176), (11, 'BC', 34), (11, 'SHS-AdC', 76),
    (11, 'USJR', 102), (11, 'SCSC', -106), (11, 'CEC', 36), (11, 'DBTC', -132), (11, 'SRCDC', -163),
    (11, 'PSS', -227)
  ) AS v(sport_category_id, abbreviation, point_diff),
  public.schools_teams st,
  public.schools s
  WHERE st.id = ts.team_id
    AND s.id = st.school_id
    AND st.season_id = 26
    AND st.is_active
    AND st.sport_category_id = v.sport_category_id
    AND s.abbreviation = v.abbreviation;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 40 THEN
    RAISE EXCEPTION 'Expected 40 team_standings rows, updated %', updated_count;
  END IF;
END $$;

INSERT INTO public.standings_cutoffs (season_id, sport_category_id, counted_through)
VALUES (26, 3, '2026-10-29'), (26, 9, '2026-10-29'), (26, 10, '2026-10-29'), (26, 11, '2026-10-29')
ON CONFLICT (season_id, sport_category_id) DO UPDATE SET counted_through = EXCLUDED.counted_through;
