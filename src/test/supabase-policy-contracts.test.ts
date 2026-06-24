import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('community safety database policy contracts', () => {
  const migrations = [
    'supabase/migrations/20260614042959_banned_terms_explicit_admin_read_policy.sql',
    'supabase/migrations/20260614190152_banned_terms_non_anonymous_admin_read.sql',
  ]
    .map((path) => readFileSync(resolve(process.cwd(), path), 'utf8'))
    .join('\n')

  function insertGrantColumns(sql: string, table: string) {
    const match = sql.match(
      new RegExp(`grant\\s+insert\\s*\\(([^)]+)\\)\\s+on\\s+public\\.${table}\\s+to\\s+authenticated`, 'i'),
    )

    return (match?.[1] ?? '')
      .split(',')
      .map((column) => column.trim())
      .filter(Boolean)
  }

  function selectGrantColumns(sql: string, table: string, granteePattern = 'anon,\\s*authenticated') {
    const match = sql.match(
      new RegExp(`grant\\s+select\\s*\\(([^)]+)\\)\\s+on\\s+public\\.${table}\\s+to\\s+${granteePattern}`, 'i'),
    )

    return (match?.[1] ?? '')
      .split(',')
      .map((column) => column.trim())
      .filter(Boolean)
  }

  function stripSqlLineComments(sql: string) {
    return sql
      .split('\n')
      .map((line) => line.replace(/--.*$/, ''))
      .join('\n')
  }

  it('keeps banned terms admin reads closed to anonymous Supabase sessions', () => {
    expect(migrations).toContain('drop policy if exists banned_terms_admin_read on public.banned_terms')
    expect(migrations).toContain('create policy banned_terms_admin_read')
    expect(migrations).toContain('to authenticated')
    expect(migrations).toContain('private.is_admin()')
    expect(migrations).toContain("(select auth.jwt()) ->> 'is_anonymous'")
    expect(migrations).toContain('= false')
  })

  it('keeps note reports write-only for public client roles', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260614233000_note_reports_insert_only_client_role.sql'),
      'utf8',
    )

    expect(migration).toContain('revoke update on public.note_reports from anon, authenticated')
    expect(migration).toContain('drop policy if exists reports_admin_update on public.note_reports')
    expect(migration).not.toMatch(/\bgrant\s+update\b[\s\S]*\bpublic\.note_reports\b/i)
  })

  it('keeps community inserts limited to contributor-authored columns', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260614235500_community_insert_column_grants.sql'),
      'utf8',
    )

    expect(migration).toContain('revoke insert on public.field_notes from anon, authenticated')
    expect(migration).toContain('revoke insert on public.discussion_posts from anon, authenticated')
    expect(migration).toContain('revoke insert on public.discussion_media from anon, authenticated')
    expect(migration).not.toMatch(/\bgrant\s+insert\s+on\s+public\.(field_notes|discussion_posts|discussion_media)\b/i)

    const fieldNoteColumns = insertGrantColumns(migration, 'field_notes')
    expect(fieldNoteColumns).toEqual([
      'pitch_slug',
      'display_name',
      'tweak',
      'player_level',
      'arm_slot',
      'velocity_band',
      'intent',
      'claimed_result_kind',
      'claimed_result_note',
      'sample_size',
      'evidence_url',
      'evidence_label',
      'source_tier',
      'note',
    ])
    expect(fieldNoteColumns).not.toEqual(expect.arrayContaining([
      'author_id',
      'visibility',
      'adoption_count',
      'helpful_count',
      'base_rank',
      'is_hidden',
    ]))

    expect(insertGrantColumns(migration, 'discussion_posts')).toEqual([
      'topic_key',
      'display_name',
      'parent_id',
      'body',
    ])
    expect(insertGrantColumns(migration, 'discussion_media')).not.toEqual(expect.arrayContaining([
      'owner_id',
      'is_hidden',
      'report_count',
      'created_at',
    ]))
  })

  it('keeps block-list inserts limited to the target user', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615002500_blocked_users_insert_column_grant.sql'),
      'utf8',
    )

    expect(migration).toContain('revoke insert on public.blocked_users from anon, authenticated')
    expect(insertGrantColumns(migration, 'blocked_users')).toEqual(['blocked_id'])
    expect(migration).not.toMatch(/\bgrant\s+insert\s+on\s+public\.blocked_users\b/i)
    expect(insertGrantColumns(migration, 'blocked_users')).not.toEqual(expect.arrayContaining([
      'blocker_id',
      'created_at',
    ]))
  })

  it('keeps media terms acceptance timestamp database-owned', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615005000_media_terms_insert_column_grant.sql'),
      'utf8',
    )

    expect(migration).toContain('revoke insert on public.discussion_media_terms from anon, authenticated')
    expect(insertGrantColumns(migration, 'discussion_media_terms')).toEqual(['user_id'])
    expect(migration).not.toMatch(/\bgrant\s+insert\s+on\s+public\.discussion_media_terms\b/i)
    expect(insertGrantColumns(migration, 'discussion_media_terms')).not.toContain('accepted_at')
  })

  it('keeps discussion media deletes tied to parent post deletion', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615012500_discussion_media_delete_via_posts.sql'),
      'utf8',
    )

    expect(migration).toContain('revoke delete on public.discussion_media from anon, authenticated')
    expect(migration).toContain('drop policy if exists discussion_media_delete on public.discussion_media')
    expect(migration).not.toMatch(/\bgrant\s+delete\s+on\s+public\.discussion_media\b/i)
  })

  it('keeps block relationship checks scoped to the current viewer', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615015000_blocked_between_current_user_guard.sql'),
      'utf8',
    )

    expect(migration).toContain('create or replace function private.blocked_between(left_user uuid, right_user uuid)')
    expect(migration).toContain('select auth.uid() as id')
    expect(migration).toContain('when viewer.id is null then false')
    expect(migration).toContain('when viewer.id <> left_user and viewer.id <> right_user then false')
    expect(migration).toContain('grant execute on function private.blocked_between(uuid, uuid) to anon, authenticated')
  })

  it('pins admin and block helpers to empty search paths', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615200500_pin_admin_helper_search_paths.sql'),
      'utf8',
    )
    const executableSql = stripSqlLineComments(migration)

    expect(executableSql).toMatch(/create\s+or\s+replace\s+function\s+private\.is_admin\(\)[\s\S]*?\bsecurity\s+definer\b[\s\S]*?\bset\s+search_path\s*=\s*''/i)
    expect(executableSql).toMatch(/create\s+or\s+replace\s+function\s+private\.blocked_between\(left_user\s+uuid,\s+right_user\s+uuid\)[\s\S]*?\bsecurity\s+definer\b[\s\S]*?\bset\s+search_path\s*=\s*''/i)
    expect(executableSql).toMatch(/create\s+or\s+replace\s+function\s+public\.is_admin\(\)[\s\S]*?\bsecurity\s+definer\b[\s\S]*?\bset\s+search_path\s*=\s*''/i)
    expect(executableSql).toContain('from public.profiles p')
    expect(executableSql).toContain('from public.blocked_users b')
    expect(executableSql).toContain('grant execute on function private.is_admin() to anon, authenticated')
    expect(executableSql).toContain('grant execute on function private.blocked_between(uuid, uuid) to anon, authenticated')
    expect(executableSql).toContain('revoke all on function public.is_admin() from public')
    expect(executableSql).toContain('grant execute on function public.is_admin() to service_role')
    expect(executableSql).toContain('revoke execute on function public.is_admin() from anon, authenticated')
    expect(executableSql).not.toMatch(/set\s+search_path\s+(?:=|to)\s+'?public/i)
  })

  it('pins internal trigger helpers to empty search paths', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615203500_pin_internal_trigger_search_paths.sql'),
      'utf8',
    )
    const executableSql = stripSqlLineComments(migration)
    const internalHelpers = [
      'refresh_author_rollup',
      'on_engagement_change',
      'on_field_note_after',
      'handle_new_user',
      'handle_user_claim',
      'on_note_report_autohide',
      'text_has_banned_term',
      'enforce_field_note_rate_limit',
      'enforce_field_note_content_safety',
      'enforce_profile_content_safety',
      'enforce_discussion_depth',
      'enforce_discussion_content_safety',
      'enforce_discussion_rate_limit',
      'enforce_discussion_media_limits',
      'on_discussion_report',
      'enforce_discussion_block_edges',
    ]

    for (const helper of internalHelpers) {
      expect(executableSql).toMatch(
        new RegExp(`create\\s+or\\s+replace\\s+function\\s+public\\.${helper}\\(`, 'i'),
      )
      expect(executableSql).toMatch(
        new RegExp(`create\\s+or\\s+replace\\s+function\\s+public\\.${helper}\\([\\s\\S]*?\\bsecurity\\s+definer\\b[\\s\\S]*?\\bset\\s+search_path\\s*=\\s*''`, 'i'),
      )
      expect(executableSql).toContain(`revoke execute on function public.${helper}(`)
    }

    expect(executableSql).toContain("to_regclass('public.thread_participants')")
    expect(executableSql).not.toMatch(/set\s+search_path\s+(?:=|to)\s+'?(?:public|auth)/i)
    expect(executableSql).toContain('from public.field_notes')
    expect(executableSql).toContain('from public.discussion_posts')
    expect(executableSql).toContain('from public.banned_terms b')
    expect(executableSql).toContain('private.blocked_between(new.author_id, v_parent_author)')
  })

  it('pins service-only invoker helpers to empty search paths', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615205500_pin_remaining_helper_search_paths.sql'),
      'utf8',
    )
    const executableSql = stripSqlLineComments(migration)

    expect(executableSql).toContain("alter function public.note_base_rank(text, boolean, integer, integer, integer)\n  set search_path = ''")
    expect(executableSql).toContain("alter function public.on_field_note_biu()\n  set search_path = ''")
    expect(executableSql).toContain("alter function public.set_updated_at()\n  set search_path = ''")
    expect(executableSql).toContain('revoke execute on function public.note_base_rank(text, boolean, integer, integer, integer)\n  from public, anon, authenticated')
    expect(executableSql).toContain('revoke execute on function public.on_field_note_biu()\n  from public, anon, authenticated')
    expect(executableSql).toContain('revoke execute on function public.set_updated_at()\n  from public, anon, authenticated')
    expect(executableSql).toContain('grant execute on function public.note_base_rank(text, boolean, integer, integer, integer)\n  to service_role')
    expect(executableSql).toContain('grant execute on function public.on_field_note_biu()\n  to service_role')
    expect(executableSql).toContain('grant execute on function public.set_updated_at()\n  to service_role')
    expect(executableSql).not.toMatch(/set\s+search_path\s+(?:=|to)\s+'?public/i)
  })

  it('uses initplan viewer lookup inside admin and block helpers', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615212500_initplan_admin_block_helpers.sql'),
      'utf8',
    )
    const executableSql = stripSqlLineComments(migration)

    expect(executableSql).toMatch(/create\s+or\s+replace\s+function\s+private\.is_admin\(\)[\s\S]*?\bsecurity\s+definer\b[\s\S]*?\bset\s+search_path\s*=\s*''/i)
    expect(executableSql).toMatch(/create\s+or\s+replace\s+function\s+private\.blocked_between\(left_user\s+uuid,\s+right_user\s+uuid\)[\s\S]*?\bsecurity\s+definer\b[\s\S]*?\bset\s+search_path\s*=\s*''/i)
    expect(executableSql).toMatch(/create\s+or\s+replace\s+function\s+public\.is_admin\(\)[\s\S]*?\bsecurity\s+definer\b[\s\S]*?\bset\s+search_path\s*=\s*''/i)
    expect(executableSql.match(/\(select auth\.uid\(\)\) as id/gi)).toHaveLength(3)
    expect(executableSql).not.toMatch(/\bwhere\s+p\.id\s*=\s*auth\.uid\(\)/i)
    expect(executableSql).not.toMatch(/\bselect\s+auth\.uid\(\)\s+as\s+id\b/i)
    expect(executableSql).toContain('grant execute on function private.is_admin() to anon, authenticated')
    expect(executableSql).toContain('grant execute on function private.blocked_between(uuid, uuid) to anon, authenticated')
    expect(executableSql).toContain('grant execute on function public.is_admin() to service_role')
    expect(executableSql).toContain('revoke execute on function public.is_admin() from anon, authenticated')
    expect(executableSql).not.toMatch(/set\s+search_path\s+(?:=|to)\s+'?public/i)
  })

  it('keeps discussion reads limited to rendered thread columns', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615022000_discussion_read_column_grants.sql'),
      'utf8',
    )

    expect(migration).toContain('revoke select on public.discussion_posts from anon, authenticated')
    expect(selectGrantColumns(migration, 'discussion_posts')).toEqual([
      'id',
      'topic_key',
      'author_id',
      'display_name',
      'parent_id',
      'body',
      'created_at',
    ])
    expect(selectGrantColumns(migration, 'discussion_posts')).not.toEqual(expect.arrayContaining([
      'is_hidden',
      'report_count',
      'updated_at',
    ]))

    expect(migration).toContain('revoke select on public.discussion_media from anon, authenticated')
    expect(selectGrantColumns(migration, 'discussion_media')).toEqual([
      'id',
      'post_id',
      'storage_path',
      'kind',
      'width',
      'height',
    ])
    expect(selectGrantColumns(migration, 'discussion_media')).not.toEqual(expect.arrayContaining([
      'owner_id',
      'is_hidden',
      'report_count',
      'mime_type',
      'byte_size',
      'created_at',
    ]))
  })

  it('keeps field note reads limited to rendered note columns', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615030000_field_notes_read_column_grants.sql'),
      'utf8',
    )

    expect(migration).toContain('revoke select on public.field_notes from anon, authenticated')
    expect(selectGrantColumns(migration, 'field_notes')).toEqual([
      'id',
      'pitch_slug',
      'author_id',
      'display_name',
      'tweak',
      'player_level',
      'arm_slot',
      'velocity_band',
      'intent',
      'claimed_result_kind',
      'claimed_result_note',
      'sample_size',
      'evidence_url',
      'evidence_label',
      'source_tier',
      'note',
      'adoption_count',
      'helpful_count',
      'base_rank',
      'created_at',
    ])
    expect(selectGrantColumns(migration, 'field_notes')).not.toEqual(expect.arrayContaining([
      'is_hidden',
      'visibility',
      'updated_at',
      'tries_worked_count',
      'tries_mixed_count',
      'tries_no_change_count',
      'tries_worse_count',
    ]))
  })

  it('keeps viewer engagement reads limited to current-client columns', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615032000_viewer_engagement_read_column_grants.sql'),
      'utf8',
    )

    expect(migration).toContain('revoke select on public.note_tries from anon, authenticated')
    expect(selectGrantColumns(migration, 'note_tries', 'authenticated')).toEqual(['note_id', 'user_id'])
    expect(selectGrantColumns(migration, 'note_tries', 'authenticated')).not.toEqual(expect.arrayContaining([
      'id',
      'created_at',
      'outcome_kind',
    ]))

    expect(migration).toContain('revoke select on public.note_helpful from anon, authenticated')
    expect(selectGrantColumns(migration, 'note_helpful', 'authenticated')).toEqual(['note_id', 'user_id'])
    expect(selectGrantColumns(migration, 'note_helpful', 'authenticated')).not.toEqual(expect.arrayContaining([
      'id',
      'created_at',
    ]))

    expect(migration).toContain('revoke select on public.discussion_media_terms from anon, authenticated')
    expect(selectGrantColumns(migration, 'discussion_media_terms', 'authenticated')).toEqual(['user_id'])
    expect(selectGrantColumns(migration, 'discussion_media_terms', 'authenticated')).not.toContain('accepted_at')
  })

  it('keeps viewer engagement reads behind an RPC', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615102000_viewer_engagement_rpc.sql'),
      'utf8',
    )
    const executableSql = stripSqlLineComments(migration)

    expect(executableSql).toContain('revoke select on public.note_tries from anon, authenticated')
    expect(executableSql).toContain('revoke select on public.note_helpful from anon, authenticated')
    expect(executableSql).toMatch(/create\s+or\s+replace\s+function\s+public\.viewer_note_engagement\(\)[\s\S]*?\breturns\s+table\s*\([\s\S]*?\bnote_id\s+uuid[\s\S]*?\btried\s+boolean[\s\S]*?\bhelpful\s+boolean/i)
    expect(executableSql).toMatch(/security\s+definer[\s\S]*?set\s+search_path\s*=\s*''/i)
    expect(executableSql).toContain('select (select auth.uid()) as user_id')
    expect(executableSql).toContain('grant execute on function public.viewer_note_engagement() to authenticated')
    expect(executableSql).not.toMatch(/\bgrant\s+select\b[\s\S]*?\bon\s+public\.(note_tries|note_helpful)\b/i)
  })

  it('keeps media terms policies authenticated-only', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615092000_media_terms_policies_authenticated.sql'),
      'utf8',
    )
    const executableSql = stripSqlLineComments(migration)

    expect(migration).toContain('revoke select, insert on public.discussion_media_terms from anon, authenticated')
    expect(selectGrantColumns(migration, 'discussion_media_terms', 'authenticated')).toEqual(['user_id'])
    expect(insertGrantColumns(migration, 'discussion_media_terms')).toEqual(['user_id'])
    expect(executableSql).toMatch(/create\s+policy\s+dmt_select[\s\S]*?\bfor\s+select\s+to\s+authenticated\b[\s\S]*?\busing\b/i)
    expect(executableSql).toMatch(/create\s+policy\s+dmt_insert[\s\S]*?\bfor\s+insert\s+to\s+authenticated\b[\s\S]*?\bwith\s+check\b/i)
    expect(executableSql).not.toMatch(/\bto\s+(anon|public)\b/i)
  })

  it('keeps media terms policies closed to anonymous Supabase sessions', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615093000_media_terms_permanent_users.sql'),
      'utf8',
    )
    const executableSql = stripSqlLineComments(migration)

    expect(executableSql).toMatch(
      /create\s+policy\s+dmt_select[\s\S]*?\bfor\s+select\s+to\s+authenticated\b[\s\S]*?\busing\b/i,
    )
    expect(executableSql).toMatch(
      /create\s+policy\s+dmt_insert[\s\S]*?\bfor\s+insert\s+to\s+authenticated\b[\s\S]*?\bwith\s+check\b/i,
    )
    expect(executableSql).toContain("((select auth.jwt()) ->> 'is_anonymous')::boolean is false")
    expect(executableSql).not.toMatch(/\bto\s+(anon|public)\b/i)
  })

  it('keeps media terms behind RPCs instead of direct table grants', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615094500_media_terms_rpc_gate.sql'),
      'utf8',
    )
    const executableSql = stripSqlLineComments(migration)

    expect(executableSql).toContain('revoke select, insert on public.discussion_media_terms from anon, authenticated')
    expect(executableSql).toMatch(/create\s+or\s+replace\s+function\s+public\.has_accepted_media_terms\(\)[\s\S]*?\bsecurity\s+definer\b[\s\S]*?\bset\s+search_path\s*=\s*''/i)
    expect(executableSql).toMatch(/create\s+or\s+replace\s+function\s+public\.accept_media_terms\(\)[\s\S]*?\bsecurity\s+definer\b[\s\S]*?\bset\s+search_path\s*=\s*''/i)
    expect(executableSql).toContain("auth.jwt() ->> 'is_anonymous'")
    expect(executableSql).toContain('on conflict (user_id) do nothing')
    expect(executableSql).toContain('grant execute on function public.has_accepted_media_terms() to authenticated')
    expect(executableSql).toContain('grant execute on function public.accept_media_terms() to authenticated')
    expect(executableSql).not.toMatch(/\bgrant\s+(select|insert)\b[\s\S]*?\bon\s+public\.discussion_media_terms\b/i)
  })

  it('runs current-user RPCs as invoker with narrow authenticated column grants', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615193000_rpc_invoker_current_user_grants.sql'),
      'utf8',
    )
    const executableSql = stripSqlLineComments(migration)

    expect(executableSql).toContain('revoke select on public.note_tries from anon, authenticated')
    expect(selectGrantColumns(migration, 'note_tries', 'authenticated')).toEqual(['note_id', 'user_id'])
    expect(executableSql).not.toMatch(/\bgrant\s+select\s+on\s+public\.note_tries\b/i)

    expect(executableSql).toContain('revoke select on public.note_helpful from anon, authenticated')
    expect(selectGrantColumns(migration, 'note_helpful', 'authenticated')).toEqual(['note_id', 'user_id'])
    expect(executableSql).not.toMatch(/\bgrant\s+select\s+on\s+public\.note_helpful\b/i)

    expect(executableSql).toContain('revoke select, insert on public.discussion_media_terms from anon, authenticated')
    expect(selectGrantColumns(migration, 'discussion_media_terms', 'authenticated')).toEqual(['user_id'])
    expect(insertGrantColumns(migration, 'discussion_media_terms')).toEqual(['user_id'])
    expect(executableSql).not.toMatch(/\bto\s+anon\b/i)

    expect(executableSql).toMatch(/create\s+or\s+replace\s+function\s+public\.has_accepted_media_terms\(\)[\s\S]*?\bsecurity\s+invoker\b[\s\S]*?\bset\s+search_path\s*=\s*''/i)
    expect(executableSql).toMatch(/create\s+or\s+replace\s+function\s+public\.accept_media_terms\(\)[\s\S]*?\bsecurity\s+invoker\b[\s\S]*?\bset\s+search_path\s*=\s*''/i)
    expect(executableSql).toMatch(/create\s+or\s+replace\s+function\s+public\.viewer_note_engagement\(\)[\s\S]*?\bsecurity\s+invoker\b[\s\S]*?\bset\s+search_path\s*=\s*''/i)
    expect(executableSql).toContain('grant execute on function public.has_accepted_media_terms() to authenticated')
    expect(executableSql).toContain('grant execute on function public.accept_media_terms() to authenticated')
    expect(executableSql).toContain('grant execute on function public.viewer_note_engagement() to authenticated')
  })

  it('keeps block-list reads limited to the target user', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615035000_blocked_users_read_column_grant.sql'),
      'utf8',
    )

    expect(migration).toContain('revoke select on public.blocked_users from anon, authenticated')
    expect(selectGrantColumns(migration, 'blocked_users', 'authenticated')).toEqual(['blocked_id'])
    expect(selectGrantColumns(migration, 'blocked_users', 'authenticated')).not.toEqual(expect.arrayContaining([
      'blocker_id',
      'created_at',
    ]))
  })

  it('keeps block-list reads closed to direct clients', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615105500_blocked_users_read_closed.sql'),
      'utf8',
    )
    const executableSql = stripSqlLineComments(migration)

    expect(executableSql).toContain('revoke select on public.blocked_users from anon, authenticated')
    expect(executableSql).toContain('revoke select (blocked_id) on public.blocked_users from anon, authenticated')
    expect(executableSql).not.toMatch(/\bgrant\s+select\b[\s\S]*?\bon\s+public\.blocked_users\b/i)
  })

  it('routes native blocking through authenticated security-definer RPCs', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260622213000_block_user_rpcs.sql'),
      'utf8',
    )
    const executableSql = stripSqlLineComments(migration)

    for (const fn of ['block_user', 'unblock_user']) {
      expect(executableSql).toMatch(
        new RegExp(`create\\s+or\\s+replace\\s+function\\s+public\\.${fn}\\(target_user\\s+uuid\\)[\\s\\S]*?security\\s+definer[\\s\\S]*?set\\s+search_path\\s*=\\s*''`, 'i'),
      )
      expect(executableSql).toContain(`revoke all on function public.${fn}(uuid) from public`)
      expect(executableSql).toContain(`grant execute on function public.${fn}(uuid) to authenticated`)
    }

    expect(executableSql).toMatch(/create\s+or\s+replace\s+function\s+public\.my_blocked_users\(\)[\s\S]*?security\s+definer[\s\S]*?set\s+search_path\s*=\s*''/i)
    expect(executableSql).toContain('grant execute on function public.my_blocked_users() to authenticated')
    expect(executableSql).toContain('viewer uuid := (select auth.uid())')
    expect(executableSql).toContain('if viewer = target_user then')
    expect(executableSql).toContain('on conflict (blocker_id, blocked_id) do nothing')
    expect(executableSql).not.toMatch(/\bgrant\s+(select|insert|delete)\b[\s\S]*?\bon\s+public\.blocked_users\b/i)
  })

  it('keeps unused client deletes closed to normal roles', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615053500_close_unused_delete_grants.sql'),
      'utf8',
    )
    const policyCleanup = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615071000_drop_unused_delete_policies.sql'),
      'utf8',
    )

    expect(migration).toContain('revoke delete on public.field_notes from anon, authenticated')
    expect(migration).toContain('revoke delete on public.blocked_users from anon, authenticated')
    expect(migration).not.toMatch(/\bgrant\s+delete\s+on\s+public\.(field_notes|blocked_users)\b/i)
    expect(policyCleanup).toContain('drop policy if exists field_notes_delete_own on public.field_notes')
    expect(policyCleanup).toContain('drop policy if exists blocked_users_delete_own on public.blocked_users')
    expect(policyCleanup).not.toMatch(/\bcreate\s+policy\s+(field_notes_delete_own|blocked_users_delete_own)\b/i)
  })

  it('keeps reaction deletes limited to signed-in contributors', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615055632_reaction_deletes_authenticated_only.sql'),
      'utf8',
    )

    expect(migration).toContain('revoke delete on public.note_tries from anon')
    expect(migration).toContain('revoke delete on public.note_helpful from anon')
    expect(migration).toContain('grant delete on public.note_tries to authenticated')
    expect(migration).toContain('grant delete on public.note_helpful to authenticated')
    expect(migration).not.toMatch(/\bgrant\s+delete\s+on\s+public\.note_(?:tries|helpful)\s+to\s+anon\b/i)
  })

  it('keeps discussion media storage mutations signed-in only', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615063056_storage_mutations_authenticated_only.sql'),
      'utf8',
    )

    expect(migration).toMatch(
      /drop\s+policy\s+if\s+exists\s+discussion_media_object_insert\s+on\s+storage\.objects/i,
    )
    expect(migration).toMatch(
      /create\s+policy\s+discussion_media_object_insert[\s\S]*?\bfor\s+insert\s+to\s+authenticated\b[\s\S]*?\bwith\s+check\b/i,
    )
    expect(migration).toMatch(
      /drop\s+policy\s+if\s+exists\s+discussion_media_object_delete\s+on\s+storage\.objects/i,
    )
    expect(migration).toMatch(
      /create\s+policy\s+discussion_media_object_delete[\s\S]*?\bfor\s+delete\s+to\s+authenticated\b[\s\S]*?\busing\b/i,
    )
    expect(migration).not.toMatch(/\bto\s+authenticated\s*,\s*anon\b/i)
    expect(migration).not.toMatch(/\bto\s+anon\b/i)
  })

  it('keeps discussion media storage mutations off anonymous sessions', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615095000_storage_media_permanent_users.sql'),
      'utf8',
    )

    expect(migration).toMatch(
      /create\s+policy\s+discussion_media_object_insert[\s\S]*?\bfor\s+insert\s+to\s+authenticated\b[\s\S]*?\(select\s+auth\.jwt\(\)\)\s*->>\s*'is_anonymous'[\s\S]*?\bis\s+false/i,
    )
    expect(migration).toMatch(
      /create\s+policy\s+discussion_media_object_delete[\s\S]*?\bfor\s+delete\s+to\s+authenticated\b[\s\S]*?\(select\s+auth\.jwt\(\)\)\s*->>\s*'is_anonymous'[\s\S]*?\bis\s+false/i,
    )
    expect(migration).not.toMatch(/\bto\s+authenticated\s*,\s*anon\b/i)
    expect(migration).not.toMatch(/\bto\s+anon\b/i)
  })

  it('keeps dormant direct-message policies removed', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615074000_drop_dormant_dm_policies.sql'),
      'utf8',
    )

    const dormantTables = ['threads', 'thread_participants', 'messages']
    const dormantPolicies = [
      'threads_delete_creator',
      'threads_insert_own',
      'threads_select_participant',
      'threads_update_creator',
      'participants_delete_thread_member',
      'participants_insert_thread_member',
      'participants_select_thread_member',
      'messages_delete_sender',
      'messages_insert_sender_member',
      'messages_select_thread_member',
      'messages_update_sender',
    ]

    for (const table of dormantTables) {
      expect(migration).toContain(`to_regclass('public.${table}')`)
    }

    for (const policy of dormantPolicies) {
      expect(migration).toMatch(new RegExp(`drop\\s+policy\\s+if\\s+exists\\s+${policy}\\b`, 'i'))
    }

    const executableSql = stripSqlLineComments(migration)

    expect(executableSql).not.toMatch(/\bcreate\s+policy\b/i)
    expect(executableSql).not.toMatch(/\bgrant\b/i)
  })

  it('keeps dormant direct-message tables explicitly closed without client-role policies', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615114500_dormant_dm_internal_policy_marker.sql'),
      'utf8',
    )

    const dormantPolicies = [
      ['threads', 'dormant_threads_client_deny', 'dormant_threads_internal_marker'],
      [
        'thread_participants',
        'dormant_thread_participants_client_deny',
        'dormant_thread_participants_internal_marker',
      ],
      ['messages', 'dormant_messages_client_deny', 'dormant_messages_internal_marker'],
    ]

    for (const [table, oldPolicy, markerPolicy] of dormantPolicies) {
      expect(migration).toContain(`to_regclass('public.${table}')`)
      expect(migration).toMatch(new RegExp(`drop\\s+policy\\s+if\\s+exists\\s+${oldPolicy}\\b`, 'i'))
      expect(migration).toMatch(new RegExp(`drop\\s+policy\\s+if\\s+exists\\s+${markerPolicy}\\b`, 'i'))
      expect(migration).toMatch(
        new RegExp(
          `create\\s+policy\\s+${markerPolicy}\\s+on\\s+public\\.${table}[\\s\\S]*?as\\s+restrictive[\\s\\S]*?for\\s+all\\s+to\\s+service_role[\\s\\S]*?using\\s*\\(false\\)[\\s\\S]*?with\\s+check\\s*\\(false\\)`,
          'i',
        ),
      )
    }

    const executableSql = stripSqlLineComments(migration)

    expect(executableSql).not.toMatch(/\bto\s+anon\b/i)
    expect(executableSql).not.toMatch(/\bto\s+authenticated\b/i)
    expect(executableSql).not.toMatch(/\bgrant\b/i)
  })

  it('keeps consensus view reads limited to aggregate columns', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260615042000_note_consensus_read_column_grant.sql'),
      'utf8',
    )

    expect(migration).toContain('revoke select on public.note_consensus from anon, authenticated')
    expect(selectGrantColumns(migration, 'note_consensus')).toEqual([
      'note_id',
      'pitch_slug',
      'tried_count',
      'reported_count',
      'worked_count',
      'mixed_count',
      'no_change_count',
      'worse_count',
      'consensus',
    ])
    expect(migration).not.toMatch(/\bgrant\s+select\s+on\s+public\.note_consensus\b/i)
    expect(selectGrantColumns(migration, 'note_consensus')).not.toEqual(expect.arrayContaining([
      'author_id',
      'is_hidden',
      'report_count',
      'updated_at',
    ]))
  })
})
