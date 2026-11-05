-- App Review 1.2: prepublication media review, direct contact, and enforceable
-- report deadlines. No existing content is deleted or existing account banned.
-- Moderation stays service-only. An unreviewed report can cause a reversible
-- quarantine, never a permanent violation finding.

create table private.community_restrictions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state text not null check (state in ('quarantined', 'ejected')),
  active boolean not null default true,
  reason text not null check (char_length(reason) between 10 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table private.community_content_quarantines (
  report_kind text not null check (report_kind in ('discussion','note')),
  report_id uuid not null,
  content_kind text not null check (content_kind in ('discussion','media','note')),
  content_id uuid not null,
  active boolean not null default true,
  primary key (report_kind,report_id)
);
create index community_content_quarantines_content_idx
  on private.community_content_quarantines(content_kind,content_id) where active;
create table private.community_moderation_events (
  id uuid primary key default gen_random_uuid(),
  report_kind text not null check (report_kind in ('discussion', 'note', 'media', 'contact')),
  report_id uuid not null,
  subject_id uuid,
  action text not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create index community_moderation_events_report_idx
  on private.community_moderation_events(report_kind, report_id, created_at);
create table private.safety_contacts (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete set null,
  message text not null check (char_length(message) between 10 and 4000),
  reply_email text check (reply_email is null or char_length(reply_email) <= 254),
  status text not null default 'open' check (status in ('open','reviewed','closed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index safety_contacts_sender_time_idx on private.safety_contacts(sender_id, created_at);
create index safety_contacts_open_time_idx on private.safety_contacts(created_at) where status='open';
create table private.community_moderation_runs (
  ran_at timestamptz not null default now(),
  quarantined integer not null,
  overdue_contacts integer not null
);
alter table private.community_content_quarantines enable row level security;
alter table private.community_restrictions enable row level security;
alter table private.community_moderation_events enable row level security;
alter table private.safety_contacts enable row level security;
alter table private.community_moderation_runs enable row level security;
revoke all on private.community_content_quarantines, private.community_restrictions, private.community_moderation_events,
  private.safety_contacts, private.community_moderation_runs from public, anon, authenticated;
grant usage on schema private to service_role;
grant select on private.community_content_quarantines, private.community_restrictions, private.community_moderation_events,
  private.safety_contacts, private.community_moderation_runs to service_role;

create function private.community_author_visible(p_user uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select not exists (select 1 from private.community_restrictions r
    where r.user_id=p_user and r.active);
$$;
revoke all on function private.community_author_visible(uuid) from public;
grant execute on function private.community_author_visible(uuid) to anon, authenticated, service_role;

create function private.community_content_visible(p_kind text,p_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select not exists (select 1 from private.community_content_quarantines q
    where q.content_kind=p_kind and q.content_id=p_id and q.active);
$$;
revoke all on function private.community_content_visible(text,uuid) from public;
grant execute on function private.community_content_visible(text,uuid) to anon,authenticated,service_role;
create policy community_content_visible on public.discussion_posts as restrictive
  for select to anon,authenticated using(private.community_content_visible('discussion',id));
create policy community_content_visible on public.field_notes as restrictive
  for select to anon,authenticated using(private.community_content_visible('note',id));
create policy community_content_visible on public.discussion_media as restrictive
  for select to anon,authenticated using(private.community_content_visible('media',id)
    and private.community_content_visible('discussion',post_id));

-- Restrictive policies also cover JWTs issued before the moderation action.
create policy community_author_visible on public.discussion_posts as restrictive
  for select to anon, authenticated using (private.community_author_visible(author_id));
create policy community_author_visible on public.field_notes as restrictive
  for select to anon, authenticated using (private.community_author_visible(author_id));
create policy community_author_visible on public.discussion_media as restrictive
  for select to anon, authenticated using (private.community_author_visible(owner_id));

do $$
declare t text;
begin
  foreach t in array array['discussion_posts','field_notes','discussion_media',
    'external_content_suggestions','profiles','discussion_media_terms','note_tries','note_helpful'] loop
    execute format('create policy community_active_writer on public.%I as restrictive for all to authenticated using (private.community_author_visible((select auth.uid()))) with check (private.community_author_visible((select auth.uid())))',t);
  end loop;
end $$;
create policy community_active_uploader on storage.objects as restrictive
  for insert to authenticated with check (
    bucket_id <> 'discussion-media' or private.community_author_visible((select auth.uid()))
  );

-- The public Field Notes RPC is SECURITY DEFINER and therefore needs the same
-- author visibility predicate explicitly, rather than depending on table RLS.
create or replace function public.list_public_field_notes(p_pitch_slug text)
returns table (id uuid,pitch_slug text,author_id uuid,display_name text,tweak text,
  player_level text,arm_slot text,velocity_band text,intent text,claimed_result_kind text,
  claimed_result_note text,sample_size integer,evidence_url text,evidence_label text,
  source_tier text,note text,adoption_count integer,helpful_count integer,
  base_rank numeric,created_at timestamptz)
language sql stable security definer set search_path='' as $$
  select f.id,f.pitch_slug,f.author_id,f.display_name,f.tweak,f.player_level,
    f.arm_slot,f.velocity_band,f.intent,f.claimed_result_kind,f.claimed_result_note,
    f.sample_size,f.evidence_url,f.evidence_label,f.source_tier,f.note,
    f.adoption_count,f.helpful_count,f.base_rank,f.created_at
  from public.field_notes f
  where f.pitch_slug=p_pitch_slug and f.visibility='approved' and not f.is_hidden
    and private.community_content_visible('note',f.id)
    and private.community_author_visible(f.author_id)
    and not private.blocked_between((select auth.uid()),f.author_id)
  order by f.base_rank desc,f.created_at desc;
$$;

-- New media never becomes public before an explicit moderator decision. There
-- are currently no production media rows; the default also safely holds any
-- rows in another environment without deleting the object or its record.
alter table public.discussion_media add column moderation_state text not null default 'pending'
  check (moderation_state in ('pending','approved','rejected'));
-- Existing clients have column-scoped INSERT grants only. Explicitly keep the
-- server-owned decision column unwritable if grants change in a later migration.
revoke insert,update on public.discussion_media from anon,authenticated;
revoke insert(moderation_state),update(moderation_state) on public.discussion_media from anon,authenticated;
grant insert(post_id,topic_key,storage_path,mime_type,kind,byte_size,width,height,duration_s)
  on public.discussion_media to authenticated;
create policy community_media_approved on public.discussion_media as restrictive
  for select to anon, authenticated using (moderation_state='approved');

create function private.community_media_object_visible(p_path text)
returns boolean language sql stable security definer set search_path='' as $$
  select exists (
    select 1 from public.discussion_media m
    join public.discussion_posts p on p.id=m.post_id
    where m.storage_path=p_path and m.moderation_state='approved'
      and not m.is_hidden and not p.is_hidden
      and private.community_content_visible('media',m.id)
      and private.community_content_visible('discussion',p.id)
      and private.community_author_visible(m.owner_id)
      and private.community_author_visible(p.author_id)
      and not private.blocked_between((select auth.uid()),m.owner_id)
      and not private.blocked_between((select auth.uid()),p.author_id)
  );
$$;
revoke all on function private.community_media_object_visible(text) from public;
grant execute on function private.community_media_object_visible(text) to anon,authenticated,service_role;
drop policy discussion_media_object_read on storage.objects;
create policy discussion_media_object_read on storage.objects for select to anon,authenticated
  using (bucket_id='discussion-media' and private.community_media_object_visible(name));

create function public.submit_safety_contact(p_message text,p_reply_email text default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare
  sender uuid := (select auth.uid());
  message_text text := pg_catalog.btrim(p_message);
  reply_address text := nullif(pg_catalog.btrim(p_reply_email),'');
  receipt uuid;
begin
  if sender is null then raise exception 'sign_in_required: a contribution session is required' using errcode='42501'; end if;
  if message_text is null or char_length(message_text) not between 10 and 4000 then
    raise exception 'contact_invalid: enter a message between 10 and 4000 characters' using errcode='22023';
  end if;
  if reply_address is not null and (char_length(reply_address)>254 or reply_address !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$') then
    raise exception 'contact_invalid: enter a valid reply email address' using errcode='22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(sender::text,20261105));
  select c.id into receipt from private.safety_contacts c where c.sender_id=sender
    and c.message=message_text and c.reply_email is not distinct from reply_address
    and c.created_at>now()-interval '10 minutes' order by c.created_at desc limit 1;
  if receipt is not null then return receipt; end if;
  if (select count(*) from private.safety_contacts where sender_id=sender and created_at>now()-interval '1 hour')>=5 then
    raise exception 'rate_limit: please wait before sending another message' using errcode='54000';
  end if;
  insert into private.safety_contacts(sender_id,message,reply_email)
    values(sender,message_text,reply_address) returning id into receipt;
  return receipt;
end $$;
revoke all on function public.submit_safety_contact(text,text) from public,anon;
grant execute on function public.submit_safety_contact(text,text) to authenticated;

-- Every report enters the queue on its first submission. No global-hide
-- threshold is used to decide whether a human or the deadline job sees it.
create view private.community_report_queue as
  select 'discussion'::text as report_kind,r.id as report_id,
    coalesce(r.post_id,r.media_id) as content_id,coalesce(p.author_id,m.owner_id) as subject_id,
    case when r.post_id is not null then 'discussion' else 'media' end as content_kind,
    r.reason,r.created_at,r.created_at+interval '24 hours' as deadline,r.status
  from public.discussion_reports r
  left join public.discussion_posts p on p.id=r.post_id
  left join public.discussion_media m on m.id=r.media_id
  where r.status='open'
  union all
  select 'note',r.id,r.note_id,f.author_id,'note',r.reason,r.created_at,
    r.created_at+interval '24 hours',r.status
  from public.note_reports r join public.field_notes f on f.id=r.note_id where r.status='open';
revoke all on private.community_report_queue from public,anon,authenticated;
grant select on private.community_report_queue to service_role;

create function private.quarantine_community_report(p_kind text,p_report uuid,p_subject uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
  insert into private.community_content_quarantines(report_kind,report_id,content_kind,content_id)
    select report_kind,report_id,content_kind,content_id from private.community_report_queue
    where report_kind=p_kind and report_id=p_report
    on conflict(report_kind,report_id) do update set active=true;
  if p_subject is not null then
  insert into private.community_restrictions(user_id,state,reason)
    values(p_subject,'quarantined','A content report reached the review deadline and needs a moderator decision.')
    on conflict(user_id) do update set active=true,updated_at=now(),
      state=case when community_restrictions.state='ejected' then 'ejected' else 'quarantined' end;
  end if;
  insert into private.community_moderation_events(report_kind,report_id,subject_id,action,reason)
    values(p_kind,p_report,p_subject,'deadline_quarantine',
      'Reversible community quarantine before the 24-hour deadline; no violation finding.');
end $$;
revoke all on function private.quarantine_community_report(text,uuid,uuid) from public,anon,authenticated;

create function public.enforce_community_report_deadlines()
returns integer language plpgsql security definer set search_path='' as $$
declare r record; n integer:=0; overdue integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(20261105032000);
  for r in select q.* from private.community_report_queue q
    where q.created_at <= now()-interval '22 hours'
      and not exists (select 1 from private.community_moderation_events e
        where e.report_kind=q.report_kind and e.report_id=q.report_id and e.action='deadline_quarantine')
    order by q.created_at loop
    -- Serialize with moderator decisions and re-check status after acquiring the
    -- row lock, so a report dismissed during this run cannot re-quarantine anyone.
    if r.report_kind='discussion' then
      perform 1 from public.discussion_reports where id=r.report_id and status='open' for update;
    else
      perform 1 from public.note_reports where id=r.report_id and status='open' for update;
    end if;
    if not found then continue; end if;
    perform private.quarantine_community_report(r.report_kind,r.report_id,r.subject_id);
    n:=n+1;
  end loop;
  select count(*) into overdue from private.safety_contacts where status='open' and created_at<=now()-interval '22 hours';
  insert into private.community_moderation_runs(quarantined,overdue_contacts) values(n,overdue);
  -- Dashboard/SQL subscribers may use this wake-up signal. It is not an email
  -- delivery claim; the durable inbox and run record are the source of truth.
  if n>0 or overdue>0 then perform pg_catalog.pg_notify('community_moderation',json_build_object('quarantined',n,'overdue_contacts',overdue)::text); end if;
  return n;
end $$;
revoke all on function public.enforce_community_report_deadlines() from public,anon,authenticated;
grant execute on function public.enforce_community_report_deadlines() to service_role;

-- Service-only moderation: confirmed violations eject the contributor from all
-- community reads/writes (including already-issued JWTs), without deleting user
-- data. Dismissing the last open report lifts a deadline-only quarantine. It
-- never reverses an ejection or silently republishes separately-hidden content.
create function public.moderate_community_report(p_kind text,p_report_id uuid,p_decision text,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare subject uuid; target uuid; media_target uuid; note_target uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(20261105032000);
  if p_kind not in ('discussion','note') or p_decision not in ('actioned','dismissed')
    or p_reason is null or char_length(btrim(p_reason)) not between 10 and 1000 then
    raise exception 'invalid_moderation_decision' using errcode='22023';
  end if;
  if p_kind='discussion' then
    select coalesce(p.author_id,m.owner_id),r.post_id,r.media_id into subject,target,media_target
      from public.discussion_reports r left join public.discussion_posts p on p.id=r.post_id
      left join public.discussion_media m on m.id=r.media_id where r.id=p_report_id for update of r;
  else
    select f.author_id,r.note_id into subject,note_target from public.note_reports r
      join public.field_notes f on f.id=r.note_id where r.id=p_report_id for update of r;
  end if;
  if not found then raise exception 'report_not_found' using errcode='22023'; end if;
  if p_kind='discussion' then update public.discussion_reports set status=p_decision where id=p_report_id;
  else update public.note_reports set status=p_decision where id=p_report_id; end if;
  update private.community_content_quarantines set active=false where report_kind=p_kind and report_id=p_report_id;
  if p_decision='actioned' then
    if subject is not null then
    insert into private.community_restrictions(user_id,state,reason)
      values(subject,'ejected',btrim(p_reason)) on conflict(user_id) do update
      set state='ejected',active=true,reason=excluded.reason,updated_at=now();
    end if;
    if target is not null then update public.discussion_posts set is_hidden=true where id=target; end if;
    if media_target is not null then update public.discussion_media set is_hidden=true,moderation_state='rejected' where id=media_target; end if;
    if note_target is not null then update public.field_notes set is_hidden=true where id=note_target; end if;
  elsif not exists(select 1 from private.community_report_queue where subject_id=subject) then
    update private.community_restrictions set active=false,updated_at=now()
      where user_id=subject and state='quarantined';
  end if;
  insert into private.community_moderation_events(report_kind,report_id,subject_id,action,reason)
    values(p_kind,p_report_id,subject,p_decision,btrim(p_reason));
end $$;
revoke all on function public.moderate_community_report(text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.moderate_community_report(text,uuid,text,text) to service_role;

create function public.review_community_media(p_media_id uuid,p_approve boolean,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare owner uuid;
begin
  if p_approve is null or p_reason is null or char_length(btrim(p_reason)) not between 10 and 1000 then
    raise exception 'invalid_moderation_decision' using errcode='22023';
  end if;
  select owner_id into owner from public.discussion_media where id=p_media_id for update;
  if owner is null then raise exception 'media_not_found' using errcode='22023'; end if;
  if p_approve and not private.community_author_visible(owner) then
    raise exception 'contributor_restricted' using errcode='42501';
  end if;
  update public.discussion_media set moderation_state=case when p_approve then 'approved' else 'rejected' end,
    is_hidden=case when p_approve then is_hidden else true end where id=p_media_id;
  insert into private.community_moderation_events(report_kind,report_id,subject_id,action,reason)
    values('media',p_media_id,owner,case when p_approve then 'approved' else 'rejected' end,btrim(p_reason));
end $$;
revoke all on function public.review_community_media(uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.review_community_media(uuid,boolean,text) to service_role;

-- Acknowledge contact only after an operator actually reads it. This records
-- an inbox decision; it never claims an email was sent.
create function public.review_safety_contact(p_contact_id uuid,p_status text,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare sender uuid;
begin
  if p_status not in ('reviewed','closed') or p_reason is null
    or char_length(btrim(p_reason)) not between 10 and 1000 then
    raise exception 'invalid_moderation_decision' using errcode='22023';
  end if;
  select sender_id into sender from private.safety_contacts where id=p_contact_id for update;
  if not found then raise exception 'contact_not_found' using errcode='22023'; end if;
  update private.safety_contacts set status=p_status,reviewed_at=now() where id=p_contact_id;
  insert into private.community_moderation_events(report_kind,report_id,subject_id,action,reason)
    values('contact',p_contact_id,sender,p_status,btrim(p_reason));
end $$;
revoke all on function public.review_safety_contact(uuid,text,text) from public,anon,authenticated;
grant execute on function public.review_safety_contact(uuid,text,text) to service_role;

-- Run every ten minutes. Starting at 22h leaves margin for the existing one-hour
-- signed URL lifetime and scheduling delay, while ordinary access closes at once.
do $$
begin
  if exists(select 1 from pg_extension where extname='pg_cron') then
    perform cron.schedule('pitch-atlas-community-review-deadlines','*/10 * * * *',
      'select public.enforce_community_report_deadlines();');
  else
    raise exception 'pg_cron unavailable: install the scheduler before deploying community moderation';
  end if;
end $$;

comment on table private.safety_contacts is 'Private developer contact inbox. Messages accepted from anonymous or claimed sessions; no client read access.';
comment on table private.community_restrictions is 'Reversible deadline quarantine or moderator-confirmed community ejection. Checked on each request, including existing JWTs.';
comment on view private.community_report_queue is 'All open content reports, including the first report; 24-hour deadline.';
