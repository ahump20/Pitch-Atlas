-- Pitch Atlas member/subscription storage contract.
-- ----------------------------------------------------------------------------
-- This is intentionally provider-neutral. Web can later write Stripe-backed rows;
-- iOS can write App Store-backed rows. The client-visible table contains only the
-- member state a signed-in person is allowed to know about themselves. Provider
-- customer/subscription ids stay out of public grants.
-- ----------------------------------------------------------------------------

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to service_role;

create table if not exists public.memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'free'
    constraint memberships_tier_check check (tier in ('free', 'supporter', 'pro', 'founder')),
  status text not null default 'free'
    constraint memberships_status_check check (
      status in ('free', 'trialing', 'active', 'past_due', 'canceled', 'incomplete', 'paused')
    ),
  source text not null default 'system'
    constraint memberships_source_check check (source in ('system', 'manual', 'stripe', 'app_store')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memberships_free_shape check (
    (tier <> 'free' and status <> 'free')
    or (tier = 'free' and status = 'free' and current_period_end is null)
  )
);

create index if not exists memberships_active_status_idx
  on public.memberships (status, tier)
  where status in ('trialing', 'active', 'past_due');

drop trigger if exists trg_memberships_updated on public.memberships;
create trigger trg_memberships_updated
  before update on public.memberships
  for each row execute function public.set_updated_at();

alter table public.memberships enable row level security;
alter table public.memberships force row level security;

revoke all on public.memberships from anon, authenticated;
grant select (
  user_id,
  tier,
  status,
  source,
  current_period_end,
  updated_at
) on public.memberships to authenticated;
grant select, insert, update, delete on public.memberships to service_role;

drop policy if exists memberships_select_own on public.memberships;
create policy memberships_select_own on public.memberships for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) is false
  );

create table if not exists private.billing_provider_links (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null
    constraint billing_provider_links_provider_check check (provider in ('stripe', 'app_store', 'manual')),
  provider_customer_id text,
  provider_subscription_id text,
  provider_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint billing_provider_links_provider_identity check (
    provider = 'manual'
    or provider_customer_id is not null
    or provider_subscription_id is not null
  )
);

create unique index if not exists billing_provider_links_customer_uidx
  on private.billing_provider_links (provider, provider_customer_id)
  where provider_customer_id is not null;

create unique index if not exists billing_provider_links_subscription_uidx
  on private.billing_provider_links (provider, provider_subscription_id)
  where provider_subscription_id is not null;

drop trigger if exists trg_billing_provider_links_updated on private.billing_provider_links;
create trigger trg_billing_provider_links_updated
  before update on private.billing_provider_links
  for each row execute function public.set_updated_at();

alter table private.billing_provider_links enable row level security;
alter table private.billing_provider_links force row level security;

revoke all on private.billing_provider_links from public, anon, authenticated;
grant select, insert, update, delete on private.billing_provider_links to service_role;

create or replace function public.viewer_membership()
returns table (
  user_id uuid,
  tier text,
  status text,
  source text,
  current_period_end timestamptz,
  is_member boolean,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  with viewer as (
    select
      (select auth.uid()) as id,
      coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) as is_anonymous
  )
  select
    viewer.id as user_id,
    coalesce(m.tier, 'free') as tier,
    coalesce(m.status, 'free') as status,
    m.source,
    m.current_period_end,
    coalesce(
      m.tier <> 'free'
      and m.status in ('trialing', 'active')
      and (m.current_period_end is null or m.current_period_end > now()),
      false
    ) as is_member,
    m.updated_at
  from viewer
  left join public.memberships m on m.user_id = viewer.id
  where viewer.id is not null
    and viewer.is_anonymous is false;
$$;

revoke all on function public.viewer_membership() from public;
grant execute on function public.viewer_membership() to authenticated;
revoke execute on function public.viewer_membership() from anon;

create or replace function public.upsert_membership(
  p_user_id uuid,
  p_tier text,
  p_status text,
  p_source text,
  p_current_period_end timestamptz default null,
  p_provider text default null,
  p_provider_customer_id text default null,
  p_provider_subscription_id text default null,
  p_provider_event_id text default null
)
returns public.memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_membership public.memberships;
begin
  if auth.role() <> 'service_role' then
    raise exception 'insufficient_privilege: service role required'
      using errcode = '42501';
  end if;

  insert into public.memberships (
    user_id,
    tier,
    status,
    source,
    current_period_end
  )
  values (
    p_user_id,
    p_tier,
    p_status,
    p_source,
    p_current_period_end
  )
  on conflict (user_id) do update set
    tier = excluded.tier,
    status = excluded.status,
    source = excluded.source,
    current_period_end = excluded.current_period_end,
    updated_at = now()
  returning * into v_membership;

  if p_provider is not null then
    insert into private.billing_provider_links (
      user_id,
      provider,
      provider_customer_id,
      provider_subscription_id,
      provider_event_id
    )
    values (
      p_user_id,
      p_provider,
      p_provider_customer_id,
      p_provider_subscription_id,
      p_provider_event_id
    )
    on conflict (user_id) do update set
      provider = excluded.provider,
      provider_customer_id = excluded.provider_customer_id,
      provider_subscription_id = excluded.provider_subscription_id,
      provider_event_id = excluded.provider_event_id,
      updated_at = now();
  end if;

  return v_membership;
end;
$$;

revoke all on function public.upsert_membership(
  uuid,
  text,
  text,
  text,
  timestamptz,
  text,
  text,
  text,
  text
) from public;
grant execute on function public.upsert_membership(
  uuid,
  text,
  text,
  text,
  timestamptz,
  text,
  text,
  text,
  text
) to service_role;
revoke execute on function public.upsert_membership(
  uuid,
  text,
  text,
  text,
  timestamptz,
  text,
  text,
  text,
  text
) from anon, authenticated;

do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'memberships'
  ) then
    alter publication supabase_realtime add table public.memberships;
  end if;
end $$;

comment on table public.memberships is
  'Sanitized member/subscription state visible only to the signed-in owner. Provider ids and webhook event state are stored separately.';
comment on table private.billing_provider_links is
  'Service-role-only billing/provider identities for membership sync. Never exposed through public client grants.';
comment on function public.viewer_membership() is
  'Returns the signed-in non-anonymous viewer membership row, or a free default when none exists. Uses invoker RLS.';
comment on function public.upsert_membership(
  uuid,
  text,
  text,
  text,
  timestamptz,
  text,
  text,
  text,
  text
) is
  'Service-role membership upsert entrypoint for Stripe/App Store/manual sync without exposing provider ids to clients.';
