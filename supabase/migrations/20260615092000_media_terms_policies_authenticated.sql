-- Media terms reads and writes happen only after the client has a session.
-- Keep grants column-scoped and move the RLS policies off PUBLIC so anonymous
-- pre-session callers do not carry a dead policy surface.

revoke select, insert on public.discussion_media_terms from anon, authenticated;
grant select (user_id) on public.discussion_media_terms to authenticated;
grant insert (user_id) on public.discussion_media_terms to authenticated;

drop policy if exists dmt_select on public.discussion_media_terms;
create policy dmt_select
  on public.discussion_media_terms
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists dmt_insert on public.discussion_media_terms;
create policy dmt_insert
  on public.discussion_media_terms
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

comment on table public.discussion_media_terms is
  'One row per signed-in account that has accepted upload terms. Client roles read/insert user_id only; accepted_at stays database-owned.';
