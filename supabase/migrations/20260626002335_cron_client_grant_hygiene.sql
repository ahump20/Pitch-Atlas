-- Security hygiene: keep client roles off the pg_cron bookkeeping tables.
-- anon/authenticated already lack USAGE on schema cron (the binding control), so
-- these table grants were unreachable; revoke them so privilege matches intent.
-- pg_cron runs as the table owner and is unaffected. The cron.job /
-- cron.job_run_details advisor lint is policy-based (pg_cron's own owner-scoped
-- "username = current_user" policy names the public role) and is accepted: with no
-- schema USAGE for client roles the tables are unreachable, and no job command
-- carries a secret after the Stripe engine teardown.
do $$
begin
  revoke all on all tables in schema cron from anon, authenticated;
  revoke usage on schema cron from anon, authenticated;
exception when others then
  raise notice 'cron grant hygiene best-effort skipped: %', sqlerrm;
end $$;
