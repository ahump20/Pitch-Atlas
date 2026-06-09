-- Pitch Atlas — discussion forum access fix (2026-06-06)
-- ----------------------------------------------------------------------------
-- Two gaps the dormant community never exercised, found by a live smoke test:
--
-- 1. public.profiles has a world-readable policy (profiles_read USING true) but no
--    table GRANT to anon/authenticated. A policy without a grant is dead weight:
--    any query whose RLS policy reads profiles (the discussion admin-check subquery,
--    and getIdentity) raised "permission denied for table profiles" -> 403. Granting
--    SELECT completes the config the profiles_read policy already intends.
--
-- 2. profiles_self_update blocks ANONYMOUS users from updating their own row, so the
--    upload-terms acceptance cannot live on profiles for an anon contributor. Move it
--    to its own table the contributor can write, and point the media trigger at it.
-- ----------------------------------------------------------------------------

-- 1) Let clients read profiles (handles are public by the existing policy's intent).
grant select on public.profiles to anon, authenticated;

-- 2) Upload-terms acceptance the contributor can record themselves (anon or claimed).
create table if not exists public.discussion_media_terms (
  user_id     uuid primary key default auth.uid() references public.profiles(id) on delete cascade,
  accepted_at timestamptz not null default now()
);
alter table public.discussion_media_terms enable row level security;
grant select, insert on public.discussion_media_terms to anon, authenticated;

drop policy if exists dmt_select on public.discussion_media_terms;
create policy dmt_select on public.discussion_media_terms for select
  using (user_id = auth.uid());

drop policy if exists dmt_insert on public.discussion_media_terms;
create policy dmt_insert on public.discussion_media_terms for insert
  with check (user_id = auth.uid());

-- 3) The media trigger now reads the terms-acceptance table (SECURITY DEFINER, so it
--    sees it regardless of the caller's grants). Everything else unchanged.
create or replace function public.enforce_discussion_media_limits()
  returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_recent int;
begin
  if not exists (select 1 from public.discussion_media_terms where user_id = new.owner_id) then
    raise exception 'media_blocked: please accept the upload terms before posting media';
  end if;
  if new.mime_type not in ('image/jpeg','image/png','image/webp','image/gif',
                           'video/mp4','video/webm','video/quicktime') then
    raise exception 'media_blocked: that file type is not allowed here';
  end if;
  if new.kind = 'image' and new.mime_type not like 'image/%' then
    raise exception 'media_blocked: the file type does not match an image';
  end if;
  if new.kind = 'video' and new.mime_type not like 'video/%' then
    raise exception 'media_blocked: the file type does not match a video';
  end if;
  if new.kind = 'image' and new.byte_size > 8 * 1024 * 1024 then
    raise exception 'media_blocked: images must be under 8 MB';
  end if;
  if new.kind = 'video' and new.byte_size > 50 * 1024 * 1024 then
    raise exception 'media_blocked: videos must be under 50 MB';
  end if;
  select count(*) into v_recent from public.discussion_media
  where owner_id = new.owner_id and created_at > now() - interval '1 hour';
  if v_recent >= 20 then
    raise exception 'rate_limit: too many uploads in a short time — please slow down';
  end if;
  return new;
end; $$;
revoke execute on function public.enforce_discussion_media_limits() from public, anon, authenticated;

comment on table public.discussion_media_terms is 'One row per account that has accepted the upload terms. The media trigger gates inserts on it. Anonymous users can write here (unlike profiles_self_update).';
