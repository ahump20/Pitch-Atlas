-- Keep the GC heartbeat writer service-role-only after its explicit grant. The
-- reservation RPCs and hash-gated authorization RPC remain intentionally callable
-- by their named client roles and are covered by the migration contract allowlist.

revoke execute on function public.record_discussion_media_gc_run(
  text,
  integer,
  integer,
  text
) from public, anon, authenticated;
