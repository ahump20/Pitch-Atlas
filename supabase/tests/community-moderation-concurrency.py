"""Local-only committed-fixture concurrency acceptance; never targets hosted data."""
import concurrent.futures
import os
import subprocess
import time
import uuid

PSQL = ['psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', '-h', '127.0.0.1', '-p', os.getenv('MODERATION_TEST_PORT', '55439'), '-U', 'postgres', '-d', 'postgres']


def sql(query):
    start = time.monotonic()
    result = subprocess.run(PSQL, input=query, capture_output=True, text=True, timeout=15)
    if result.returncode:
        raise AssertionError(result.stderr)
    return time.monotonic() - start


for target in ['auth.users:reporter', 'auth.users:author', 'public.profiles:author',
               'public.discussion_posts:post', 'public.discussion_media:media', 'public.field_notes:note']:
    ids = {key: str(uuid.uuid4()) for key in ['author', 'reporter', 'post', 'media', 'note', 'post_report', 'media_report', 'note_report']}
    pitch = 'concurrency-' + str(uuid.uuid4())
    path = ids['author'] + '/concurrency.jpg'
    setup = f"""
    insert into auth.users(id,is_anonymous) values('{ids['author']}',false),('{ids['reporter']}',true);
    insert into public.pitches(slug,name) values('{pitch}','Local concurrency fixture');
    insert into public.discussion_posts(id,topic_key,author_id,display_name,body)
      values('{ids['post']}','test:concurrency','{ids['author']}','Test author','Controlled concurrency fixture.');
    insert into public.field_notes(id,pitch_slug,author_id,display_name,tweak,player_level,arm_slot,intent,claimed_result_kind)
      values('{ids['note']}','{pitch}','{ids['author']}','Test author','Test grip','college-plus','three-quarter','better-command','no-noticeable-change');
    insert into public.discussion_media_terms(user_id) values('{ids['author']}');
    insert into storage.objects(bucket_id,name) values('discussion-media','{path}');
    insert into public.discussion_media(id,post_id,owner_id,topic_key,storage_path,mime_type,kind,byte_size)
      values('{ids['media']}','{ids['post']}','{ids['author']}','test:concurrency','{path}','image/jpeg','image',128);
    insert into public.discussion_reports(id,post_id,reporter_id,reason,created_at)
      values('{ids['post_report']}','{ids['post']}','{ids['reporter']}','Controlled concurrency report.',now()-interval '22 hours 1 minute');
    insert into public.discussion_reports(id,media_id,reporter_id,reason,created_at)
      values('{ids['media_report']}','{ids['media']}','{ids['reporter']}','Controlled concurrency report.',now()-interval '22 hours 1 minute');
    insert into public.note_reports(id,note_id,reporter_id,reason,created_at)
      values('{ids['note_report']}','{ids['note']}','{ids['reporter']}','Controlled concurrency report.',now()-interval '22 hours 1 minute');
    """
    table, identity = target.split(':')
    try:
        sql(setup)
        # The first transaction deliberately holds the review lock while the
        # second attempts a parent/cascade deletion. Both must finish, not deadlock.
        review = f"begin; set local lock_timeout='5s'; select pg_advisory_xact_lock(20261105032000); select pg_sleep(0.6); select public.enforce_community_report_deadlines(); select public.moderate_community_report('discussion','{ids['post_report']}','actioned','Controlled concurrency decision.'); commit;"
        deletion = f"begin; set local lock_timeout='5s'; delete from {table} where id='{ids[identity]}'; commit;"
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            first = pool.submit(sql, review)
            time.sleep(0.15)
            second = pool.submit(sql, deletion)
            first.result()
            elapsed = second.result()
            assert elapsed > 0.3, f'{target}: deletion did not wait for review lock'
        print(target + ': serialized without deadlock')
    finally:
        sql(f"delete from auth.users where id in ('{ids['author']}','{ids['reporter']}'); delete from storage.objects where bucket_id='discussion-media' and name='{path}'; delete from public.pitches where slug='{pitch}'; delete from private.community_content_quarantines where report_id in ('{ids['post_report']}','{ids['media_report']}','{ids['note_report']}'); delete from private.community_moderation_events where subject_id='{ids['author']}'; delete from private.community_media_path_locks where path_digest=md5('{path}');")
for finalization_first in [True, False]:
    author, post, media = [str(uuid.uuid4()) for _ in range(3)]
    path = author + '/finalization.jpg'
    finalize = f"""insert into public.discussion_media(id,post_id,owner_id,topic_key,storage_path,mime_type,kind,byte_size)
      values('{media}','{post}','{author}','test:concurrency','{path}','image/jpeg','image',128);"""
    replace = f"update storage.objects set version='replacement' where bucket_id='discussion-media' and name='{path}';"
    try:
        sql(f"""insert into auth.users(id,is_anonymous) values('{author}',false);
          insert into public.discussion_posts(id,topic_key,author_id,display_name,body)
            values('{post}','test:concurrency','{author}','Test author','Controlled storage concurrency fixture.');
          insert into public.discussion_media_terms(user_id) values('{author}');
          insert into storage.objects(bucket_id,name,version) values('discussion-media','{path}','original');""")
        first_action = finalize if finalization_first else replace
        second_action = (
            "do $$ begin " + replace + " raise exception 'finalized replacement accepted'; "
            "exception when insufficient_privilege then null; end $$;"
        ) if finalization_first else finalize
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            first = pool.submit(sql, "begin; set local lock_timeout='5s'; " + first_action + " select pg_sleep(0.6); commit;")
            time.sleep(0.15)
            second = pool.submit(sql, "begin; set local lock_timeout='5s'; " + second_action + " commit;")
            first.result()
            assert second.result() > 0.3, 'storage/finalization did not serialize'
        expected = 'original' if finalization_first else 'replacement'
        sql(f"""do $$ begin
          assert (select version='{expected}' from storage.objects where bucket_id='discussion-media' and name='{path}'), 'unexpected physical version pointer';
          assert not private.community_media_path_mutable('{path}'), 'finalized path remained mutable';
          end $$;
          update storage.objects set updated_at=now(),last_accessed_at=now() where bucket_id='discussion-media' and name='{path}';""")
        sql(f"""delete from public.discussion_posts where id='{post}';
          delete from storage.objects where bucket_id='discussion-media' and name='{path}';
          do $$ begin
            insert into storage.objects(bucket_id,name,version) values('discussion-media','{path}','reused');
            raise exception 'finalized path reused after cleanup';
          exception when insufficient_privilege then null; end $$;""")
        print(('finalization before replacement' if finalization_first else 'replacement before finalization') + ': serialized without deadlock')
    finally:
        sql(f"delete from auth.users where id='{author}'; delete from storage.objects where bucket_id='discussion-media' and name='{path}'; delete from private.community_media_path_locks where path_digest=md5('{path}');")
print('community moderation concurrency acceptance passed')
