-- Anonymous Supabase sign-ins still assume the authenticated role.
-- Media terms acceptance should belong to a permanent account only.

drop policy if exists dmt_select on public.discussion_media_terms;
create policy dmt_select
  on public.discussion_media_terms
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and ((select auth.jwt()) ->> 'is_anonymous')::boolean is false
  );

drop policy if exists dmt_insert on public.discussion_media_terms;
create policy dmt_insert
  on public.discussion_media_terms
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and ((select auth.jwt()) ->> 'is_anonymous')::boolean is false
  );
