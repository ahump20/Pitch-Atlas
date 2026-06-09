-- Pitch Atlas — per-topic discussion forum with native media uploads (2026-06-06)
-- ----------------------------------------------------------------------------
-- A general conversation layer that sits alongside the structured Field Notes:
-- a visitor can post a comment under any pitch or topic, reply once, and attach
-- their own images and video. Built as its own tables (not bent into the tightly
-- structured field_notes grip-tweak schema), but it reuses the proven safety
-- floor: the same anonymous sign-in + profiles, the same Scunthorpe-safe banned-
-- term matcher (public.text_has_banned_term), the same report-driven auto-hide,
-- and the same "priced in accounts" rate limiting.
--
-- Native uploads are real exposure, so the safety floor ships WITH the feature:
--   1. own-folder-only storage writes        (storage RLS on the owner's uid)
--   2. mime allowlist + per-kind size caps    (bucket + a re-check trigger; SVG is
--                                               excluded as an XSS vector)
--   3. an upload-terms gate                    (no media until the account has
--                                               accepted: own-the-rights / no
--                                               copyrighted footage / no minors)
--   4. report -> auto-hide on media (2 distinct accounts) and posts (3); a hidden
--      media row stops being served the instant it flips, because the storage read
--      policy joins to a visible row
--   5. per-account upload + post rate limits
-- Deferred and flagged in docs/community-media-moderation.md: automated content
-- scanning, bot protection (Turnstile), EXIF scrub, orphan-object GC.
-- Everything here is additive and reversible; no existing table is modified except
-- one nullable column added to profiles.
-- ----------------------------------------------------------------------------

-- 0) Upload-terms acceptance lives on the profile (one timestamp per account).
alter table public.profiles
  add column if not exists media_terms_accepted_at timestamptz;

-- 1) The posts. A reply is just a post with a parent; one level deep only.
create table if not exists public.discussion_posts (
  id           uuid primary key default gen_random_uuid(),
  topic_key    text not null check (char_length(topic_key) between 1 and 120),
  author_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  parent_id    uuid references public.discussion_posts(id) on delete cascade,
  body         text not null check (char_length(body) between 1 and 4000),
  is_hidden    boolean not null default false,
  report_count int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists discussion_posts_topic_idx
  on public.discussion_posts (topic_key, created_at) where is_hidden = false;
create index if not exists discussion_posts_parent_idx
  on public.discussion_posts (parent_id);
create index if not exists discussion_posts_author_idx
  on public.discussion_posts (author_id);
alter table public.discussion_posts enable row level security;

-- 2) The media attached to a post. One post, many media. Storage holds the bytes;
--    this row is the source of truth for visibility.
create table if not exists public.discussion_media (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.discussion_posts(id) on delete cascade,
  owner_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  topic_key    text not null,
  storage_path text not null unique,
  mime_type    text not null,
  kind         text not null check (kind in ('image','video')),
  byte_size    bigint not null,
  width        int,
  height       int,
  duration_s   numeric,
  is_hidden    boolean not null default false,
  report_count int not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists discussion_media_post_idx
  on public.discussion_media (post_id) where is_hidden = false;
create index if not exists discussion_media_topic_idx
  on public.discussion_media (topic_key) where is_hidden = false;
alter table public.discussion_media enable row level security;

-- 3) Reports target either a post or a media item (exactly one).
create table if not exists public.discussion_reports (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid references public.discussion_posts(id) on delete cascade,
  media_id    uuid references public.discussion_media(id) on delete cascade,
  reporter_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  reason      text check (reason is null or char_length(reason) <= 300),
  status      text not null default 'open' check (status in ('open','reviewed','actioned','dismissed')),
  created_at  timestamptz not null default now(),
  constraint discussion_reports_one_target check ((post_id is null) <> (media_id is null))
);
create unique index if not exists discussion_reports_one_per_post
  on public.discussion_reports (post_id, reporter_id) where post_id is not null;
create unique index if not exists discussion_reports_one_per_media
  on public.discussion_reports (media_id, reporter_id) where media_id is not null;
alter table public.discussion_reports enable row level security;

-- ----------------------------------------------------------------------------
-- Triggers (all SECURITY DEFINER, search_path pinned, EXECUTE revoked at the end)
-- ----------------------------------------------------------------------------

