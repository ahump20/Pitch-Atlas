-- Upload bytes for discussion media only from permanent signed-in accounts.
-- Public reads stay governed by the visible-row storage policy.

drop policy if exists discussion_media_object_insert on storage.objects;
create policy discussion_media_object_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    coalesce((((select auth.jwt()) ->> 'is_anonymous')::boolean), true) is false
    and bucket_id = 'discussion-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists discussion_media_object_delete on storage.objects;
create policy discussion_media_object_delete
  on storage.objects
  for delete
  to authenticated
  using (
    coalesce((((select auth.jwt()) ->> 'is_anonymous')::boolean), true) is false
    and bucket_id = 'discussion-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
