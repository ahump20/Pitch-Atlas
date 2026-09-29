-- Enable after the validation Edge function and updated web upload client are
-- deployed. Older clients must validate the uploaded object before INSERT.
create or replace function private.enforce_discussion_media_storage_finalization()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  object_created_at timestamptz;
  current_object_id uuid;
  has_active_reservation boolean := false;
begin
  if pg_catalog.split_part(new.storage_path, '/', 1) <> new.owner_id::text then
    raise exception 'media_blocked: upload path must stay inside your account folder';
  end if;
  select o.created_at, o.id into object_created_at, current_object_id
  from storage.objects o where o.bucket_id = 'discussion-media' and o.name = new.storage_path
  for share;
  if object_created_at is null then
    raise exception 'media_blocked: the uploaded media object does not exist';
  end if;
  if not exists (
    select 1 from private.discussion_media_validations v
    where v.object_id = current_object_id and v.owner_id = new.owner_id
      and v.storage_path = new.storage_path and v.byte_size = new.byte_size
      and v.mime_type = new.mime_type and v.kind = new.kind
  ) then
    raise exception 'media_blocked: validate the uploaded file before attaching it; update Pitch Atlas and retry';
  end if;
  select true into has_active_reservation
  from private.discussion_media_upload_reservations r
  where r.storage_path = new.storage_path and r.owner_id = new.owner_id
    and r.expires_at > pg_catalog.now() and r.reserved_at <= object_created_at
  for update;
  has_active_reservation := coalesce(has_active_reservation, false);
  if not has_active_reservation
     and object_created_at <= pg_catalog.statement_timestamp() - interval '23 hours' then
    raise exception 'media_blocked: that upload expired before it was attached';
  end if;
  return new;
end;
$$;
revoke all on function private.enforce_discussion_media_storage_finalization()
  from public, anon, authenticated;