-- One level of threading: a reply cannot be replied to, and it inherits its
-- parent's topic so the whole thread comes back in one topic query.
create or replace function public.enforce_discussion_depth()
  returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_parent_parent uuid;
  v_parent_topic  text;
begin
  if new.parent_id is not null then
    select parent_id, topic_key into v_parent_parent, v_parent_topic
    from public.discussion_posts where id = new.parent_id;
    if v_parent_topic is null then
      raise exception 'invalid_parent: that comment no longer exists';
    end if;
    if v_parent_parent is not null then
      raise exception 'too_deep: replies cannot be replied to';
    end if;
    new.topic_key := v_parent_topic;
  end if;
  return new;
end; $$;
drop trigger if exists trg_discussion_depth on public.discussion_posts;
create trigger trg_discussion_depth
  before insert on public.discussion_posts
  for each row execute function public.enforce_discussion_depth();

-- Content guard: the body and the public handle run through the shared matcher,
-- on insert and on any edit to either, so a clean post cannot be edited dirty.
create or replace function public.enforce_discussion_content_safety()
  returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if public.text_has_banned_term(new.body) or public.text_has_banned_term(new.display_name) then
    raise exception 'content_blocked: that post contains language we do not allow here';
  end if;
  return new;
end; $$;
drop trigger if exists trg_discussion_content_safety on public.discussion_posts;
create trigger trg_discussion_content_safety
  before insert or update of body, display_name on public.discussion_posts
  for each row execute function public.enforce_discussion_content_safety();

-- Post rate limit: 15 posts per rolling hour per account (replies included).
create or replace function public.enforce_discussion_rate_limit()
  returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_recent int;
begin
  select count(*) into v_recent from public.discussion_posts
  where author_id = new.author_id and created_at > now() - interval '1 hour';
  if v_recent >= 15 then
    raise exception 'rate_limit: too many posts in a short time — please slow down and try again later';
  end if;
  return new;
end; $$;
drop trigger if exists trg_discussion_rate_limit on public.discussion_posts;
create trigger trg_discussion_rate_limit
  before insert on public.discussion_posts
  for each row execute function public.enforce_discussion_rate_limit();

-- Media limits: terms gate, mime allowlist (SVG excluded), kind/mime match,
-- per-kind size caps, and an upload rate limit. The real boundary the public
-- key cannot cross.
create or replace function public.enforce_discussion_media_limits()
  returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_accepted timestamptz; v_recent int;
begin
  select media_terms_accepted_at into v_accepted from public.profiles where id = new.owner_id;
  if v_accepted is null then
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
drop trigger if exists trg_discussion_media_limits on public.discussion_media;
create trigger trg_discussion_media_limits
  before insert on public.discussion_media
  for each row execute function public.enforce_discussion_media_limits();

-- Report -> auto-hide. A post hides at 3 distinct reporters, a media item at 2
-- (media is the higher-exposure surface, so it is more conservative). Hiding is
-- reversible: an admin clears is_hidden to restore. The report_count is kept in
-- sync for one-glance triage.
create or replace function public.on_discussion_report()
  returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_distinct int;
begin
  if new.post_id is not null then
    select count(distinct reporter_id) into v_distinct
    from public.discussion_reports where post_id = new.post_id and status = 'open';
    update public.discussion_posts set report_count = v_distinct where id = new.post_id;
    if v_distinct >= 3 then
      update public.discussion_posts set is_hidden = true, updated_at = now()
      where id = new.post_id and is_hidden = false;
    end if;
  else
    select count(distinct reporter_id) into v_distinct
    from public.discussion_reports where media_id = new.media_id and status = 'open';
    update public.discussion_media set report_count = v_distinct where id = new.media_id;
    if v_distinct >= 2 then
      update public.discussion_media set is_hidden = true where id = new.media_id and is_hidden = false;
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists trg_discussion_report on public.discussion_reports;
create trigger trg_discussion_report
  after insert on public.discussion_reports
  for each row execute function public.on_discussion_report();

-- ----------------------------------------------------------------------------
-- RLS policies
-- ----------------------------------------------------------------------------

