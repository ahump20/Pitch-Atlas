-- Storage must inspect moderation and ownership without exposing those columns
-- to clients. The former policy queried them with the caller's column grants,
-- so legitimate downloads/signing failed after a successful media attachment.
create or replace function private.can_read_discussion_media_object(object_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.discussion_media m
    join public.discussion_posts dp on dp.id = m.post_id
    where m.storage_path = object_name
      and m.is_hidden = false
      and dp.is_hidden = false
      and not private.blocked_between((select auth.uid()), m.owner_id)
      and not private.blocked_between((select auth.uid()), dp.author_id)
  );
$$;
revoke all on function private.can_read_discussion_media_object(text) from public;
grant execute on function private.can_read_discussion_media_object(text) to anon, authenticated;

alter policy discussion_media_object_read on storage.objects
  using (
    bucket_id = 'discussion-media'
    and private.can_read_discussion_media_object(name)
  );

comment on function private.can_read_discussion_media_object(text) is
  'Storage visibility check for the current viewer. Preserves hidden-parent, hidden-media and mutual-block filtering without granting client access to private media metadata.';
