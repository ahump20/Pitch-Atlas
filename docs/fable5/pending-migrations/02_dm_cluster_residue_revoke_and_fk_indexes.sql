-- PENDING AUSTIN'S APPROVAL — prepared 2026-06-09, not yet applied to prod.
--
-- The threads/messages DM cluster is not a live product surface (no client code
-- references it; authenticated has no SELECT grant) but default ACLs left
-- anon+authenticated holding full DML residue. Revoke everything; if the DM
-- feature ever ships, a deliberate migration re-grants what its policies need.
-- Reversible (re-grant).
revoke all on public.threads from anon, authenticated;
revoke all on public.messages from anon, authenticated;
revoke all on public.thread_participants from anon, authenticated;

-- Covering indexes for the three unindexed FKs flagged by the performance advisor.
create index if not exists blocked_users_blocked_id_idx on public.blocked_users (blocked_id);
create index if not exists discussion_media_owner_id_idx on public.discussion_media (owner_id);
create index if not exists discussion_reports_reporter_id_idx on public.discussion_reports (reporter_id);
