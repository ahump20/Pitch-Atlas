-- Prepare trusted media validation before deploying the updated upload client.
-- The following migration enables mandatory attestations after that deployment.

-- Keep the existing same-author cascade, but never cascade through a different
-- contributor. Detached replies keep their topic/media and become root comments.
create or replace function private.preserve_discussion_replies()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.discussion_posts
  set parent_id = null, is_hidden = is_hidden or old.is_hidden
  where parent_id = old.id and author_id is distinct from old.author_id;
  return old;
end;
$$;
revoke all on function private.preserve_discussion_replies() from public, anon, authenticated;
create trigger trg_preserve_discussion_replies
before delete on public.discussion_posts
for each row execute function private.preserve_discussion_replies();

-- Admission history survives object deletion/reservation release, so those
-- operations cannot recycle the hourly quota. Prune only this owner's old rows.
create table private.discussion_upload_admissions (
  object_id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  admitted_at timestamptz not null default now()
);
create index discussion_upload_admissions_owner_time
on private.discussion_upload_admissions (owner_id, admitted_at);
alter table private.discussion_upload_admissions enable row level security;
revoke all on private.discussion_upload_admissions from public, anon, authenticated;

create or replace function private.enforce_discussion_upload_admission()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  -- Storage probes permissions as the caller, rolls that transaction back, then
  -- commits as service_role. owner_id remains the verified upload token's owner.
  viewer_id uuid;
  recent_count integer;
begin
  if new.bucket_id <> 'discussion-media' then return new; end if;
  viewer_id := coalesce(new.owner_id, new.owner::text)::uuid;
  if viewer_id is null
     or not exists (select 1 from auth.users where id = viewer_id and is_anonymous = false)
     or ((select auth.role()) is distinct from 'service_role'
       and ((select auth.uid()) is distinct from viewer_id
         or coalesce((((select auth.jwt()) ->> 'is_anonymous')::boolean), true)))
     or pg_catalog.split_part(new.name, '/', 1) <> viewer_id::text then
    raise exception 'media_blocked: a permanent account and your own upload folder are required'
      using errcode = '42501';
  end if;
  if not exists (select 1 from public.discussion_media_terms where user_id = viewer_id) then
    raise exception 'media_blocked: please accept the upload terms before posting media'
      using errcode = '42501';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(viewer_id::text, 20260929223000::bigint)
  );
  if exists (select 1 from public.discussion_media where storage_path = new.name) then
    raise exception 'media_blocked: that upload path is already attached to a post'
      using errcode = '23505';
  end if;
  delete from private.discussion_upload_admissions
  where owner_id = viewer_id and admitted_at <= pg_catalog.now() - interval '1 hour';
  select count(*) into recent_count from private.discussion_upload_admissions
  where owner_id = viewer_id;
  if recent_count >= 20 then
    raise exception 'rate_limit: too many uploads in a short time — please slow down'
      using errcode = '54000';
  end if;
  insert into private.discussion_upload_admissions (object_id, owner_id)
  values (new.id, viewer_id);
  return new;
end;
$$;
revoke all on function private.enforce_discussion_upload_admission() from public, anon, authenticated;
create trigger trg_discussion_upload_admission
before insert on storage.objects
for each row execute function private.enforce_discussion_upload_admission();

-- Storage may finish signed uploads as service_role, outside client UPDATE RLS.
-- Keep content/identity immutable there too; access timestamps may still change.
create or replace function private.prevent_discussion_object_replacement()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (old.bucket_id = 'discussion-media' or new.bucket_id = 'discussion-media')
     and (to_jsonb(old) - 'updated_at' - 'last_accessed_at')
       is distinct from (to_jsonb(new) - 'updated_at' - 'last_accessed_at') then
    raise exception 'media_blocked: upload replacement requires a new path';
  end if;
  return new;
end;
$$;
revoke all on function private.prevent_discussion_object_replacement()
  from public, anon, authenticated;
create trigger trg_discussion_object_immutable before update on storage.objects
for each row execute function private.prevent_discussion_object_replacement();

-- A public caller cannot mutate validated bytes in place, even if another
-- permissive policy is introduced for a different bucket later.
create policy discussion_media_no_client_replace on storage.objects
as restrictive for update to anon, authenticated
using (bucket_id <> 'discussion-media') with check (bucket_id <> 'discussion-media');

create table private.discussion_media_validations (
  object_id uuid primary key references storage.objects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  byte_size bigint not null check (byte_size > 0),
  mime_type text not null,
  kind text not null check (kind in ('image', 'video')),
  validated_at timestamptz not null default now()
);
alter table private.discussion_media_validations enable row level security;
revoke all on private.discussion_media_validations from public, anon, authenticated;

create table private.discussion_media_validation_attempts (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 0
);
alter table private.discussion_media_validation_attempts enable row level security;
revoke all on private.discussion_media_validation_attempts from public, anon, authenticated;

