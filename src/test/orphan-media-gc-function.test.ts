import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(process.cwd(), 'supabase/functions/gc-orphan-discussion-media/index.ts'),
  'utf8',
)
const config = readFileSync(resolve(process.cwd(), 'supabase/config.toml'), 'utf8')
const denoConfig = readFileSync(
  resolve(process.cwd(), 'supabase/functions/gc-orphan-discussion-media/deno.json'),
  'utf8',
)
const denoLock = readFileSync(
  resolve(process.cwd(), 'supabase/functions/gc-orphan-discussion-media/deno.lock'),
  'utf8',
)
const migration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260717032343_storage_api_orphan_media_gc.sql'),
  'utf8',
)
const legacyMigration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260626003027_orphan_media_gc.sql'),
  'utf8',
)
const finalizationLockMigration = readFileSync(
  resolve(
    process.cwd(),
    'supabase/migrations/20260717044500_lock_discussion_media_reservation_finalization.sql',
  ),
  'utf8',
)

describe('orphan discussion media cleanup contract', () => {
  it('uses a pinned direct client and passes the hash-only gate before service-role setup', () => {
    expect(config).toMatch(
      /\[functions\.gc-orphan-discussion-media\][\s\S]*?verify_jwt\s*=\s*false/,
    )
    expect(denoConfig).toContain('"@supabase/supabase-js": "jsr:@supabase/supabase-js@2.110.7"')
    expect(denoLock).toContain('"jsr:@supabase/supabase-js@2.110.7": "2.110.7"')
    expect(denoConfig).not.toContain('@supabase/server')
    expect(denoLock).not.toContain('@supabase/server')
    expect(source).not.toContain('createSupabaseContext')
    expect(source).not.toContain('secret:automations')
    expect(source).toContain('const AUTOMATION_HEADER = "X-Pitch-Atlas-Automation"')
    expect(source).toContain('crypto.subtle.digest(')
    expect(source).toContain('"SHA-256"')
    expect(source).toContain('Deno.env.get("SUPABASE_ANON_KEY")')
    expect(source).toContain('"authorize_discussion_media_gc"')
    expect(source).toContain('{ p_token_sha256: tokenHash }')
    expect(source).not.toContain('{ p_token_sha256: automationSecret }')

    const authorizationGate = source.indexOf('if (authorized !== true)')
    const serviceRoleSetup = source.indexOf('Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")')
    expect(authorizationGate).toBeGreaterThan(-1)
    expect(serviceRoleSetup).toBeGreaterThan(authorizationGate)
  })

  it('accepts POST only and stamps every owned response with provenance', () => {
    expect(source).toContain('if (req.method !== "POST")')
    expect(source).toContain('"Allow": "POST"')
    expect(source).toContain('source: SOURCE')
    expect(source).toContain('fetched_at: new Date().toISOString()')
    expect(source).toContain('timezone: "America/Chicago"')
    expect(source).toContain('"X-Data-Source": responseMeta.source')
    expect(source).toContain('"X-Origin-Data-Source": responseMeta.source')
    expect(source).toContain('"X-Last-Updated": responseMeta.fetched_at')
  })

  it('lists a bounded path set and removes objects through the Storage API', () => {
    expect(source).toContain('const MAX_OBJECTS_PER_RUN = 1000')
    expect(source).toContain('"orphan_discussion_media_paths"')
    expect(source).toMatch(/\.storage\s*\.from\(BUCKET\)\s*\.remove\(paths\)/)
    expect(source).not.toMatch(/delete\s+from\s+storage\.objects/i)
    expect(source).not.toContain('removeError.message')
    expect(source).not.toContain('listError.message')
    expect(source).toContain('requested: paths.length, removed')
    expect(source).toContain('removedObjects.length')
  })

  it('keeps the path lookup service-role-only and does not treat hidden rows as orphans', () => {
    expect(migration).toContain('security invoker')
    expect(migration).toContain('limit greatest(1, least(coalesce(p_limit, 1000), 1000))')
    expect(migration).toContain("o.created_at < (pg_catalog.now() - interval '24 hours')")
    expect(migration).toContain(
      'revoke all on function public.orphan_discussion_media_paths(integer) from public, anon, authenticated',
    )
    expect(migration).toContain(
      'grant execute on function public.orphan_discussion_media_paths(integer) to service_role',
    )
    expect(migration).toMatch(
      /not exists\s*\([\s\S]*?from public\.discussion_media m[\s\S]*?m\.storage_path = o\.name/i,
    )
    expect(migration).not.toMatch(/m\.is_hidden\s*=\s*false/i)
  })

  it('stores owner-bound reservations privately and exposes only narrow permanent-account RPCs', () => {
    expect(migration).toMatch(
      /create table if not exists private\.discussion_media_upload_reservations\s*\([\s\S]*?storage_path text primary key[\s\S]*?owner_id uuid not null[\s\S]*?reserved_at timestamptz not null[\s\S]*?expires_at timestamptz not null/i,
    )
    expect(migration).toContain(
      'revoke all on table private.discussion_media_upload_reservations',
    )
    expect(migration).toMatch(
      /create or replace function public\.reserve_discussion_media_upload\(p_storage_path text\)[\s\S]*?security definer[\s\S]*?set search_path = ''/i,
    )
    expect(migration).toMatch(
      /create or replace function public\.release_discussion_media_upload\(p_storage_path text\)[\s\S]*?security definer[\s\S]*?set search_path = ''/i,
    )
    expect(migration).toContain("->> 'is_anonymous'")
    expect(migration).toContain('from public.discussion_media_terms t')
    expect(migration).toContain("pg_catalog.split_part(p_storage_path, '/', 1) <> viewer_id::text")
    expect(migration).toContain('if active_count >= 20 then')
    expect(migration).toMatch(
      /from storage\.objects o[\s\S]*?o\.bucket_id = 'discussion-media'[\s\S]*?o\.name = p_storage_path/i,
    )
    expect(migration).toContain(
      'grant execute on function public.reserve_discussion_media_upload(text)',
    )
    expect(migration).toContain(
      'grant execute on function public.release_discussion_media_upload(text)',
    )
    expect(migration).not.toMatch(
      /grant execute on function public\.(?:reserve|release)_discussion_media_upload\(text\)\s+to (?:public|anon)/i,
    )
  })

  it('never turns an upload reservation into Storage read access', () => {
    expect(migration).not.toContain('discussion_media_reserved_object_read')
    expect(migration).not.toContain('has_active_discussion_media_upload_reservation')
  })

  it('finalizes only existing objects with a reserved lane or the 23-hour legacy lane', () => {
    expect(migration).toMatch(
      /enforce_discussion_media_storage_finalization[\s\S]*?from storage\.objects o[\s\S]*?o\.name = new\.storage_path[\s\S]*?if object_created_at is null then/i,
    )
    expect(migration).toMatch(
      /r\.storage_path = new\.storage_path[\s\S]*?r\.owner_id = new\.owner_id[\s\S]*?r\.expires_at > pg_catalog\.now\(\)[\s\S]*?r\.reserved_at <= object_created_at/i,
    )
    expect(migration).toContain(
      "object_created_at <= (pg_catalog.statement_timestamp() - interval '23 hours')",
    )
    expect(migration).toMatch(
      /create trigger trg_discussion_media_reservation_consume[\s\S]*?after insert on public\.discussion_media/i,
    )
    expect(migration).toMatch(
      /consume_discussion_media_upload_reservation[\s\S]*?delete from private\.discussion_media_upload_reservations/i,
    )
  })

  it('locks the active reservation row so expiry pruning waits for media finalization', () => {
    expect(finalizationLockMigration).toMatch(
      /create or replace function private\.enforce_discussion_media_storage_finalization\(\)[\s\S]*?security definer[\s\S]*?set search_path = ''/i,
    )
    expect(finalizationLockMigration).toMatch(
      /select true[\s\S]*?from private\.discussion_media_upload_reservations r[\s\S]*?r\.storage_path = new\.storage_path[\s\S]*?r\.owner_id = new\.owner_id[\s\S]*?r\.expires_at > pg_catalog\.now\(\)[\s\S]*?r\.reserved_at <= object_created_at[\s\S]*?for update;/i,
    )
    expect(finalizationLockMigration).toContain(
      "object_created_at <= (pg_catalog.statement_timestamp() - interval '23 hours')",
    )
    expect(finalizationLockMigration).toContain(
      'revoke all on function private.enforce_discussion_media_storage_finalization()',
    )

    const reservationLock = finalizationLockMigration.indexOf('for update;')
    const legacyGate = finalizationLockMigration.indexOf('if not has_active_reservation')
    expect(reservationLock).toBeGreaterThan(-1)
    expect(legacyGate).toBeGreaterThan(reservationLock)

    const expiryPrune = migration.indexOf(
      'delete from private.discussion_media_upload_reservations r',
    )
    const orphanQuery = migration.indexOf('return query', expiryPrune)
    expect(expiryPrune).toBeGreaterThan(-1)
    expect(orphanQuery).toBeGreaterThan(expiryPrune)
  })

  it('prunes expired reservations and excludes active ones from the 24-hour GC set', () => {
    expect(migration).toMatch(
      /delete from private\.discussion_media_upload_reservations r[\s\S]*?r\.expires_at <= pg_catalog\.now\(\)[\s\S]*?return query/i,
    )
    expect(migration).toMatch(
      /not exists\s*\([\s\S]*?from private\.discussion_media_upload_reservations r[\s\S]*?r\.storage_path = o\.name[\s\S]*?r\.expires_at > pg_catalog\.now\(\)/i,
    )
  })

  it('authorizes the scheduler through a generated Vault secret and a hash-only RPC', () => {
    expect(migration).toContain('extensions.gen_random_bytes(32)')
    expect(migration).toContain("'pitch_atlas_automations_shared_secret'")
    expect(migration).toMatch(
      /create or replace function public\.authorize_discussion_media_gc\([\s\S]*?security definer[\s\S]*?set search_path = ''/i,
    )
    expect(migration).toContain("extensions.digest(s.decrypted_secret, 'sha256')")
    expect(migration).toContain(
      'revoke all on function public.authorize_discussion_media_gc(text)',
    )
    expect(migration).toMatch(
      /grant execute on function public\.authorize_discussion_media_gc\(text\)\s+to anon/i,
    )
    expect(migration).not.toMatch(
      /grant execute on function public\.authorize_discussion_media_gc\(text\)\s+to (?:authenticated|service_role|public)/i,
    )
  })

  it('keeps the migration portable when a preview branch omits pg_cron', () => {
    expect(legacyMigration).toContain('when undefined_schema or undefined_function then')
    expect(legacyMigration).toContain('legacy orphan-media scheduling skipped')
    expect(migration).toContain("pg_catalog.to_regnamespace('cron') is null")
    expect(migration).toContain('orphan-media scheduling skipped')
    expect(migration).toMatch(
      /if pg_catalog\.to_regnamespace\('cron'\) is null[\s\S]*?return;[\s\S]*?execute \$sql\$[\s\S]*?select cron\.schedule/i,
    )
  })

  it('replaces the broken SQL deleter with the Vault-authenticated scheduled function call', () => {
    expect(migration).toContain("cron.unschedule('gc-orphan-discussion-media')")
    expect(migration).toContain('drop function if exists private.gc_orphan_discussion_media()')
    expect(migration).toContain("where name = 'pitch_atlas_automations_shared_secret'")
    expect(migration).toContain("where name = 'pitch_atlas_project_url'")
    expect(migration).toContain("'X-Pitch-Atlas-Automation'")
    expect(migration).not.toContain("'apikey'")
    expect(migration).not.toContain('pitch_atlas_automations_secret_key')
    expect(migration).toContain('/functions/v1/gc-orphan-discussion-media')
    expect(migration).not.toContain('cloeoulvrrfcbitrjpso')
    expect(migration).not.toMatch(/delete\s+from\s+storage\.objects/i)
  })

  it('records a bounded heartbeat for each authenticated cleanup run', () => {
    expect(migration).toContain('create table if not exists private.discussion_media_gc_runs')
    expect(migration).toContain('record_discussion_media_gc_run')
    expect(migration).toContain("ran_at < (now() - interval '90 days')")
    expect(source).toContain('await recordRun("ok", 0, 0)')
    expect(source).toContain('await recordRun("error", paths.length, 0, "storage_remove_failed")')
  })
})
