-- blocked_users is an account-safety table. Clients choose who to block, while
-- ownership and timing stay database-owned through defaults and RLS.

revoke insert on public.blocked_users from anon, authenticated;
grant insert (blocked_id) on public.blocked_users to authenticated;

comment on table public.blocked_users is
  'One row per user block. Client roles insert blocked_id only; blocker_id and created_at stay database-owned.';