-- Only the verified-caller Edge function can capture or attest an object. Capture
-- identity BEFORE reading bytes; record checks the same identity after download.
create or replace function public.discussion_media_validation_object(
  p_owner_id uuid, p_storage_path text
) returns table (object_id uuid)
language plpgsql security definer set search_path = '' as $$
declare attempt_count integer;
begin
  if p_storage_path is null or pg_catalog.char_length(p_storage_path) > 1024
     or pg_catalog.split_part(p_storage_path, '/', 1) <> p_owner_id::text
     or not exists (select 1 from auth.users where id = p_owner_id and is_anonymous = false)
     or not exists (select 1 from public.discussion_media_terms where user_id = p_owner_id) then
    raise exception 'media_blocked: upload ownership, account and terms must be verified'
      using errcode = '42501';
  end if;
  -- Bound privileged downloads, including repeated validation of invalid files.
  insert into private.discussion_media_validation_attempts (owner_id, attempts)
  values (p_owner_id, 1)
  on conflict (owner_id) do update set
    attempts = case when discussion_media_validation_attempts.window_started_at
      <= pg_catalog.now() - interval '1 hour' then 1
      else discussion_media_validation_attempts.attempts + 1 end,
    window_started_at = case when discussion_media_validation_attempts.window_started_at
      <= pg_catalog.now() - interval '1 hour' then pg_catalog.now()
      else discussion_media_validation_attempts.window_started_at end
  returning attempts into attempt_count;
  if attempt_count > 40 then
    raise exception 'rate_limit: too many upload validation attempts — please slow down'
      using errcode = '54000';
  end if;
  return query select o.id from storage.objects o
  where o.bucket_id = 'discussion-media' and o.name = p_storage_path;
end;
$$;

create or replace function public.record_discussion_media_validation(
  p_owner_id uuid, p_storage_path text, p_object_id uuid,
  p_byte_size bigint, p_mime_type text, p_kind text
) returns void language plpgsql security definer set search_path = '' as $$
declare captured_id uuid;
begin
  if p_storage_path is null or pg_catalog.char_length(p_storage_path) > 1024
     or pg_catalog.split_part(p_storage_path, '/', 1) <> p_owner_id::text
     or not exists (select 1 from auth.users where id = p_owner_id and is_anonymous = false)
     or not exists (select 1 from public.discussion_media_terms where user_id = p_owner_id) then
    raise exception 'media_blocked: upload ownership, account and terms must be verified'
      using errcode = '42501';
  end if;
  select o.id into captured_id from storage.objects o
  where o.bucket_id = 'discussion-media' and o.name = p_storage_path;
  if captured_id is null or captured_id <> p_object_id then
    raise exception 'media_blocked: that upload changed during validation';
  end if;
  -- Prevent delete/reupload while recording the attestation.
  perform 1 from storage.objects
  where id = p_object_id and bucket_id = 'discussion-media' and name = p_storage_path
  for share;
  if not found then raise exception 'media_blocked: that upload changed during validation'; end if;
  if p_byte_size is null or p_byte_size <= 0
     or p_kind is null or p_mime_type is null
     or not (
       (p_kind = 'image' and p_mime_type in ('image/jpeg','image/png','image/webp','image/gif')
         and p_byte_size <= 8 * 1024 * 1024)
       or (p_kind = 'video' and p_mime_type in ('video/mp4','video/webm','video/quicktime')
         and p_byte_size <= 50 * 1024 * 1024)
     ) then
    raise exception 'media_blocked: the actual file type or size is not allowed';
  end if;
  insert into private.discussion_media_validations
    (object_id, owner_id, storage_path, byte_size, mime_type, kind)
  values (p_object_id, p_owner_id, p_storage_path, p_byte_size, p_mime_type, p_kind)
  on conflict (object_id) do update set
    owner_id = excluded.owner_id, storage_path = excluded.storage_path,
    byte_size = excluded.byte_size, mime_type = excluded.mime_type,
    kind = excluded.kind, validated_at = pg_catalog.now();
end;
$$;
grant execute on function public.discussion_media_validation_object(uuid, text) to service_role;
grant execute on function public.record_discussion_media_validation(uuid, text, uuid, bigint, text, text)
  to service_role;
revoke execute on function public.discussion_media_validation_object(uuid, text)
  from public, anon, authenticated;
revoke execute on function public.record_discussion_media_validation(uuid, text, uuid, bigint, text, text)
  from public, anon, authenticated;

-- FK inserts hold KEY SHARE. NO KEY UPDATE serializes reporters without an
-- incompatible lock upgrade. A separate VOLATILE statement counts after waiting.
create or replace function public.on_discussion_report()
returns trigger language plpgsql volatile security definer set search_path = '' as $$
declare v_distinct integer;
begin
  if new.post_id is not null then
    perform 1 from public.discussion_posts where id = new.post_id for no key update;
    select count(distinct reporter_id) into v_distinct from public.discussion_reports
    where post_id = new.post_id and status = 'open';
    update public.discussion_posts set report_count = v_distinct,
      is_hidden = is_hidden or v_distinct >= 3,
      updated_at = case when v_distinct >= 3 then now() else updated_at end
    where id = new.post_id;
  else
    perform 1 from public.discussion_media where id = new.media_id for no key update;
    select count(distinct reporter_id) into v_distinct from public.discussion_reports
    where media_id = new.media_id and status = 'open';
    update public.discussion_media set report_count = v_distinct,
      is_hidden = is_hidden or v_distinct >= 2 where id = new.media_id;
  end if;
  return new;
end;
$$;

create or replace function public.on_note_report_autohide()
returns trigger language plpgsql volatile security definer set search_path = '' as $$
declare v_distinct integer; v_author uuid;
begin
  perform 1 from public.field_notes where id = new.note_id for no key update;
  select count(distinct reporter_id) into v_distinct from public.note_reports
  where note_id = new.note_id and status = 'open';
  if v_distinct >= 3 then
    update public.field_notes set is_hidden = true, updated_at = now()
    where id = new.note_id and is_hidden = false returning author_id into v_author;
    if v_author is not null then perform public.refresh_author_rollup(v_author); end if;
  end if;
  return new;
end;
$$;
revoke all on function public.on_discussion_report() from public, anon, authenticated;
revoke all on function public.on_note_report_autohide() from public, anon, authenticated;
