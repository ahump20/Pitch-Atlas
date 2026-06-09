-- Pitch Atlas iOS App Store community preflight (2026-06-09)
-- ----------------------------------------------------------------------------
-- Adds the account-safety floor needed before native iOS exposes community
-- actions: block rows, blocked-content filtering, and admin checks that no
-- longer require calling public.is_admin() from the exposed public schema.
-- ----------------------------------------------------------------------------

-- Private helper schema. It is not part of the PostgREST exposed schema list,
-- but the API roles need usage/execute so RLS policies can evaluate.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_admin()
  returns boolean
  language sql
  stable
  security definer
  set search_path to 'public'
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;
revoke execute on function public.is_admin() from public, anon, authenticated;

-- Bidirectional user blocks. The row belongs to the blocker. A block row hides
-- community content both ways and prevents direct replies across that edge.
create table if not exists public.blocked_users (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocked_users_no_self_block check (blocker_id <> blocked_id)
);

alter table public.blocked_users enable row level security;
grant select, insert, delete on public.blocked_users to authenticated;
revoke all on public.blocked_users from anon;

drop policy if exists blocked_users_select_own on public.blocked_users;
create policy blocked_users_select_own on public.blocked_users for select
  to authenticated
  using (blocker_id = auth.uid());

drop policy if exists blocked_users_insert_own on public.blocked_users;
create policy blocked_users_insert_own on public.blocked_users for insert
  to authenticated
  with check (blocker_id = auth.uid());

drop policy if exists blocked_users_delete_own on public.blocked_users;
create policy blocked_users_delete_own on public.blocked_users for delete
  to authenticated
  using (blocker_id = auth.uid());

create or replace function private.blocked_between(left_user uuid, right_user uuid)
  returns boolean
  language sql
  stable
  security definer
  set search_path to 'public'
as $$
  select case
    when left_user is null or right_user is null then false
    else exists (
      select 1
      from public.blocked_users b
      where (b.blocker_id = left_user and b.blocked_id = right_user)
         or (b.blocker_id = right_user and b.blocked_id = left_user)
    )
  end;
$$;

revoke all on function private.blocked_between(uuid, uuid) from public;
grant execute on function private.blocked_between(uuid, uuid) to anon, authenticated;

-- Field Notes: visible notes remain public for logged-out readers, but signed-in
-- readers no longer see notes across either side of a block relationship.
drop policy if exists field_notes_read on public.field_notes;
create policy field_notes_read on public.field_notes for select
  to anon, authenticated
  using (
    private.is_admin()
    or author_id = (select auth.uid())
    or (
      is_hidden = false
      and visibility = any (array['approved'::text, 'approved-youth-safe'::text])
      and not private.blocked_between((select auth.uid()), author_id)
    )
  );

drop policy if exists field_notes_insert on public.field_notes;
create policy field_notes_insert on public.field_notes for insert
  to authenticated
  with check (author_id = (select auth.uid()) or private.is_admin());

drop policy if exists field_notes_update_own on public.field_notes;
create policy field_notes_update_own on public.field_notes for update
  to authenticated
  using (
    ((author_id = (select auth.uid())) or private.is_admin())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  )
  with check (
    ((author_id = (select auth.uid())) or private.is_admin())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists field_notes_delete_own on public.field_notes;
create policy field_notes_delete_own on public.field_notes for delete
  to authenticated
  using (
    ((author_id = (select auth.uid())) or private.is_admin())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists tries_read_own on public.note_tries;
create policy tries_read_own on public.note_tries for select
  to authenticated
  using (
    ((user_id = (select auth.uid())) or private.is_admin())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists helpful_read_own on public.note_helpful;
create policy helpful_read_own on public.note_helpful for select
  to authenticated
  using (
    ((user_id = (select auth.uid())) or private.is_admin())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists reports_admin_read on public.note_reports;
create policy reports_admin_read on public.note_reports for select
  to authenticated
  using (
    private.is_admin()
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists reports_admin_update on public.note_reports;
create policy reports_admin_update on public.note_reports for update
  to authenticated
  using (
    private.is_admin()
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  )
  with check (
    private.is_admin()
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

-- Discussion reads: visible posts/media stay public, with signed-in block
-- filtering. Owners still see their own content, and admins retain queue access.
drop policy if exists discussion_posts_read on public.discussion_posts;
create policy discussion_posts_read on public.discussion_posts for select
  using (
    private.is_admin()
    or author_id = auth.uid()
    or (
      is_hidden = false
      and not private.blocked_between(auth.uid(), author_id)
    )
  );

drop policy if exists discussion_posts_delete on public.discussion_posts;
create policy discussion_posts_delete on public.discussion_posts for delete
  using (author_id = auth.uid() or private.is_admin());

drop policy if exists discussion_media_read on public.discussion_media;
create policy discussion_media_read on public.discussion_media for select
  using (
    private.is_admin()
    or owner_id = auth.uid()
    or (
      is_hidden = false
      and not private.blocked_between(auth.uid(), owner_id)
      and exists (
        select 1
        from public.discussion_posts dp
        where dp.id = post_id
          and dp.is_hidden = false
          and not private.blocked_between(auth.uid(), dp.author_id)
      )
    )
  );

drop policy if exists discussion_media_delete on public.discussion_media;
create policy discussion_media_delete on public.discussion_media for delete
  using (owner_id = auth.uid() or private.is_admin());

drop policy if exists discussion_reports_admin_read on public.discussion_reports;
create policy discussion_reports_admin_read on public.discussion_reports for select
  using (private.is_admin());

drop policy if exists discussion_media_object_read on storage.objects;
create policy discussion_media_object_read on storage.objects for select to authenticated, anon
  using (
    bucket_id = 'discussion-media'
    and exists (
      select 1
      from public.discussion_media m
      join public.discussion_posts dp on dp.id = m.post_id
      where m.storage_path = name
        and m.is_hidden = false
        and dp.is_hidden = false
        and not private.blocked_between(auth.uid(), m.owner_id)
        and not private.blocked_between(auth.uid(), dp.author_id)
    )
  );

-- Replies cannot cross a block edge. Root posts have no target user, so they
-- pass through the normal content and rate-limit guards.
create or replace function public.enforce_discussion_block_edges()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public'
as $$
declare
  v_parent_author uuid;
begin
  if new.parent_id is not null then
    select author_id into v_parent_author
    from public.discussion_posts
    where id = new.parent_id;

    if private.blocked_between(new.author_id, v_parent_author) then
      raise exception 'blocked_interaction: that conversation is not available';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_discussion_block_edges on public.discussion_posts;
create trigger trg_discussion_block_edges
  before insert on public.discussion_posts
  for each row execute function public.enforce_discussion_block_edges();

revoke execute on function public.enforce_discussion_block_edges() from public, anon, authenticated;

comment on table public.blocked_users is 'One row per user block. RLS lets signed-in users manage their own blocks; read policies hide community content both ways.';
comment on function private.is_admin() is 'Private-schema admin helper used by RLS policies without exposing public.is_admin() as an RPC surface.';
comment on function private.blocked_between(uuid, uuid) is 'True when either user has blocked the other; null-safe so logged-out reads still work.';
