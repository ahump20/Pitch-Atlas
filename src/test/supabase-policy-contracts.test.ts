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
})
