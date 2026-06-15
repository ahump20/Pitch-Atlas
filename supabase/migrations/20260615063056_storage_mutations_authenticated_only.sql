-- Discussion media bytes are public-readable only through the visible-row policy,
-- but mutations need a signed Supabase session. The app calls ensureSession()
-- before upload/delete, so no-session anon does not need policy membership here.

drop policy if exists discussion_media_object_insert on storage.objects;
create policy discussion_media_object_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'discussion-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists discussion_media_object_delete on storage.objects;
create policy discussion_media_object_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'discussion-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
