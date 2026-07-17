-- Replace the broken direct storage.objects deletion with the supported Storage
-- API path. A private upload reservation closes the race between finalizing a
-- discussion_media row and the Edge Function removing an object it had already
-- classified as orphaned. Upload-first iOS clients remain compatible through a
-- separate 23-hour legacy finalization window; GC does not begin until 24 hours.

create table if not exists private.discussion_media_upload_reservations (
  storage_path text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  reserved_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '25 hours'),
  constraint discussion_media_upload_reservations_expiry
    check (expires_at > reserved_at)
);

create index if not exists discussion_media_upload_reservations_owner_expiry_idx
  on private.discussion_media_upload_reservations (owner_id, expires_at);

alter table private.discussion_media_upload_reservations enable row level security;
revoke all on table private.discussion_media_upload_reservations
  from public, anon, authenticated;
grant select, delete on table private.discussion_media_upload_reservations
  to service_role;

comment on table private.discussion_media_upload_reservations is
  'Short-lived owner-bound claims created before discussion-media Storage uploads. Active claims protect upload finalization and orphan cleanup.';

create or replace function public.reserve_discussion_media_upload(p_storage_path text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  viewer_id uuid := (select auth.uid());
  viewer_is_anonymous boolean := coalesce(
    (((select auth.jwt()) ->> 'is_anonymous')::boolean),
    true
  );
  existing_owner uuid;
  existing_expires_at timestamptz;
  active_count integer;
begin
  if viewer_id is null or viewer_is_anonymous then
    raise exception 'Permanent account required'
      using errcode = '42501';
  end if;

  if p_storage_path is null
     or pg_catalog.char_length(p_storage_path) > 1024
     or pg_catalog.split_part(p_storage_path, '/', 1) <> viewer_id::text
     or pg_catalog.char_length(
       pg_catalog.substr(p_storage_path, pg_catalog.char_length(viewer_id::text) + 2)
     ) = 0 then
    raise exception 'media_blocked: upload path must stay inside your account folder'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.discussion_media_terms t
    where t.user_id = viewer_id
  ) then
    raise exception 'media_blocked: please accept the upload terms before posting media'
      using errcode = '42501';
  end if;

  -- Serialize reservation counts per account so concurrent tabs cannot step over
  -- the active-reservation cap.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(viewer_id::text, 20260717032343::bigint)
  );

  -- A reservation is only valid when it predates the object. Never let a caller
  -- reserve an old orphan and thereby pull it back out of the GC set.
  if exists (
    select 1
    from storage.objects o
    where o.bucket_id = 'discussion-media'
      and o.name = p_storage_path
  ) then
    raise exception 'media_blocked: that upload path is already in use'
      using errcode = '23505';
  end if;

  select r.owner_id, r.expires_at
  into existing_owner, existing_expires_at
  from private.discussion_media_upload_reservations r
  where r.storage_path = p_storage_path
  for update;

  if found and existing_owner <> viewer_id then
    raise exception 'media_blocked: that upload path is already reserved'
      using errcode = '42501';
  end if;

  -- A same-owner retry before upload is idempotent. Preserve reserved_at so it
  -- remains provably earlier than the Storage object created after this call.
  if found and existing_expires_at > pg_catalog.now() then
    return;
  end if;

  select count(*)
  into active_count
  from private.discussion_media_upload_reservations r
  where r.owner_id = viewer_id
    and r.expires_at > pg_catalog.now();

  if active_count >= 20 then
    raise exception 'rate_limit: too many media uploads are already pending'
      using errcode = '54000';
  end if;

  insert into private.discussion_media_upload_reservations (
    storage_path,
    owner_id,
    reserved_at,
    expires_at
  )
  values (
    p_storage_path,
    viewer_id,
    pg_catalog.now(),
    pg_catalog.now() + interval '25 hours'
  )
  on conflict (storage_path) do update
    set owner_id = excluded.owner_id,
        reserved_at = excluded.reserved_at,
        expires_at = excluded.expires_at;
end;
$$;