-- Posts: anyone reads a visible post; the author always sees their own (even
-- hidden, so the UI can show "under review"). Insert only as yourself. Delete
-- your own; an admin can delete any. No public UPDATE — edits are out of v1, and
-- is_hidden flips only via the SECURITY DEFINER report trigger.
drop policy if exists discussion_posts_read on public.discussion_posts;
create policy discussion_posts_read on public.discussion_posts for select
  using (is_hidden = false or author_id = auth.uid()
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists discussion_posts_insert on public.discussion_posts;
create policy discussion_posts_insert on public.discussion_posts for insert
  with check (author_id = auth.uid());

drop policy if exists discussion_posts_delete on public.discussion_posts;
create policy discussion_posts_delete on public.discussion_posts for delete
  using (author_id = auth.uid()
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Media: visible media on a visible post is public; the owner always sees their
-- own. Insert only onto your own post, as yourself. Delete your own (or admin).
drop policy if exists discussion_media_read on public.discussion_media;
create policy discussion_media_read on public.discussion_media for select
  using (
    (is_hidden = false and exists (
      select 1 from public.discussion_posts dp where dp.id = post_id and dp.is_hidden = false))
    or owner_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists discussion_media_insert on public.discussion_media;
create policy discussion_media_insert on public.discussion_media for insert
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.discussion_posts dp
                where dp.id = post_id and dp.author_id = auth.uid())
  );

drop policy if exists discussion_media_delete on public.discussion_media;
create policy discussion_media_delete on public.discussion_media for delete
  using (owner_id = auth.uid()
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Reports: write-only for the reporter; only an admin can read the queue.
drop policy if exists discussion_reports_insert on public.discussion_reports;
create policy discussion_reports_insert on public.discussion_reports for insert
  with check (reporter_id = auth.uid());

drop policy if exists discussion_reports_admin_read on public.discussion_reports;
create policy discussion_reports_admin_read on public.discussion_reports for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ----------------------------------------------------------------------------
-- Storage: a private bucket for the uploads, served only through a visible row.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'discussion-media', 'discussion-media', false, 52428800,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Upload only into your own folder ({uid}/...). The uid path segment is the boundary.
drop policy if exists discussion_media_object_insert on storage.objects;
create policy discussion_media_object_insert on storage.objects for insert to authenticated, anon
  with check (bucket_id = 'discussion-media' and (storage.foldername(name))[1] = auth.uid()::text);

-- Public read only when a visible discussion_media row points at the object.
drop policy if exists discussion_media_object_read on storage.objects;
create policy discussion_media_object_read on storage.objects for select to authenticated, anon
  using (
    bucket_id = 'discussion-media'
    and exists (
      select 1 from public.discussion_media m
      where m.storage_path = name and m.is_hidden = false
        and exists (select 1 from public.discussion_posts dp
                    where dp.id = m.post_id and dp.is_hidden = false))
  );

-- Delete only your own objects.
drop policy if exists discussion_media_object_delete on storage.objects;
create policy discussion_media_object_delete on storage.objects for delete to authenticated, anon
  using (bucket_id = 'discussion-media' and (storage.foldername(name))[1] = auth.uid()::text);

-- ----------------------------------------------------------------------------
-- Lock down the trigger functions; they are reached only through triggers.
-- ----------------------------------------------------------------------------
revoke execute on function public.enforce_discussion_depth()          from public, anon, authenticated;
revoke execute on function public.enforce_discussion_content_safety() from public, anon, authenticated;
revoke execute on function public.enforce_discussion_rate_limit()     from public, anon, authenticated;
revoke execute on function public.enforce_discussion_media_limits()   from public, anon, authenticated;
revoke execute on function public.on_discussion_report()              from public, anon, authenticated;

comment on table public.discussion_posts is 'Per-topic discussion comments + one-level replies. Reuses the field_notes safety floor (banned-term matcher, report auto-hide, account-priced rate limits).';
comment on table public.discussion_media is 'Native image/video uploads on a discussion post. Storage holds bytes; this row is the visibility source of truth. Hidden row -> storage read policy stops serving.';
comment on table public.discussion_reports is 'Report queue for posts and media. 3 distinct reporters auto-hide a post, 2 auto-hide a media item, pending admin review.';
