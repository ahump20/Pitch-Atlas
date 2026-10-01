-- Native clients do not get direct blocked_users table access. They manage
-- their own block edges through these authenticated RPCs instead.

create or replace function public.block_user(target_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  viewer uuid := (select auth.uid());
begin
  if viewer is null then
    raise exception 'auth_required: sign in before blocking a contributor';
  end if;

  if target_user is null then
    raise exception 'invalid_block_target: choose a contributor to block';
  end if;

  if viewer = target_user then
    raise exception 'self_block_rejected: you cannot block yourself';
  end if;

  insert into public.blocked_users (blocker_id, blocked_id)
  values (viewer, target_user)
  on conflict (blocker_id, blocked_id) do nothing;
end;
$$;

create or replace function public.unblock_user(target_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  viewer uuid := (select auth.uid());
begin
  if viewer is null then
    raise exception 'auth_required: sign in before changing blocked contributors';
  end if;

  if target_user is null then
    raise exception 'invalid_block_target: choose a contributor to unblock';
  end if;

  delete from public.blocked_users
  where blocker_id = viewer
    and blocked_id = target_user;
end;
$$;

create or replace function public.my_blocked_users()
returns table (
  blocked_id uuid,
  display_name text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with viewer as (
    select (select auth.uid()) as id
  )
  select
    b.blocked_id,
    coalesce(p.display_name, 'Pitch Atlas contributor') as display_name,
    b.created_at
  from public.blocked_users b
  left join public.profiles p on p.id = b.blocked_id
  join viewer v on v.id = b.blocker_id
  order by b.created_at desc;
$$;

revoke all on function public.block_user(uuid) from public;
revoke all on function public.unblock_user(uuid) from public;
revoke all on function public.my_blocked_users() from public;

grant execute on function public.block_user(uuid) to authenticated;
grant execute on function public.unblock_user(uuid) to authenticated;
grant execute on function public.my_blocked_users() to authenticated;

comment on function public.block_user(uuid) is
  'Authenticated account-safety RPC for adding the current viewer''s block edge without direct table grants.';
comment on function public.unblock_user(uuid) is
  'Authenticated account-safety RPC for removing the current viewer''s block edge without direct table grants.';
comment on function public.my_blocked_users() is
  'Authenticated account-safety RPC returning only the current viewer''s blocked contributors.';
