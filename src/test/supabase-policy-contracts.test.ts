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
})
