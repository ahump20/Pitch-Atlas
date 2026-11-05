-- Local-only platform scaffolding. Never run this file against a hosted project.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create schema storage;
create schema private;
grant usage on schema public,auth,storage,private to anon,authenticated,service_role;
create function auth.uid() returns uuid language sql stable as $$ select (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
create table auth.users (id uuid primary key, is_anonymous boolean not null default true, email text);
create table storage.buckets (id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(),bucket_id text,name text,created_at timestamptz default now(),unique(bucket_id,name));
alter table storage.objects enable row level security;
grant select,insert,delete on storage.objects to anon,authenticated;
create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;
alter default privileges in schema public grant select,insert,update,delete on tables to anon,authenticated,service_role;
