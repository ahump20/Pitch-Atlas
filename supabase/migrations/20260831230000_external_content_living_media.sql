-- Pitch Atlas living external-content shelf (2026-08-31)
-- -----------------------------------------------------------------------------
-- Reviewed public posts stay at their original providers. These tables store
-- canonical URLs and Pitch Atlas-authored filing context only; no third-party
-- video bytes and no Instagram oEmbed payloads are persisted.

create table if not exists public.external_sources (
  id             text primary key check (id ~ '^[a-z0-9][a-z0-9-]{2,79}$'),
  platform       text not null check (platform in ('tiktok','x','instagram','youtube')),
  name           text not null check (char_length(name) between 2 and 80),
  handle         text not null check (char_length(handle) between 2 and 80),
  canonical_url  text not null check (canonical_url ~ '^https://'),
  provider_key   text check (provider_key is null or char_length(provider_key) between 1 and 160),
  trust_lane     text not null check (trust_lane in ('trusted-mind','heritage','community-find')),
  ingest_method  text not null check (ingest_method in ('api','official-feed','editorial','community-suggestion')),
  auto_publish   boolean not null default false,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create unique index if not exists external_sources_platform_handle_idx
  on public.external_sources (platform, lower(handle));
alter table public.external_sources enable row level security;

create table if not exists public.external_content_items (
  id                uuid primary key default gen_random_uuid(),
  source_id         text not null references public.external_sources(id) on delete restrict,
  platform          text not null check (platform in ('tiktok','x','instagram','youtube')),
  external_id       text not null check (char_length(external_id) between 3 and 160),
  canonical_url     text not null unique check (canonical_url ~ '^https://'),
  title             text not null check (char_length(title) between 4 and 140),
  lede              text not null check (char_length(lede) between 20 and 500),
  source_caption    text check (source_caption is null or char_length(source_caption) <= 1000),
  published_at      date not null,
  retrieved_at      date not null,
  pitch_slugs       text[] not null default '{}',
  craftsman_slugs   text[] not null default '{}',
  families          text[] not null default '{}',
  topics            text[] not null default '{}',
  trust_lane        text not null check (trust_lane in ('trusted-mind','heritage','community-find')),
  moderation_state  text not null default 'pending' check (moderation_state in ('pending','published','rejected','unavailable')),
  availability      text not null default 'unknown' check (availability in ('available','unknown','removed')),
  embed_mode        text not null default 'official-embed' check (embed_mode in ('official-embed','outbound-only')),
  featured          boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint external_content_families_check
    check (families <@ array['fastball','breaking','offspeed','specialty']::text[]),
  constraint external_content_provider_id_unique unique (platform, external_id)
);
create index if not exists external_content_public_feed_idx
  on public.external_content_items (published_at desc)
  where moderation_state = 'published' and availability <> 'removed';
create index if not exists external_content_pitch_tags_idx
  on public.external_content_items using gin (pitch_slugs);
create index if not exists external_content_craftsman_tags_idx
  on public.external_content_items using gin (craftsman_slugs);
create index if not exists external_content_family_tags_idx
  on public.external_content_items using gin (families);
create index if not exists external_content_topic_tags_idx
  on public.external_content_items using gin (topics);
alter table public.external_content_items enable row level security;

create table if not exists public.external_content_suggestions (
  id                uuid primary key default gen_random_uuid(),
  submitted_by      uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  canonical_url     text not null unique check (canonical_url ~ '^https://'),
  platform          text not null check (platform in ('tiktok','x','instagram','youtube')),
  external_id       text not null check (char_length(external_id) between 3 and 160),
  rationale         text not null check (char_length(rationale) between 10 and 300),
  pitch_slug        text check (pitch_slug is null or pitch_slug ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  review_state      text not null default 'pending' check (review_state in ('pending','accepted','rejected','duplicate')),
  created_at        timestamptz not null default now(),
  reviewed_at       timestamptz,
  constraint external_suggestion_provider_id_unique unique (platform, external_id)
);
create index if not exists external_content_suggestions_review_idx
  on public.external_content_suggestions (review_state, created_at);
create index if not exists external_content_suggestions_submitter_idx
  on public.external_content_suggestions (submitted_by, created_at desc);
alter table public.external_content_suggestions enable row level security;

-- Provider/URL agreement and source-platform agreement are database guarantees,
-- not browser-only validation. Instagram stores only canonical URLs and authored
-- filing fields; an oEmbed response has no column to land in.
create or replace function public.validate_external_content_provider()
  returns trigger
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  v_source_platform text;
begin
  select platform into v_source_platform
  from public.external_sources
  where id = new.source_id;

  if v_source_platform is distinct from new.platform then
    raise exception 'external_content_invalid: source and item platforms do not match';
  end if;
  if new.platform = 'x' and new.canonical_url !~ '^https://(www\.)?(x\.com|twitter\.com)/.+/status/[0-9]+' then
    raise exception 'external_content_invalid: invalid X status URL';
  elsif new.platform = 'tiktok' and new.canonical_url !~ '^https://(www\.)?tiktok\.com/.+/video/[0-9]+' then
    raise exception 'external_content_invalid: invalid TikTok video URL';
  elsif new.platform = 'instagram' and new.canonical_url !~ '^https://(www\.)?instagram\.com/(p|reel)/[^/]+' then
    raise exception 'external_content_invalid: invalid Instagram post URL';
  elsif new.platform = 'youtube' and new.canonical_url !~ '^https://(www\.)?(youtube\.com|youtu\.be)/' then
    raise exception 'external_content_invalid: invalid YouTube URL';
  end if;
  return new;
end;
$$;
drop trigger if exists trg_validate_external_content_provider on public.external_content_items;
create trigger trg_validate_external_content_provider
  before insert or update of source_id, platform, canonical_url
  on public.external_content_items
  for each row execute function public.validate_external_content_provider();

create or replace function public.validate_external_content_suggestion()
  returns trigger
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  v_recent integer;
begin
  if new.submitted_by is distinct from auth.uid() then
    raise exception 'external_suggestion_invalid: submitter must match the signed-in account';
  end if;
  if new.platform = 'x' and new.canonical_url !~ '^https://(www\.)?(x\.com|twitter\.com)/.+/status/[0-9]+' then
    raise exception 'external_suggestion_invalid: invalid X status URL';
  elsif new.platform = 'tiktok' and new.canonical_url !~ '^https://(www\.)?tiktok\.com/.+/video/[0-9]+' then
    raise exception 'external_suggestion_invalid: invalid TikTok video URL';
  elsif new.platform = 'instagram' and new.canonical_url !~ '^https://(www\.)?instagram\.com/(p|reel)/[^/]+' then
    raise exception 'external_suggestion_invalid: invalid Instagram post URL';
  elsif new.platform = 'youtube' and new.canonical_url !~ '^https://(www\.)?(youtube\.com|youtu\.be)/' then
    raise exception 'external_suggestion_invalid: invalid YouTube URL';
  end if;

  if public.text_has_banned_term(new.rationale) then
    raise exception 'content_blocked: that suggestion contains language we do not allow here';
  end if;

  select count(*) into v_recent
  from public.external_content_suggestions
  where submitted_by = new.submitted_by
    and created_at > now() - interval '1 hour';
  if v_recent >= 5 then
    raise exception 'rate_limit: too many suggestions in a short time';
  end if;
  return new;
end;
$$;
drop trigger if exists trg_validate_external_content_suggestion on public.external_content_suggestions;
create trigger trg_validate_external_content_suggestion
  before insert on public.external_content_suggestions
  for each row execute function public.validate_external_content_suggestion();

revoke execute on function public.validate_external_content_provider() from public, anon, authenticated;
revoke execute on function public.validate_external_content_suggestion() from public, anon, authenticated;

drop policy if exists "active external sources are public" on public.external_sources;
create policy "active external sources are public"
  on public.external_sources for select to anon, authenticated
  using (active = true);

drop policy if exists "published external content is public" on public.external_content_items;
create policy "published external content is public"
  on public.external_content_items for select to anon, authenticated
  using (moderation_state = 'published' and availability <> 'removed');

drop policy if exists "contributors file external suggestions" on public.external_content_suggestions;
create policy "contributors file external suggestions"
  on public.external_content_suggestions for insert to authenticated
  with check (submitted_by = (select auth.uid()) and review_state = 'pending');

drop policy if exists "contributors read own external suggestions" on public.external_content_suggestions;
create policy "contributors read own external suggestions"
  on public.external_content_suggestions for select to authenticated
  using (submitted_by = (select auth.uid()));

revoke all on table public.external_sources from anon, authenticated;
revoke all on table public.external_content_items from anon, authenticated;
revoke all on table public.external_content_suggestions from anon, authenticated;
grant select on table public.external_sources to anon, authenticated;
grant select on table public.external_content_items to anon, authenticated;
grant select, insert on table public.external_content_suggestions to authenticated;

insert into public.external_sources
  (id, platform, name, handle, canonical_url, provider_key, trust_lane, ingest_method, auto_publish, active)
values
  ('pitching-ninja-x', 'x', 'Pitching Ninja', '@PitchingNinja', 'https://x.com/PitchingNinja', 'PitchingNinja', 'trusted-mind', 'api', true, true),
  ('pitching-ninja-tiktok', 'tiktok', 'Pitching Ninja', '@pitchingninja', 'https://www.tiktok.com/@pitchingninja', null, 'trusted-mind', 'official-feed', false, true),
  ('bsf-pitching-performance', 'tiktok', 'BSF Pitching Performance', '@bsf_pitchingperformance', 'https://www.tiktok.com/@bsf_pitchingperformance', null, 'heritage', 'editorial', false, true),
  ('ncaa-baseball-tiktok', 'tiktok', 'NCAA Baseball', '@ncaabsb', 'https://www.tiktok.com/@ncaabsb', null, 'trusted-mind', 'editorial', false, true),
  ('roger-clemens-x', 'x', 'Roger Clemens', '@rogerclemens', 'https://x.com/rogerclemens', 'rogerclemens', 'heritage', 'editorial', false, true)
on conflict (id) do nothing;

insert into public.external_content_items
  (id, source_id, platform, external_id, canonical_url, title, lede, source_caption,
   published_at, retrieved_at, pitch_slugs, craftsman_slugs, families, topics,
   trust_lane, moderation_state, availability, embed_mode, featured)
values
  ('10000000-0000-4000-8000-000000000001', 'bsf-pitching-performance', 'tiktok', '7544907808555240735',
   'https://www.tiktok.com/@bsf_pitchingperformance/video/7544907808555240735',
   'Nolan Ryan on his four-seam and two-seam',
   'Ryan in his own words on the two fastballs: the four-seam stays true while the two-seam runs arm-side.',
   'Nolan Ryan understood why the four-seam plays up and the two-seam runs.',
   '2026-06-25', '2026-06-25', array['four-seam','two-seam'], array['nolan-ryan'], array['fastball'], array['grip','teaching','heritage'],
   'heritage', 'published', 'available', 'official-embed', true),
  ('10000000-0000-4000-8000-000000000002', 'pitching-ninja-tiktok', 'tiktok', '6958820538441600262',
   'https://www.tiktok.com/@pitchingninja/video/6958820538441600262',
   'Tyler Rogers'' rising breaking ball',
   'Rogers describes the submarine breaker that tunnels with his sinker and reads as rising relative to it.',
   'Tyler Rogers, Rising Curveball.',
   '2026-06-25', '2026-06-25', array['slider'], array[]::text[], array['breaking'], array['teaching','pitch-shape'],
   'trusted-mind', 'published', 'available', 'official-embed', false),
  ('10000000-0000-4000-8000-000000000003', 'ncaa-baseball-tiktok', 'tiktok', '7245789529104239915',
   'https://www.tiktok.com/@ncaabsb/video/7245789529104239915',
   'College aces show their grips',
   'A credited NCAA grip tour with Chase Dollander, Paul Skenes, Jac Caglianone, and Rhett Lowder.',
   'Take a look at these aces'' pitch grips.',
   '2026-06-25', '2026-06-25', array['circle-change'], array['paul-skenes'], array['offspeed'], array['grip','teaching'],
   'trusted-mind', 'published', 'available', 'official-embed', true),
  ('10000000-0000-4000-8000-000000000004', 'pitching-ninja-x', 'x', '1061649568847269889',
   'https://x.com/PitchingNinja/status/1061649568847269889',
   'Rivera passes the cutter hand to hand',
   'Mariano Rivera walks Roy Halladay and Scott Kazmir through the cutter grip itself: knowledge preserved as a lesson.',
   null, '2018-11-11', '2026-06-09', array['cutter'], array['mariano-rivera'], array['fastball'], array['grip','heritage','teaching'],
   'heritage', 'published', 'available', 'official-embed', true),
  ('10000000-0000-4000-8000-000000000005', 'pitching-ninja-x', 'x', '1016866886863278080',
   'https://x.com/PitchingNinja/status/1016866886863278080',
   'Verlander shows the four-seam grip and release',
   'A credited teaching clip filed beside the four-seam specimen so the grip, release, and spin-axis conversation stay connected.',
   null, '2018-07-11', '2026-06-09', array['four-seam'], array['justin-verlander'], array['fastball'], array['grip','release','teaching'],
   'trusted-mind', 'published', 'available', 'official-embed', false),
  ('10000000-0000-4000-8000-000000000006', 'pitching-ninja-x', 'x', '972128267888222209',
   'https://x.com/PitchingNinja/status/972128267888222209',
   'Pedro Martínez on the cutter grip',
   'A master explaining the hold in his own terms, kept with its original post and filed where a cutter reader can use it.',
   null, '2018-03-09', '2026-06-09', array['cutter'], array['pedro-martinez'], array['fastball'], array['grip','heritage','teaching'],
   'heritage', 'published', 'available', 'official-embed', false)
on conflict (platform, external_id) do nothing;
