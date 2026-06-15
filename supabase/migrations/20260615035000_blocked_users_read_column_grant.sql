-- Keep account block reads limited to the target account id.
--
-- RLS already scopes rows to the signed-in blocker. Client roles only need the
-- blocked_id for a block list or unblock filter; blocker_id and created_at stay
-- database-owned.

revoke select on public.blocked_users from anon, authenticated;
grant select (
  blocked_id
) on public.blocked_users to authenticated;

comment on table public.blocked_users is
  'One row per user block. Client roles insert and read blocked_id only; blocker_id and created_at stay database-owned.';
