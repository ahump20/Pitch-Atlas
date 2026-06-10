-- B9 step 3a: the direct-message tables (threads / thread_participants / messages) are a
-- dormant feature, yet anon + authenticated held INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/
-- TRIGGER. TRUNCATE is NOT row-filtered by RLS — an anon-key client could empty the tables.
-- Revoke everything from client roles; service_role keeps access; RLS policies remain in
-- place for a deliberate regrant when the feature ships.
-- Rollback: grant select/insert/update/delete back to authenticated per the original
-- discussion_forum migration.
revoke all on table public.threads from anon, authenticated;
revoke all on table public.thread_participants from anon, authenticated;
revoke all on table public.messages from anon, authenticated;

-- B9 step 3b: covering indexes for the three foreign keys that lacked one
-- (cascade deletes and reverse lookups were full-table scans).
create index if not exists idx_blocked_users_blocked_id on public.blocked_users (blocked_id);
create index if not exists idx_discussion_media_owner_id on public.discussion_media (owner_id);
create index if not exists idx_discussion_reports_reporter_id on public.discussion_reports (reporter_id);
