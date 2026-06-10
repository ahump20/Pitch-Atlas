-- B9 step 2: stop the default-open ACL footgun. The postgres role's default ACL was
-- auto-granting anon/authenticated FULL privileges (arwdDxtm) on every NEW table,
-- sequence, and function created in public — the same hazard that re-opened anon
-- exposure on the sister project on 2026-06-06. After this, new objects start closed
-- and access is granted deliberately per-object.
-- Existing object grants are NOT touched by this migration (no behavior change for
-- the live app). Rollback: re-run the original ALTER DEFAULT PRIVILEGES ... GRANT.
-- Residual: supabase_admin's own default ACL cannot be altered from the postgres role;
-- objects it creates (platform-managed) still carry broad grants — documented, accepted.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated;
