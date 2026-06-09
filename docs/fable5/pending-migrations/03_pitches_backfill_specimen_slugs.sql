-- PENDING AUSTIN'S APPROVAL — prepared 2026-06-09, not yet applied to prod.
--
-- Field Notes mounts on every specimen page (src/pages/PitchChapter.tsx renders
-- <FieldNotes> unconditionally), but public.pitches (the FK anchor for
-- field_notes.pitch_slug) holds only 5 of the 12 specimen slugs — note submission
-- on the other 7 specimens fails with an FK violation today. Backfill from the
-- web's canonical src/data/pitches/ set. Idempotent. Also corrects the two-seam
-- display name (the "(sinker)" mislabel was retired on the web 2026-06-06).
insert into public.pitches (slug, name, sort_order) values
  ('cutter',      'Cutter',      6),
  ('sweeper',     'Sweeper',     7),
  ('splitter',    'Splitter',    8),
  ('splinker',    'Splinker',    9),
  ('forkball',    'Forkball',   10),
  ('knuckleball', 'Knuckleball',11),
  ('eephus',      'Eephus',     12)
on conflict (slug) do nothing;

update public.pitches set name = 'Two-seam fastball' where slug = 'two-seam' and name = 'Two-seam fastball (sinker)';
