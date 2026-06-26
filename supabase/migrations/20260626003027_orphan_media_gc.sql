-- Orphan-object GC backstop. uploadMedia already removes its own storage object
-- if the row insert fails, so an orphan only appears if a client dies mid-flow.
-- This hourly sweep is the documented backstop: it removes discussion-media storage
-- objects older than an hour that no discussion_media row points at. It runs
-- entirely in-DB (a plain SELECT cron command, no HTTP, no secret). The storage
-- read policy already makes such objects unreadable; this reclaims their metadata.

create or replace function private.gc_orphan_discussion_media()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  with doomed as (
    delete from storage.objects o
    where o.bucket_id = 'discussion-media'
      and o.created_at < (now() - interval '1 hour')
      and not exists (
        select 1 from public.discussion_media m
        where m.storage_path = o.name
      )
    returning 1
  )
  select count(*) into removed from doomed;
  return removed;
end;
$$;

-- Keep it private: client roles have no USAGE on schema private, so this is not
-- reachable from PostgREST and never trips the authenticated-definer advisor.
revoke all on function private.gc_orphan_discussion_media() from public;

-- Schedule hourly. Replace any prior definition so the migration is idempotent.
do $$
begin
  perform cron.unschedule('gc-orphan-discussion-media');
exception when others then
  null;
end $$;

select cron.schedule(
  'gc-orphan-discussion-media',
  '0 * * * *',
  $$select private.gc_orphan_discussion_media();$$
);
