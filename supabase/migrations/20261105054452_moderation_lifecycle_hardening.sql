-- Close moderation lifecycle bypasses. Finalized paths are never reusable by
-- clients, even after a post/account is deleted and a signed URL remains valid.
create table private.community_media_path_locks (
  path_digest text primary key,
  created_at timestamptz not null default now()
);
alter table private.community_media_path_locks enable row level security;
revoke all on private.community_media_path_locks from public,anon,authenticated;
grant select on private.community_media_path_locks to service_role;
-- Block metadata inserts until both the backfill and capture trigger exist.
lock table public.discussion_media in share row exclusive mode;
-- The digest avoids retaining an account UUID in the path ledger. Collisions
-- only deny an additional path; they cannot grant access to a locked path.
insert into private.community_media_path_locks(path_digest)
 select distinct pg_catalog.md5(storage_path) from public.discussion_media
 on conflict do nothing;

create function private.community_media_path_mutable(p_path text)
returns boolean language sql volatile security definer set search_path = '' as $$
 select not exists(select 1 from private.community_media_path_locks
   where path_digest=pg_catalog.md5(p_path));
$$;
revoke execute on function private.community_media_path_mutable(text) from public;
grant execute on function private.community_media_path_mutable(text) to authenticated;

create or replace function private.lock_finalized_community_media_path()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(20261105,pg_catalog.hashtext(new.storage_path));
 insert into private.community_media_path_locks(path_digest)
   values(pg_catalog.md5(new.storage_path)) on conflict do nothing;
 return new;
end $$;
revoke execute on function private.lock_finalized_community_media_path() from public,anon,authenticated;
create trigger community_media_path_lock after insert on public.discussion_media
 for each row execute function private.lock_finalized_community_media_path();

-- Storage's signed-upload endpoint writes as its service role. Keep immutable
-- paths enforced below RLS as well. Storage uses a fresh physical object version
-- per upload and commits that version through this row; rejecting the metadata
-- change leaves the approved version current. Trusted cleanup can still DELETE.
create function private.enforce_finalized_community_media_path()
returns trigger language plpgsql volatile security definer set search_path = '' as $$
declare paths text[]:=array[]::text[]; locked_path text; lock_key integer;
begin
 if tg_op='UPDATE' then
   -- path_tokens is generated from name after BEFORE triggers; comparing its
   -- not-yet-generated NEW value would reject harmless access-time updates.
   if (to_jsonb(new)-'updated_at'-'last_accessed_at'-'path_tokens') is not distinct from
      (to_jsonb(old)-'updated_at'-'last_accessed_at'-'path_tokens') then
     return new;
   end if;
   if old.bucket_id='discussion-media' then paths:=array_append(paths,old.name); end if;
 end if;
 if new.bucket_id='discussion-media' then paths:=array_append(paths,new.name); end if;
 -- Metadata finalization takes the same key and never locks storage rows.
 -- Sort actual integer keys, including hash collisions, to keep one lock order.
 for lock_key in select distinct pg_catalog.hashtext(p) from unnest(paths) p order by 1 loop
   perform pg_catalog.pg_advisory_xact_lock(20261105,lock_key);
 end loop;
 for locked_path in select distinct p from unnest(paths) p loop
   if not private.community_media_path_mutable(locked_path) then
     raise exception 'finalized_media_is_immutable' using errcode='42501';
   end if;
 end loop;
 return new;
end $$;
revoke execute on function private.enforce_finalized_community_media_path() from public,anon,authenticated;
create trigger community_finalized_media_path_guard before insert or update on storage.objects
 for each row execute function private.enforce_finalized_community_media_path();

create policy community_finalized_path_insert on storage.objects as restrictive
 for insert to authenticated with check(bucket_id<>'discussion-media'
   or private.community_media_path_mutable(name));
-- Upload clients always create fresh UUID paths with upsert=false. They never
-- need object UPDATE/DELETE. Web failures release reservations; iOS cleanup
-- attempts may be denied, leaving private orphan bytes for the existing service GC.
-- Deny mutations even before finalization, eliminating overlapping overwrite or
-- delete/reinsert requests without relying on a particular Storage API version.
create policy community_finalized_path_update on storage.objects as restrictive
 for update to authenticated using(bucket_id<>'discussion-media')
 with check(bucket_id<>'discussion-media');
