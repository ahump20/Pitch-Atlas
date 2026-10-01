-- Discussion reads are public for visible rows, but client roles only need the
-- columns rendered by the thread UI. Keep moderation and internal metadata out
-- of direct PostgREST selects.

revoke select on public.discussion_posts from anon, authenticated;
grant select (
  id,
  topic_key,
  author_id,
  display_name,
  parent_id,
  body,
  created_at
) on public.discussion_posts to anon, authenticated;

revoke select on public.discussion_media from anon, authenticated;
grant select (
  id,
  post_id,
  storage_path,
  kind,
  width,
  height
) on public.discussion_media to anon, authenticated;

comment on table public.discussion_posts is
  'Per-topic discussion comments and replies. Client roles read rendered thread columns only; moderation flags, report counts, and updated_at stay server-side.';
comment on table public.discussion_media is
  'Native discussion media rows. Client roles read render/signing columns only; owner, moderation, MIME, size, and timing metadata stay server-side.';
