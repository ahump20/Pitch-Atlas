-- Close the reservation-expiry handoff race between media finalization and GC.
-- The matching reservation row stays locked until the insert transaction ends,
-- so GC cannot expire it and classify the object while finalization is uncommitted.

create or replace function private.enforce_discussion_media_storage_finalization()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  object_created_at timestamptz;
  has_active_reservation boolean := false;
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

  -- This lock is the transaction handoff to orphan GC. If GC tries to prune an
  -- expired reservation after this statement qualifies it, that DELETE waits for
  -- the media insert and its AFTER-trigger reservation consume to commit.
  select true
  into has_active_reservation
  from private.discussion_media_upload_reservations r
  where r.storage_path = new.storage_path
    and r.owner_id = new.owner_id
    and r.expires_at > pg_catalog.now()
    and r.reserved_at <= object_created_at
  for update;

  has_active_reservation := coalesce(has_active_reservation, false);

  if not has_active_reservation
     and object_created_at <= (pg_catalog.statement_timestamp() - interval '23 hours') then
    raise exception 'media_blocked: that upload expired before it was attached';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_discussion_media_storage_finalization()
  from public, anon, authenticated;

comment on function private.enforce_discussion_media_storage_finalization() is
  'Validates discussion-media object finalization and locks a matching active upload reservation through insert commit so orphan GC cannot race it.';
