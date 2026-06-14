-- Performance: storage.objects policies need the same auth initplan treatment
-- as public-table policies. These expressions are caller-level constants, so
-- wrapping auth.uid() in SELECT lets Postgres evaluate it once per statement.

alter policy discussion_media_object_insert
  on storage.objects
  with check (
    bucket_id = 'discussion-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

alter policy discussion_media_object_read
  on storage.objects
  using (
    bucket_id = 'discussion-media'
    and exists (
      select 1
      from public.discussion_media m
      join public.discussion_posts dp on dp.id = m.post_id
      where m.storage_path = name
        and m.is_hidden = false
        and dp.is_hidden = false
        and not private.blocked_between((select auth.uid()), m.owner_id)
        and not private.blocked_between((select auth.uid()), dp.author_id)
    )
  );

alter policy discussion_media_object_delete
  on storage.objects
  using (
    bucket_id = 'discussion-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
