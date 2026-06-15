-- Normal clients do not delete field notes or block-list rows directly.
-- Existing service-role cleanup paths keep working without public role grants.

revoke delete on public.field_notes from anon, authenticated;
revoke delete on public.blocked_users from anon, authenticated;

comment on table public.field_notes is
  'Community field notes are public when approved and hidden by moderation. Normal clients can create notes, but direct note deletion stays with trusted cleanup/admin paths.';

comment on table public.blocked_users is
  'Per-account block relationships. Normal clients can create and read their own target ids, but direct deletes are not exposed until an unblock flow exists.';
