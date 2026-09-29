-- Disposable PostgreSQL fixture for the community security boundary. Supabase
-- auth/storage schemas are emulated; the actual repository migrations/functions
-- are applied by security-postgres-regression.mjs.
drop schema if exists storage cascade;
drop schema if exists private cascade;
drop schema if exists auth cascade;
drop schema public cascade;
create schema public;
create schema auth;
create schema storage;
create schema private;
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role bypassrls; end if;
end $$;
grant usage on schema public, auth, storage to anon, authenticated, service_role;
grant usage on schema private to service_role;
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;
create function auth.uid() returns uuid language sql stable as $$ select (auth.jwt()->>'sub')::uuid $$;
create function auth.role() returns text language sql stable as $$ select auth.jwt()->>'role' $$;
create table auth.users (id uuid primary key, is_anonymous boolean not null default false);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade, is_admin boolean not null default false
);
create table public.blocked_users (
  blocker_id uuid references auth.users(id) on delete cascade,
  blocked_id uuid references auth.users(id) on delete cascade,
  primary key (blocker_id, blocked_id)
);
create table storage.buckets (
  id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id),
  name text not null, created_at timestamptz not null default now(), metadata jsonb default '{}',
  owner uuid, owner_id text, version text, updated_at timestamptz default now(),
  last_accessed_at timestamptz default now(),
  unique(bucket_id, name)
);
alter table storage.objects enable row level security;
create function storage.foldername(text) returns text[] language sql immutable as $$
  select (string_to_array($1, '/'))[1:array_length(string_to_array($1, '/'), 1)-1]
$$;
create function public.text_has_banned_term(text) returns boolean language sql immutable as $$ select false $$;
create table public.field_notes (
  id uuid primary key default gen_random_uuid(), author_id uuid references public.profiles(id),
  is_hidden boolean not null default false, updated_at timestamptz default now()
);
create table public.note_reports (
  id uuid primary key default gen_random_uuid(), note_id uuid references public.field_notes(id),
  reporter_id uuid references public.profiles(id), status text not null default 'open',
  unique(note_id, reporter_id)
);
create table private.rollup_calls (author_id uuid);
create function public.refresh_author_rollup(uuid) returns void language sql as $$
  insert into private.rollup_calls values ($1)
$$;
