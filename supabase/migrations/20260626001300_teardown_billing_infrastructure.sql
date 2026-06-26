-- Pitch Atlas does not bill. Remove all dead billing/Stripe infrastructure:
-- the orphaned Stripe sync engine, its message queue, the membership tables and
-- functions, and the policy-less billing-link table. Community features untouched.
--
-- Applied to project cloeoulvrrfcbitrjpso on 2026-06-26. Reversible only from
-- backup; retained here for repo/DB parity. The three Stripe edge functions
-- (stripe-setup, stripe-webhook, stripe-worker) are neutralized to inert 410s and
-- await final deletion from the dashboard.

-- 1. Stop the every-minute Stripe sync cron job (must precede schema drop).
do $$
begin
  perform cron.unschedule('stripe-sync-worker');
exception when others then
  raise notice 'cron unschedule skipped: %', sqlerrm;
end $$;

-- 2. Drop the membership functions first (they read/write public.memberships).
do $$
declare r record;
begin
  for r in
    select format('drop function if exists %I.%I(%s) cascade',
                  n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)) as stmt
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('viewer_membership', 'upsert_membership')
  loop
    execute r.stmt;
  end loop;
end $$;

-- 3. Drop the membership + billing-provider-link tables (zero FK dependents verified).
drop table if exists public.memberships cascade;
drop table if exists private.billing_provider_links cascade;

-- 4. Drop the entire orphaned Stripe sync schema (29 tables) in one cascade.
drop schema if exists stripe cascade;

-- 5. Drop the Stripe sync message queue (leaves the pgmq extension installed).
do $$
begin
  perform pgmq.drop_queue('stripe_sync_work');
exception when others then
  raise notice 'pgmq drop_queue skipped: %', sqlerrm;
end $$;
