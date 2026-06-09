-- Pitch Atlas narrow community API grants for App Store review (2026-06-09)
-- ----------------------------------------------------------------------------
-- Earlier emergency migrations granted table privileges wider than the policies
-- needed. RLS still blocked the wrong rows, but the GraphQL/advisor surface was
-- noisy. Keep public reads where the product intentionally has public community
-- content; narrow write/report/block tables to signed-in API roles.
-- ----------------------------------------------------------------------------

revoke all on public.blocked_users from anon, authenticated;
grant select, insert, delete on public.blocked_users to authenticated;

revoke all on public.discussion_posts from anon, authenticated;
grant select on public.discussion_posts to anon, authenticated;
grant insert, delete on public.discussion_posts to authenticated;

revoke all on public.discussion_media from anon, authenticated;
grant select on public.discussion_media to anon, authenticated;
grant insert, delete on public.discussion_media to authenticated;

revoke all on public.discussion_media_terms from anon, authenticated;
grant select, insert on public.discussion_media_terms to authenticated;

revoke all on public.discussion_reports from anon, authenticated;
grant insert on public.discussion_reports to authenticated;

revoke all on public.field_notes from anon, authenticated;
grant select on public.field_notes to anon, authenticated;
grant insert, delete on public.field_notes to authenticated;

revoke all on public.note_tries from anon, authenticated;
grant select, insert, delete on public.note_tries to authenticated;

revoke all on public.note_helpful from anon, authenticated;
grant select, insert, delete on public.note_helpful to authenticated;

revoke all on public.note_reports from anon, authenticated;
grant insert, update on public.note_reports to authenticated;

-- Anonymous Supabase sessions use the authenticated role with an is_anonymous
-- JWT claim. Blocks are an account-safety feature, so require a claimed account.
drop policy if exists blocked_users_select_own on public.blocked_users;
create policy blocked_users_select_own on public.blocked_users for select
  to authenticated
  using (
    blocker_id = auth.uid()
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists blocked_users_insert_own on public.blocked_users;
create policy blocked_users_insert_own on public.blocked_users for insert
  to authenticated
  with check (
    blocker_id = auth.uid()
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists blocked_users_delete_own on public.blocked_users;
create policy blocked_users_delete_own on public.blocked_users for delete
  to authenticated
  using (
    blocker_id = auth.uid()
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists discussion_posts_delete on public.discussion_posts;
create policy discussion_posts_delete on public.discussion_posts for delete
  to authenticated
  using (
    (author_id = auth.uid() or private.is_admin())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists discussion_media_delete on public.discussion_media;
create policy discussion_media_delete on public.discussion_media for delete
  to authenticated
  using (
    (owner_id = auth.uid() or private.is_admin())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists discussion_reports_admin_read on public.discussion_reports;
create policy discussion_reports_admin_read on public.discussion_reports for select
  to authenticated
  using (
    private.is_admin()
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

comment on table public.discussion_reports is 'Write-only report queue for normal clients. Admin review happens through trusted/admin tooling, not public client reads.';