create or replace function public.release_discussion_media_upload(p_storage_path text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  viewer_id uuid := (select auth.uid());
  viewer_is_anonymous boolean := coalesce(
    (((select auth.jwt()) ->> 'is_anonymous')::boolean),
    true
  );
begin
  if viewer_id is null or viewer_is_anonymous then
    raise exception 'Permanent account required'
      using errcode = '42501';
  end if;

  if p_storage_path is null
     or pg_catalog.split_part(p_storage_path, '/', 1) <> viewer_id::text then
    raise exception 'media_blocked: upload path must stay inside your account folder'
      using errcode = '22023';
  end if;

  -- Idempotent by design: cleanup can safely retry after an interrupted request.
  delete from private.discussion_media_upload_reservations r
  where r.storage_path = p_storage_path
    and r.owner_id = viewer_id;
end;
$$;

revoke all on function public.reserve_discussion_media_upload(text)
  from public, anon, authenticated;
revoke all on function public.release_discussion_media_upload(text)
  from public, anon, authenticated;
grant execute on function public.reserve_discussion_media_upload(text)
  to authenticated;
grant execute on function public.release_discussion_media_upload(text)
  to authenticated;

comment on function public.reserve_discussion_media_upload(text) is
  'Reserves a new own-folder discussion-media path for a permanent account that accepted upload terms. Limited to 20 active reservations.';
comment on function public.release_discussion_media_upload(text) is
  'Idempotently releases the current permanent account own-folder upload reservation.';

-- Finalization requires a real object. Reservation-aware web uploads may finish
-- while their claim is active. Upload-first legacy/iOS clients may finish only
-- during the first 23 hours, leaving a full hour before GC eligibility at 24.
create or replace function private.enforce_discussion_media_storage_finalization()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  object_created_at timestamptz;
  has_active_reservation boolean;
begin
  if pg_catalog.split_part(new.storage_path, '/', 1) <> new.owner_id::text then
    raise exception 'media_blocked: upload path must stay inside your account folder';
  end if;

  select o.created_at
  into object_created_at
  from storage.objects o
  where o.bucket_id = 'discussion-media'
    and o.name = new.storage_path;

  if object_created_at is null then
    raise exception 'media_blocked: the uploaded media object does not exist';
  end if;

  select exists (
    select 1
    from private.discussion_media_upload_reservations r
    where r.storage_path = new.storage_path
      and r.owner_id = new.owner_id
      and r.expires_at > pg_catalog.now()
      and r.reserved_at <= object_created_at
  )
  into has_active_reservation;

  if not has_active_reservation
     and object_created_at <= (pg_catalog.statement_timestamp() - interval '23 hours') then
    raise exception 'media_blocked: that upload expired before it was attached';
  end if;

  return new;
end;
$$;

create or replace function private.consume_discussion_media_upload_reservation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from private.discussion_media_upload_reservations r
  where r.storage_path = new.storage_path
    and r.owner_id = new.owner_id;
  return new;
end;
$$;

revoke all on function private.enforce_discussion_media_storage_finalization()
  from public, anon, authenticated;
revoke all on function private.consume_discussion_media_upload_reservation()
  from public, anon, authenticated;

drop trigger if exists trg_discussion_media_storage_finalization
  on public.discussion_media;
create trigger trg_discussion_media_storage_finalization
  before insert on public.discussion_media
  for each row execute function private.enforce_discussion_media_storage_finalization();

drop trigger if exists trg_discussion_media_reservation_consume
  on public.discussion_media;
create trigger trg_discussion_media_reservation_consume
  after insert on public.discussion_media
  for each row execute function private.consume_discussion_media_upload_reservation();

create or replace function public.orphan_discussion_media_paths(p_limit integer default 1000)
returns table(storage_path text)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
begin
  -- Pruning is part of each GC lookup so abandoned reservations cannot accumulate
  -- or shield an object after their explicit expiry.
  delete from private.discussion_media_upload_reservations r
  where r.expires_at <= pg_catalog.now();

  return query
  select o.name::text
  from storage.objects o
  where o.bucket_id = 'discussion-media'
    and o.created_at < (pg_catalog.now() - interval '24 hours')
    and not exists (
      select 1
      from public.discussion_media m
      where m.storage_path = o.name
    )
    and not exists (
      select 1
      from private.discussion_media_upload_reservations r
      where r.storage_path = o.name
        and r.expires_at > pg_catalog.now()
    )
  order by o.created_at asc, o.name asc
  limit greatest(1, least(coalesce(p_limit, 1000), 1000));
end;
$$;

revoke all on function public.orphan_discussion_media_paths(integer) from public, anon, authenticated;
grant execute on function public.orphan_discussion_media_paths(integer) to service_role;

comment on function public.orphan_discussion_media_paths(integer) is
  'Service-role-only orphan path lookup. Storage removal must use the Storage API.';

-- The scheduler holds a random shared secret in Vault. The Edge Function hashes
-- the request header before PostgREST sees it, and this narrowly granted RPC
-- compares only SHA-256 digests. The raw secret never enters an API request body.
do $$
begin
  if not exists (
    select 1
    from vault.secrets
    where name = 'pitch_atlas_automations_shared_secret'
  ) then
    perform vault.create_secret(
      pg_catalog.encode(extensions.gen_random_bytes(32), 'hex'),
      'pitch_atlas_automations_shared_secret',
      'Pitch Atlas orphan-media GC shared secret'
    );
  end if;
end $$;

create or replace function public.authorize_discussion_media_gc(
  p_token_sha256 text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p_token_sha256 is null
      or p_token_sha256 !~ '^[0-9a-f]{64}$'
      then false
    else coalesce((
      select pg_catalog.lower(p_token_sha256) = pg_catalog.encode(
        extensions.digest(s.decrypted_secret, 'sha256'),
        'hex'
      )
      from vault.decrypted_secrets s
      where s.name = 'pitch_atlas_automations_shared_secret'
      limit 1
    ), false)
  end;
$$;

revoke all on function public.authorize_discussion_media_gc(text)
  from public, anon, authenticated, service_role;
grant execute on function public.authorize_discussion_media_gc(text)
  to anon;

comment on function public.authorize_discussion_media_gc(text) is
  'Hash-only authorization gate for the orphan-media Edge Function. The raw Vault secret must never be sent through PostgREST.';

create table if not exists private.discussion_media_gc_runs (
  id bigint generated always as identity primary key,
  ran_at timestamptz not null default now(),
  status text not null check (status in ('ok', 'partial', 'error')),
  requested integer not null check (requested >= 0),
  removed integer not null check (removed >= 0 and removed <= requested),
  error_code text
);

revoke all on table private.discussion_media_gc_runs from public, anon, authenticated;

create or replace function public.record_discussion_media_gc_run(
  p_status text,
  p_requested integer,
  p_removed integer,
  p_error_code text default null
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if p_status not in ('ok', 'partial', 'error') then
    raise exception 'invalid media GC status';
  end if;

  insert into private.discussion_media_gc_runs (status, requested, removed, error_code)
  values (p_status, p_requested, p_removed, p_error_code);

  delete from private.discussion_media_gc_runs
  where ran_at < (now() - interval '90 days');
end;
$$;

revoke all on function public.record_discussion_media_gc_run(text, integer, integer, text)
  from public, anon, authenticated;
grant execute on function public.record_discussion_media_gc_run(text, integer, integer, text)
  to service_role;

do $$
begin
  perform cron.unschedule('gc-orphan-discussion-media');
exception when others then
  null;
end $$;

drop function if exists private.gc_orphan_discussion_media();

select cron.schedule(
  'gc-orphan-discussion-media',
  '0 * * * *',
  $job$
    select net.http_post(
      url := rtrim((
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'pitch_atlas_project_url'
      ), '/') || '/functions/v1/gc-orphan-discussion-media',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Pitch-Atlas-Automation', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'pitch_atlas_automations_shared_secret'
        )
      ),
      body := jsonb_build_object('source', 'pg_cron'),
      timeout_milliseconds := 15000
    ) as request_id;
  $job$
)
where exists (
  select 1
  from vault.secrets
  where name = 'pitch_atlas_automations_shared_secret'
)
and exists (
  select 1
  from vault.secrets
  where name = 'pitch_atlas_project_url'
);
