-- Keep the block-relationship helper usable from RLS policies while preventing
-- direct RPC callers from probing arbitrary pairs of accounts.
create or replace function private.blocked_between(left_user uuid, right_user uuid)
  returns boolean
  language sql
  stable
  security definer
  set search_path to 'public'
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

revoke all on function private.blocked_between(uuid, uuid) from public;
grant execute on function private.blocked_between(uuid, uuid) to anon, authenticated;

comment on function private.blocked_between(uuid, uuid) is
  'RLS helper for block filtering. Direct callers only get an answer when auth.uid() is one side of the pair.';
