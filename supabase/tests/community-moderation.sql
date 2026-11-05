-- Run against a local migration database. The same transaction may be run by
-- trusted SQL tooling for hosted acceptance; every test row is rolled back.
begin;
select set_config('test.author',gen_random_uuid()::text,true),
  set_config('test.reporter',gen_random_uuid()::text,true),
  set_config('test.post',gen_random_uuid()::text,true),
  set_config('test.note',gen_random_uuid()::text,true),
  set_config('test.media',gen_random_uuid()::text,true),
  set_config('test.report',gen_random_uuid()::text,true),
  set_config('test.media_report',gen_random_uuid()::text,true),
  set_config('test.note_report',gen_random_uuid()::text,true);
-- Serialize fixture acceptance and reject hosted data that could be affected by
-- the global deadline executor. The complete transaction is always rolled back.
lock table public.discussion_reports,public.note_reports in share row exclusive mode;
do $$ begin
 assert not exists(select 1 from private.community_report_queue where created_at<=now()-interval '22 hours'),
   'Run in an isolated database: existing reports are due for deadline enforcement';
end $$;
insert into auth.users(id,is_anonymous) select author,true from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids
  union all select reporter,true from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids;
insert into public.pitches(slug,name) values('codex-moderation-test','Transactional moderation test');
insert into public.banned_terms(term) values('codexblocktest');
insert into public.discussion_posts(id,topic_key,author_id,display_name,body)
  select post,'test:moderation',author,'Test contributor','Transactional test of community moderation.' from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids;
insert into public.field_notes(id,pitch_slug,author_id,display_name,tweak,player_level,arm_slot,intent,claimed_result_kind,visibility)
  select note,'codex-moderation-test',author,'Test contributor','Test grip cue','college-plus','three-quarter','better-command','no-noticeable-change','approved' from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids;
insert into public.discussion_media_terms(user_id) select author from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids;
insert into storage.objects(bucket_id,name) select 'discussion-media',author::text||'/moderation-test.jpg' from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids;
insert into public.discussion_media(id,post_id,owner_id,topic_key,storage_path,mime_type,kind,byte_size)
  select media,post,author,'test:moderation',author::text||'/moderation-test.jpg','image/jpeg','image',128 from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids;

do $$ begin
  assert not has_function_privilege('anon','public.submit_safety_contact(text,text)','execute'), 'anon role can submit contact without session';
  assert has_function_privilege('authenticated','public.submit_safety_contact(text,text)','execute'), 'anonymous account cannot contact developer';
  assert not has_function_privilege('authenticated','public.moderate_community_report(text,uuid,text,text)','execute'), 'client can moderate';
  assert not has_column_privilege('authenticated','public.discussion_media','moderation_state','INSERT'),'client can insert approved media';
  assert not has_column_privilege('authenticated','public.discussion_media','moderation_state','UPDATE'),'client can update approved media';
  assert not has_function_privilege('authenticated','public.review_community_media(uuid,boolean,text)','execute'), 'client can approve own media';
  assert not has_function_privilege('authenticated','public.enforce_community_report_deadlines()','execute'), 'client can run deadline job';
  assert not has_table_privilege('authenticated','private.safety_contacts','select'), 'client can read contact messages';
  assert not has_table_privilege('anon','private.community_report_queue','select'), 'public can read reports';
  assert public.text_has_banned_term('CODEXBLOCKTEST'), 'deployed text filter did not match';
end $$;

select set_config('request.jwt.claims',json_build_object('sub',reporter,'role','authenticated','is_anonymous',true)::text,true) from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids;
set local role authenticated;
do $$ declare a uuid; b uuid; begin
  a:=public.submit_safety_contact('A controlled contact test for review.','reviewer@example.com');
  b:=public.submit_safety_contact('A controlled contact test for review.','reviewer@example.com');
  assert a=b,'retry created another contact';
  begin
    perform public.submit_safety_contact('short',null);
    raise exception 'short message accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.submit_safety_contact('A valid length message.','not-an-email');
    raise exception 'invalid email accepted';
  exception when invalid_parameter_value then null; end;
  for i in 1..4 loop perform public.submit_safety_contact('Another controlled test message number '||i,null); end loop;
  begin
    perform public.submit_safety_contact('A sixth distinct message over the hourly cap.',null);
    raise exception 'contact rate limit missing';
  exception when program_limit_exceeded then null; end;
  begin
    insert into public.discussion_media(post_id,storage_path,kind,moderation_state)
      values(current_setting('test.post')::uuid,'client-approved.jpg','image','approved');
    raise exception 'client inserted approved media';
  exception when insufficient_privilege then null; end;
  begin
    update public.discussion_media set moderation_state='approved' where id=current_setting('test.media')::uuid;
    raise exception 'client updated approved media';
  exception when insufficient_privilege then null; end;
  assert (select count(*) from public.discussion_media where id=current_setting('test.media')::uuid)=0,'pending media is public';
  assert (select count(*) from storage.objects where bucket_id='discussion-media' and name=current_setting('test.author')||'/moderation-test.jpg')=0,'pending bytes are readable';
end $$;
reset role;

