-- Pitch Atlas — Field Notes anon/authenticated grants (2026-06-06)
-- ----------------------------------------------------------------------------
-- The same "policy without a grant is dead weight" gap the discussion forum hit
-- (20260606093000_discussion_forum_access_fix.sql), now for the Field Notes layer.
--
-- A live smoke test against the field_notes layer returns:
--   permission denied for table field_notes  (code 42501)
--   hint: GRANT SELECT ON public.field_notes TO anon;
-- The base schema (field_notes / note_tries / note_helpful / note_reports) was
-- applied earlier via MCP WITH its RLS policies and the safety triggers
-- (content scanning, rate limiting, report-driven auto-hide) from
-- 20260605120000_community_safety_floor.sql — but the table GRANTs to anon /
-- authenticated were never issued, so every Field Notes query 403s. This grants
-- exactly the privileges the client (src/lib/community.ts) uses, no more; RLS and
-- the existing triggers remain the real gatekeepers.
--
-- Apply with `supabase db push` (or the project's Supabase deploy path) to
-- project cloeoulvrrfcbitrjpso, then flip community.enabled to true on the
-- specimens and redeploy the site; the Field Notes layer goes live, four-state,
-- honestly empty until the first real note.
--
-- BOT PROTECTION (the remaining piece of the hardening item): enable CAPTCHA in
-- the Supabase dashboard — Authentication → Attack Protection → CAPTCHA, provider
-- Cloudflare Turnstile — so anonymous sign-in and writes carry a Turnstile token.
-- That is an auth-config toggle, not SQL, so it is documented here rather than run.
-- ----------------------------------------------------------------------------

-- field_notes: read the public (visible, approved) set and submit your own.
-- RLS already drops hidden/unapproved rows on select and checks author_id on insert.
grant select, insert on public.field_notes to anon, authenticated;

-- note_tries / note_helpful: read your own marks, add and remove them.
-- One-row-per-account is enforced by unique indexes from the base schema.
grant select, insert, delete on public.note_tries to anon, authenticated;
grant select, insert, delete on public.note_helpful to anon, authenticated;

-- note_reports: write-only for contributors — flag a note for review. Reading the
-- moderation queue stays admin-only (no select grant here, by design), matching
-- the client, which only inserts reports.
grant insert on public.note_reports to anon, authenticated;
