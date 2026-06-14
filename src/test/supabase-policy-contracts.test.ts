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
})