create policy community_finalized_path_delete on storage.objects as restrictive
 for delete to authenticated using(bucket_id<>'discussion-media');

create policy community_active_reporter on public.discussion_reports as restrictive
 for insert to authenticated with check(private.community_author_visible((select auth.uid())));
create policy community_active_reporter on public.note_reports as restrictive
 for insert to authenticated with check(private.community_author_visible((select auth.uid())));

-- Take the same lock as the deadline/decision RPCs before DELETE takes report
-- row locks, then reconcile only temporary restrictions after each deletion.
create function private.serialize_community_report_deletion()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(20261105032000);
 return null;
end $$;
revoke execute on function private.serialize_community_report_deletion() from public,anon,authenticated;
create function private.reconcile_deleted_community_report()
returns trigger language plpgsql security definer set search_path = '' as $$
declare kind text:=case when tg_table_name='discussion_reports' then 'discussion' else 'note' end;
begin
 update private.community_content_quarantines set active=false
   where report_kind=kind and report_id=old.id;
 update private.community_restrictions r set active=false,updated_at=now()
 where r.state='quarantined' and r.active
   and r.user_id in (select e.subject_id from private.community_moderation_events e
     where e.report_kind=kind and e.report_id=old.id)
   and not exists(select 1 from private.community_report_queue q where q.subject_id=r.user_id);
 return old;
end $$;
revoke execute on function private.reconcile_deleted_community_report() from public,anon,authenticated;
create trigger community_report_delete_lock before delete on public.discussion_reports
 for each statement execute function private.serialize_community_report_deletion();
create trigger community_report_delete_lock before delete on public.note_reports
 for each statement execute function private.serialize_community_report_deletion();
create trigger community_report_delete_reconcile after delete on public.discussion_reports
 for each row execute function private.reconcile_deleted_community_report();
create trigger community_report_delete_reconcile after delete on public.note_reports
 for each row execute function private.reconcile_deleted_community_report();

-- Cascade deletion must acquire the lock before holding any parent row lock.
-- This covers ordinary deletion and auth/profile-driven cascades as well as the
-- delete-account function, which removes reports explicitly before the account.
create trigger community_parent_delete_lock before delete on public.discussion_posts
 for each statement execute function private.serialize_community_report_deletion();
create trigger community_parent_delete_lock before delete on public.discussion_media
 for each statement execute function private.serialize_community_report_deletion();
create trigger community_parent_delete_lock before delete on public.field_notes
 for each statement execute function private.serialize_community_report_deletion();
create trigger community_parent_delete_lock before delete on public.profiles
 for each statement execute function private.serialize_community_report_deletion();
create trigger community_parent_delete_lock before delete on auth.users
 for each statement execute function private.serialize_community_report_deletion();

-- Reconcile any temporary quarantine left by a deletion before this deployment.
update private.community_content_quarantines q set active=false where q.active
 and ((q.report_kind='discussion' and not exists(select 1 from public.discussion_reports r where r.id=q.report_id))
   or (q.report_kind='note' and not exists(select 1 from public.note_reports r where r.id=q.report_id)));
update private.community_restrictions r set active=false,updated_at=now()
 where r.active and r.state='quarantined'
 and not exists(select 1 from private.community_report_queue q where q.subject_id=r.user_id);

-- Contact audit events need the contact receipt, not another retained sender link.
create or replace function public.review_safety_contact(p_contact_id uuid,p_status text,p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if p_status not in ('reviewed','closed') or p_reason is null
   or char_length(btrim(p_reason)) not between 10 and 1000 then
   raise exception 'invalid_moderation_decision' using errcode='22023';
 end if;
 perform 1 from private.safety_contacts where id=p_contact_id for update;
 if not found then raise exception 'contact_not_found' using errcode='22023'; end if;
 update private.safety_contacts set status=p_status,reviewed_at=now() where id=p_contact_id;
 insert into private.community_moderation_events(report_kind,report_id,subject_id,action,reason)
   values('contact',p_contact_id,null,p_status,btrim(p_reason));
end $$;
grant execute on function public.review_safety_contact(uuid,text,text) to service_role;
revoke execute on function public.review_safety_contact(uuid,text,text) from public,anon,authenticated;
update private.community_moderation_events set subject_id=null where report_kind='contact';
