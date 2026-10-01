-- The browser does not read blocked_users directly. Community visibility uses
-- private.blocked_between(), and account deletion cleans rows with the service
-- role. Remove the remaining client SELECT surface so block edges stay out of
-- generated table APIs.

revoke select on public.blocked_users from anon, authenticated;
revoke select (blocked_id) on public.blocked_users from anon, authenticated;

comment on table public.blocked_users is
  'One row per user block. Direct client reads are closed; community visibility checks go through private.blocked_between().';
