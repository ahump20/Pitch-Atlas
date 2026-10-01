-- Client DELETE grants for these tables were closed in
-- 20260615053500_close_unused_delete_grants.sql. Drop the leftover policies too
-- so a future accidental DELETE grant cannot revive direct client deletes.
drop policy if exists field_notes_delete_own on public.field_notes;
drop policy if exists blocked_users_delete_own on public.blocked_users;