select public.review_community_media(media,true,'Reviewed the controlled image fixture.') from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids;
set local role authenticated;
do $$ begin
  assert (select count(*) from public.discussion_media where id=current_setting('test.media')::uuid)=1,'approved media not visible';
  assert (select count(*) from storage.objects where bucket_id='discussion-media' and name=current_setting('test.author')||'/moderation-test.jpg')=1,'approved media cannot be signed';
  begin
    insert into public.discussion_posts(topic_key,display_name,body) values('test:moderation','Test reporter','codexblocktest');
    raise exception 'objectionable post accepted';
  exception when raise_exception then
    if sqlerrm not like 'content_blocked:%' then raise; end if;
  end;
end $$;
reset role;
insert into public.discussion_reports(id,post_id,reporter_id,reason,created_at)
  select report,post,reporter,'Controlled report of an item for testing.',now()-interval '22 hours 1 minute' from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids;
insert into public.discussion_reports(id,media_id,reporter_id,reason,created_at)
 values(current_setting('test.media_report')::uuid,current_setting('test.media')::uuid,current_setting('test.reporter')::uuid,'Controlled image report.',now()-interval '22 hours 1 minute');
insert into public.note_reports(id,note_id,reporter_id,reason,created_at)
 values(current_setting('test.note_report')::uuid,current_setting('test.note')::uuid,current_setting('test.reporter')::uuid,'Controlled field note report.',now()-interval '22 hours 1 minute');
do $$ begin
  assert (select count(*) from private.community_report_queue where report_id=current_setting('test.report')::uuid)=1,'first report missing from moderation queue';
  assert public.enforce_community_report_deadlines()=3,'deadline did not quarantine all three content kinds';
  assert public.enforce_community_report_deadlines()=0,'deadline action not idempotent';
  assert (select state='quarantined' and active from private.community_restrictions where user_id=(select author from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids)),'deadline became permanent ejection';
end $$;

set local role authenticated;
do $$ begin
  assert (select count(*) from public.discussion_posts where id=current_setting('test.post')::uuid)=0,'quarantined posts visible';
  assert (select count(*) from public.discussion_media where id=current_setting('test.media')::uuid)=0,'quarantined media visible';
  assert (select count(*) from storage.objects where bucket_id='discussion-media' and name=current_setting('test.author')||'/moderation-test.jpg')=0,'quarantined media can be signed';
  assert (select count(*) from public.list_public_field_notes('codex-moderation-test'))=0,'security-definer field-note RPC bypasses quarantine';
end $$;
reset role;

-- Reuse the author's pre-existing identity claims; no new token/refresh needed.
select set_config('request.jwt.claims',json_build_object('sub',author,'role','authenticated','is_anonymous',false)::text,true) from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids;
set local role authenticated;
do $$ begin
  begin
    insert into public.discussion_posts(topic_key,display_name,body) values('test:moderation','Test contributor','Attempt with an existing session.');
    raise exception 'restricted contributor can still post';
  exception when insufficient_privilege then null; end;
  begin
    insert into storage.objects(bucket_id,name) values('discussion-media',auth.uid()::text||'/blocked.jpg');
    raise exception 'restricted contributor can still upload';
  exception when insufficient_privilege then null; end;
  perform public.submit_safety_contact('I would like a moderator to review this restriction.',null);
end $$;
reset role;
select public.moderate_community_report('discussion',current_setting('test.media_report')::uuid,'dismissed','Controlled image report dismissal.');
select public.moderate_community_report('note',current_setting('test.note_report')::uuid,'dismissed','Controlled field note report dismissal.');
select public.moderate_community_report('discussion',report,'dismissed','Controlled false-report dismissal test.') from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids;
do $$ begin
  assert private.community_author_visible((select author from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids)),'dismissal did not lift temporary quarantine';
end $$;
select public.moderate_community_report('discussion',report,'actioned','Controlled confirmed-violation test.') from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids;
do $$ begin
  assert not private.community_author_visible((select author from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids)),'confirmed violation did not eject contributor';
end $$;
select public.moderate_community_report('discussion',report,'dismissed','A later unrelated dismissal must not reverse ejection.') from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids;
do $$ begin
  assert not private.community_author_visible((select author from (select current_setting('test.author')::uuid author,current_setting('test.reporter')::uuid reporter,current_setting('test.post')::uuid post,current_setting('test.note')::uuid note,current_setting('test.media')::uuid media,current_setting('test.report')::uuid report) test_ids)),'dismissal reversed permanent ejection';
end $$;
-- Production author columns are NOT NULL and cascade on account deletion.
-- Verify deletion of only our generated fixture account cannot leave public UGC.
delete from auth.users where id=current_setting('test.author')::uuid;
do $$ begin
 assert not exists(select 1 from public.discussion_posts where id=current_setting('test.post')::uuid),'account deletion left an orphan post';
 assert not exists(select 1 from public.discussion_media where id=current_setting('test.media')::uuid),'account deletion left orphan media';
 assert not exists(select 1 from public.field_notes where id=current_setting('test.note')::uuid),'account deletion left an orphan note';
end $$;
select 'community moderation acceptance passed' as result;
rollback;
