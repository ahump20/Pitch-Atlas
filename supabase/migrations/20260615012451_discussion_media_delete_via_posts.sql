-- Discussion media rows are owned by their post lifecycle. Clients delete the
-- discussion post, and the media rows leave through ON DELETE
-- CASCADE; direct media-row deletes would let a client hide attachments while
-- leaving the parent discussion copy intact.
revoke delete on public.discussion_media from anon, authenticated;

drop policy if exists discussion_media_delete on public.discussion_media;

comment on table public.discussion_media is
  'Discussion media rows are inserted by clients, read through RLS, and deleted through the parent post cascade. Public client roles do not delete media rows directly.';
