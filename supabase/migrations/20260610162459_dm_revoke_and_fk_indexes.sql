-- B9 step 3a: the direct-message tables (threads / thread_participants / messages) are a
-- dormant feature, yet anon + authenticated held INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/
-- TRIGGER in the live production database. TRUNCATE is NOT row-filtered by RLS — an
-- anon-key client could empty those tables if they exist.
-- Revoke everything from client roles when the dormant tables exist; skip cleanly on
-- fresh preview branches whose schema is sourced only from repo migrations.
-- Rollback: grant select/insert/update/delete back to authenticated per the original
-- discussion_forum migration.
do $$
begin
  if to_regclass('public.threads') is not null then
    execute 'revoke all on table public.threads from anon, authenticated';
  end if;

  if to_regclass('public.thread_participants') is not null then
    execute 'revoke all on table public.thread_participants from anon, authenticated';
  end if;

  if to_regclass('public.messages') is not null then
    execute 'revoke all on table public.messages from anon, authenticated';
  end if;
end $$;

-- B9 step 3b: covering indexes for the three foreign keys that lacked one
-- (cascade deletes and reverse lookups were full-table scans).
create index if not exists idx_blocked_users_blocked_id on public.blocked_users (blocked_id);
create index if not exists idx_discussion_media_owner_id on public.discussion_media (owner_id);
create index if not exists idx_discussion_reports_reporter_id on public.discussion_reports (reporter_id);
