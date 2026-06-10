-- B9 step 1: backfill the pitches registry to match the product's 12 chapter routes.
-- Source of truth: src/data/pitches PITCHES array (display.slug, canonical.name, array order).
-- Fixes the live FK bug: field_notes.pitch_slug references pitches(slug), but only 5 of the
-- 12 chapter pages had a registry row, so community notes on the other 7 were rejected.
-- Idempotent: ON CONFLICT refreshes name + sort_order. Rollback: delete the 7 new slugs
-- (only safe while they own no field_notes rows).
insert into public.pitches (slug, name, sort_order) values
  ('four-seam',     'Four-seam fastball', 1),
  ('two-seam',      'Two-seam fastball',  2),
  ('circle-change', 'Circle changeup',    3),
  ('twelve-six',    '12-6 curveball',     4),
  ('slider',        'Slider',             5),
  ('splitter',      'Splitter',           6),
  ('splinker',      'Splinker',           7),
  ('sweeper',       'Sweeper',            8),
  ('cutter',        'Cutter',             9),
  ('knuckleball',   'Knuckleball',       10),
  ('forkball',      'Forkball',          11),
  ('eephus',        'Eephus',            12)
on conflict (slug) do update
  set name = excluded.name,
      sort_order = excluded.sort_order;
