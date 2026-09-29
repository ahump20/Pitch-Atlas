import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

// This runner resets schemas. Refuse anything except a disposable local database.
const databaseUrl = process.env.PITCH_ATLAS_TEST_DATABASE_URL
assert(databaseUrl, 'Set PITCH_ATLAS_TEST_DATABASE_URL to a disposable local PostgreSQL database')
const target = new URL(databaseUrl)
assert(['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname), 'Database must be local')
assert(/^\/pitch_atlas_security_[a-z0-9_]+$/.test(target.pathname), 'Database name must start pitch_atlas_security_')
const psql = process.env.PITCH_ATLAS_PSQL || 'psql'
const args = ['-X', '-qAt', '-v', 'ON_ERROR_STOP=1', databaseUrl]
const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8')
function sql(input) {
  const result = spawnSync(psql, args, { input, encoding: 'utf8', timeout: 15000 })
  if (result.error || result.status !== 0) throw new Error(result.stderr || result.error?.message || 'psql failed')
  return result.stdout.trim()
}
function rejects(input, pattern) {
  const result = spawnSync(psql, args, { input, encoding: 'utf8', timeout: 15000 })
  assert.notEqual(result.status, 0, 'Expected database rejection')
  assert.match(result.stderr, pattern)
}
function fn(file, name) {
  const source = read(file)
  const start = source.indexOf('create or replace function ' + name + '(')
  assert(start >= 0, 'Missing source function ' + name)
  const end = source.indexOf('$$;', source.indexOf('as $$', start))
  assert(end > start, 'Missing source function terminator ' + name)
  return source.slice(start, end + 3)
}
const user = (n) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0')
const id = (n) => '10000000-0000-4000-8000-' + String(n).padStart(12, '0')
function asUser(n, anonymous = false) {
  return "set role authenticated; select set_config('request.jwt.claims', '" +
    JSON.stringify({ sub: user(n), role: 'authenticated', is_anonymous: anonymous }) + "', false);"
}
const object = (n, name, age = 'now()') => `insert into storage.objects (id,bucket_id,name,owner_id,created_at)
  values ('${id(n)}','discussion-media','${name}','${name.split('/')[0]}',${age});`
const post = (n, author = 1, parent = null, hidden = false) =>
  `insert into public.discussion_posts(id,topic_key,author_id,display_name,body,parent_id,is_hidden)
  values ('${id(n)}','pitch:four-seam','${user(author)}','Tester','A sourced grip.',
  ${parent ? "'" + id(parent) + "'" : 'null'}, ${hidden});`
const media = (n, name, author = 1, bytes = 8, kind = 'video', mime = 'video/webm', postId = 1) =>
  `insert into public.discussion_media(id,post_id,owner_id,topic_key,storage_path,byte_size,kind,mime_type)
  values ('${id(n)}','${id(postId)}','${user(author)}','pitch:four-seam','${name}',${bytes},'${kind}','${mime}');`
const attest = (n, name, author = 1) =>
  `set role service_role; select public.record_discussion_media_validation('${user(author)}','${name}','${id(n)}',8,'video/webm','video');`
const sourcePinned = 'supabase/migrations/20260615203500_pin_internal_trigger_search_paths.sql'
function reset(patched) {
  sql(read('scripts/security-postgres-fixture.sql'))
  sql(read('supabase/migrations/20260606005149_discussion_forum.sql'))
  sql(read('supabase/migrations/20260606011014_discussion_forum_access_fix.sql'))
  sql(read('supabase/migrations/20260615095000_storage_media_permanent_users.sql'))
  for (const name of ['public.enforce_discussion_media_limits', 'public.on_discussion_report', 'public.on_note_report_autohide']) {
    sql(fn(sourcePinned, name))
  }
  const gc = read('supabase/migrations/20260717032343_storage_api_orphan_media_gc.sql')
  sql(gc.slice(0, gc.indexOf('create or replace function public.orphan_discussion_media_paths')))
  sql(read('supabase/migrations/20260717044500_lock_discussion_media_reservation_finalization.sql'))
  sql(`create trigger trg_note_report after insert on public.note_reports
    for each row execute function public.on_note_report_autohide();
    grant select,insert,update,delete on all tables in schema public,storage to authenticated,service_role;
    insert into auth.users(id) values ${Array.from({ length: 8 }, (_, i) => "('" + user(i + 1) + "')").join(',')};
    insert into public.profiles(id) select id from auth.users;
    insert into public.discussion_media_terms(user_id) select id from auth.users where id <> '${user(8)}';`)
  if (patched) {
    sql(read('supabase/migrations/20260929223000_discussion_security_primitives.sql'))
    sql(read('supabase/migrations/20260929223100_verified_discussion_media.sql'))
  }
}

// Hold the first report uncommitted. Other reporters must wait, then count after
// that commit. Lock-wait observation makes the overlap deterministic.
async function concurrentReports(kind, targetId, reporters, patched) {
  const column = kind === 'note' ? 'note_id' : kind + '_id'
  const table = kind === 'note' ? 'note_reports' : 'discussion_reports'
  const processes = []
  const start = (reporter) => {
    const child = spawn(psql, args, { stdio: ['pipe', 'pipe', 'pipe'] })
    let output = '', errors = ''
    child.stdout.on('data', (chunk) => { output += chunk })
    child.stderr.on('data', (chunk) => { errors += chunk })
    const done = new Promise((resolve, reject) => {
      child.on('error', reject)
      child.on('close', (code) => code === 0 ? resolve() : reject(new Error(errors)))
    })
    const name = 'pa_security_' + kind + '_' + reporter
    child.stdin.write(`set application_name='${name}'; set statement_timeout='10s'; begin;
      insert into public.${table}(${column},reporter_id) values ('${targetId}','${user(reporter)}');
      select 'report_inserted';\n`)
    const session = { child, done, output: () => output, name }
    processes.push(session)
    return session
  }
  try {
    const first = start(reporters[0])
    for (let i = 0; !first.output().includes('report_inserted'); i++) {
      assert(i < 100, 'First report did not reach transaction barrier')
      await delay(20)
    }
    const rest = reporters.slice(1).map(start)
    for (let i = 0; ; i++) {
      const names = rest.map((s) => "'" + s.name + "'").join(',')
      const waiting = Number(sql(`select count(*) from pg_stat_activity where application_name in (${names}) and wait_event_type='Lock';`))
      if ((kind !== 'note' || patched) && waiting === rest.length) break
      if (kind === 'note' && !patched && rest.every((s) => s.output().includes('report_inserted'))) break
      assert(i < 100, 'Concurrent reporters did not reach lock/transaction barrier')
      await delay(20)
    }
    for (const session of processes) session.child.stdin.end('commit;\n')
    await Promise.all(processes.map((s) => s.done))
  } finally {
    for (const session of processes) if (session.child.exitCode === null) session.child.kill()
  }
}

async function reports(patched) {
  sql(post(1) + asUser(1) + object(2, user(1) + '/report.webm'))
  if (patched) sql(attest(2, user(1) + '/report.webm'))
  sql(media(2, user(1) + '/report.webm') +
    `insert into public.field_notes(id,author_id) values ('${id(3)}','${user(1)}');`)
  for (const [kind, targetId, reporters] of [
    ['media', id(2), [2, 3]], ['post', id(1), [2, 3, 4]], ['note', id(3), [2, 3, 4]],
  ]) {
    await concurrentReports(kind, targetId, reporters, patched)
    const table = kind === 'note' ? 'field_notes' : 'discussion_' + (kind === 'post' ? 'posts' : 'media')
    assert.equal(sql(`select is_hidden from public.${table} where id='${targetId}';`), patched ? 't' : 'f', kind)
  }
  if (patched) {
    assert.equal(sql('select count(*) from private.rollup_calls;'), '1')
    rejects(`insert into public.discussion_reports(media_id,reporter_id) values ('${id(2)}','${user(2)}');`, /duplicate key/)
    sql(`insert into public.field_notes(id,author_id) values ('${id(4)}','${user(1)}');
      insert into public.note_reports(note_id,reporter_id,status) values
      ('${id(4)}','${user(2)}','dismissed'),('${id(4)}','${user(3)}','open'),('${id(4)}','${user(4)}','open');`)
    assert.equal(sql(`select is_hidden from public.field_notes where id='${id(4)}';`), 'f')
  }
}

reset(false)
sql(post(10) + post(11, 2, 10) + asUser(1) + `delete from public.discussion_posts where id='${id(10)}';`)
assert.equal(sql(`select count(*) from public.discussion_posts where id='${id(11)}';`), '0')
const unverified = user(1) + '/unverified.webm'
sql(post(21) + asUser(1) + object(20, unverified) +
  media(20, unverified, 1, 1, 'image', 'image/png', 21))
sql(asUser(8) + object(22, user(8) + '/without-terms.webm'))
console.log('Baseline reproduced: foreign reply cascade, caller metadata, raw upload without terms')
reset(false)
await reports(false)
console.log('Baseline reproduced: concurrent media/post/note thresholds missed')

reset(true)
sql(post(10, 1, null, true) + post(11, 2, 10) + post(12, 1, 10) +
  asUser(1) + `delete from public.discussion_posts where id='${id(10)}';`)
assert.equal(sql(`select parent_id is null and is_hidden from public.discussion_posts where id='${id(11)}';`), 't')
assert.equal(sql(`select count(*) from public.discussion_posts where id='${id(12)}';`), '0')
sql(post(13, 5) + post(14, 6, 13) + `delete from auth.users where id='${user(5)}';`)
assert.equal(sql(`select parent_id is null from public.discussion_posts where id='${id(14)}';`), 't')
rejects(asUser(8) + object(22, user(8) + '/without-terms.webm'), /accept the upload terms/)
rejects(asUser(1, true) + object(22, user(1) + '/anonymous.webm'), /permanent account/)
sql(`update auth.users set is_anonymous=true where id='${user(7)}';`)
rejects("set role service_role; select set_config('request.jwt.claims', '{\"role\":\"service_role\"}', false);" +
  object(22, user(7) + '/anonymous-commit.webm'), /permanent account/)
rejects(asUser(1) + object(22, user(2) + '/foreign.webm'), /own upload folder/)
sql(post(1) + asUser(1) + object(30, unverified))
rejects(asUser(1) + media(30, unverified), /validate the uploaded file/)
rejects(asUser(1) + attest(30, unverified).replace('set role service_role;', ''), /permission denied for function/)
sql(attest(30, unverified))
rejects(asUser(1) + media(30, unverified, 1, 1, 'image', 'image/png'), /validate the uploaded file/)
rejects(asUser(2) + media(31, unverified, 2, 8, 'video', 'video/webm', 11), /your account folder/)
sql(asUser(1) + media(30, unverified))
sql(`delete from storage.objects where id='${id(30)}';`)
rejects(asUser(1) + object(31, unverified), /already attached/)
const swapPath = user(1) + '/swap.webm'
sql(asUser(1) + object(32, swapPath))
sql(`delete from storage.objects where id='${id(32)}';` + asUser(1) + object(33, swapPath))
rejects(attest(32, swapPath), /changed during validation/)
// Even a future permissive UPDATE policy cannot permit discussion replacement.
sql('create policy test_allow_update on storage.objects for update to authenticated using(true) with check(true);')
assert.equal(sql(asUser(1) + `with changed as (update storage.objects set metadata='{"size":1}'
  where id='${id(33)}' returning id) select count(*) from changed;`).split('\n').at(-1), '0')
// Upload-first compatibility and reservation consumption remain intact.
const legacyPath = user(2) + '/legacy.webm'
sql(asUser(2) + object(34, legacyPath))
sql(attest(34, legacyPath, 2))
sql(asUser(2) + media(34, legacyPath, 2, 8, 'video', 'video/webm', 11))
const reserved = user(1) + '/reserved.webm'
sql(asUser(1) + `select public.reserve_discussion_media_upload('${reserved}');` + object(35, reserved))
sql(attest(35, reserved))
sql(asUser(1) + media(35, reserved))
assert.equal(sql(`select count(*) from private.discussion_media_upload_reservations where storage_path='${reserved}';`), '0')
const old = user(1) + '/old.webm'
sql(asUser(1) + object(36, old, "now()-interval '24 hours'"))
sql(attest(36, old))
rejects(asUser(1) + media(36, old), /expired before it was attached/)
console.log('Patched: deletion preserves foreign replies; trusted object attestation and lifecycle controls pass')

// Cleanup/deletion cannot replenish admissions. Test the admission boundary
// without relying on the optional browser reservation workflow.
for (let n = 100; n < 120; n++) {
  const name = user(3) + '/quota-' + n + '.webm'
  // Mirror Storage's real adapter: permission probe rolls back, service commit
  // carries the caller's verified owner_id. Both phases must enforce admission.
  sql(asUser(3) + 'begin;' + object(n, name) + 'rollback;')
  sql("set role service_role; select set_config('request.jwt.claims', '{\"role\":\"service_role\"}', false);" + object(n, name))
  sql(`delete from storage.objects where id='${id(n)}';`)
}
rejects(asUser(3) + object(120, user(3) + '/quota-21.webm'), /rate_limit:/)
rejects("set role service_role; select set_config('request.jwt.claims', '{\"role\":\"service_role\"}', false);" +
  object(120, user(3) + '/quota-21.webm'), /rate_limit:/)
assert.equal(sql(`select count(*) from private.discussion_upload_admissions where owner_id='${user(3)}';`), '20')
rejects("set role service_role; select set_config('request.jwt.claims', '{\"role\":\"service_role\"}', false);" +
  `update storage.objects set metadata='{"size":100}',version='new-bytes' where id='${id(33)}';`,
  /upload replacement requires a new path/)
const bounded = user(4) + '/bounded.webm'
sql(asUser(4) + object(130, bounded))
for (let n = 0; n < 40; n++) sql(`set role service_role; select * from public.discussion_media_validation_object('${user(4)}','${bounded}');`)
rejects(`set role service_role; select * from public.discussion_media_validation_object('${user(4)}','${bounded}');`, /rate_limit:/)
console.log('Patched: durable upload quota and privileged validation quota pass')
reset(true)
await reports(true)
console.log('Patched: concurrent thresholds, distinct reporters, dismissed reports and author rollup pass')
console.log('PostgreSQL security regressions PASS (actual migration functions; emulated Supabase auth/storage)')
