-- Re-tighten community insert grants after the App Store cleanup widened a few
-- tables back to all-column INSERT.
--
-- RLS still checks ownership, but column grants are the boundary that keeps
-- status, report counts, author ids, and ranking fields database-owned.

revoke insert on public.field_notes from anon, authenticated;
grant insert (
  pitch_slug,
  display_name,
  tweak,
  player_level,
  arm_slot,
  velocity_band,
  intent,
  claimed_result_kind,
  claimed_result_note,
  sample_size,
  evidence_url,
  evidence_label,
  source_tier,
  note
) on public.field_notes to authenticated;

revoke insert on public.note_tries from anon, authenticated;
grant insert (note_id, outcome_kind) on public.note_tries to authenticated;

revoke insert on public.note_helpful from anon, authenticated;
grant insert (note_id) on public.note_helpful to authenticated;

revoke insert on public.note_reports from anon, authenticated;
grant insert (note_id, reason) on public.note_reports to authenticated;

revoke insert on public.discussion_posts from anon, authenticated;
grant insert (
  topic_key,
  display_name,
  parent_id,
  body
) on public.discussion_posts to authenticated;

revoke insert on public.discussion_media from anon, authenticated;
grant insert (
  post_id,
  topic_key,
  storage_path,
  mime_type,
  kind,
  byte_size,
  width,
  height,
  duration_s
) on public.discussion_media to authenticated;

revoke insert on public.discussion_reports from anon, authenticated;
grant insert (post_id, media_id, reason) on public.discussion_reports to authenticated;

comment on table public.field_notes is
  'Community field-note submissions. Client roles insert contributor-authored columns only; rank, counts, visibility, and ownership stay database-owned.';
comment on table public.discussion_posts is
  'Per-topic discussion comments and replies. Client roles insert content columns only; ownership, moderation status, counts, and timestamps stay database-owned.';
comment on table public.discussion_media is
  'Native discussion media rows. Client roles insert media metadata only; ownership, visibility, counts, and timestamps stay database-owned.';
