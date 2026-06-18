-- Pitch Atlas — pin admin and block helper search paths (2026-06-15)
-- These helpers are still SECURITY DEFINER because RLS policies need them to read
-- private columns/rows. Keep the behavior and grants, but run them with an empty
-- search path so every table/function reference is explicit.

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  );
$$;

create or replace function private.blocked_between(left_user uuid, right_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with viewer as (
    select auth.uid() as id
  )
  select case
    when left_user is null or right_user is null then false
    when viewer.id is null then false
    when viewer.id <> left_user and viewer.id <> right_user then false
    else exists (
      select 1
      from public.blocked_users b
      where (b.blocker_id = left_user and b.blocked_id = right_user)
         or (b.blocker_id = right_user and b.blocked_id = left_user)
    )
  end
  from viewer;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select p.is_admin
    from public.profiles p
    where p.id = auth.uid()
  ), false);
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.blocked_between(uuid, uuid) from public;
revoke all on function public.is_admin() from public;

grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.blocked_between(uuid, uuid) to anon, authenticated;
grant execute on function public.is_admin() to service_role;
revoke execute on function public.is_admin() from anon, authenticated;

comment on function private.is_admin() is
  'Private-schema admin helper used by RLS policies. SECURITY DEFINER with empty search_path and explicit public/auth references.';
comment on function private.blocked_between(uuid, uuid) is
  'True when either user has blocked the other, scoped to the current viewer. SECURITY DEFINER with empty search_path.';
comment on function public.is_admin() is
  'Legacy admin helper kept closed to client roles. SECURITY DEFINER with empty search_path.';
