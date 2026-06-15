-- Keep viewer-scoped community reads to the columns used by the app.
--
-- RLS still scopes these rows to the current authenticated user. The column
-- grants keep internal row ids, timestamps, and unused outcome fields out of
-- public client reads.

revoke select on public.note_tries from anon, authenticated;
grant select (
  note_id,
  user_id
) on public.note_tries to authenticated;

revoke select on public.note_helpful from anon, authenticated;
grant select (
  note_id,
  user_id
) on public.note_helpful to authenticated;

revoke select on public.discussion_media_terms from anon, authenticated;
grant select (
  user_id
) on public.discussion_media_terms to authenticated;

comment on table public.note_tries is
  'Viewer-scoped tried-this markers. Client roles read note_id/user_id only; row ids, timestamps, and outcome rollups stay server-side.';
comment on table public.note_helpful is
  'Viewer-scoped helpful markers. Client roles read note_id/user_id only; row ids and timestamps stay server-side.';
comment on table public.discussion_media_terms is
  'One row per account that has accepted upload terms. Client roles read only their user_id; accepted_at stays database-owned.';
