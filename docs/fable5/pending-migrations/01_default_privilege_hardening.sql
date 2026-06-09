-- PENDING AUSTIN'S APPROVAL — prepared 2026-06-09, not yet applied to prod.
-- Apply via Supabase MCP apply_migration (name: default_privilege_hardening),
-- then move this file into supabase/migrations/ with the live version stamp.
--
-- Pitch Atlas — close the default-ACL hole (same root cause as the BSI 2026-06-06
-- incident): stop newly created tables/sequences/functions in schema public from
-- being born with anon/authenticated grants. Existing explicit grants are untouched;
-- future migrations must grant deliberately. Reversible (re-grant defaults).
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated, public;
