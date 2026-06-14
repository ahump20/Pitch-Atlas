import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationsDir = resolve(process.cwd(), 'supabase/migrations')

function stripSqlLineComments(sql: string) {
  return sql
    .split('\n')
    .map((line) => line.replace(/--.*$/, ''))
    .join('\n')
}

function stripInitplanAuthUid(sql: string) {
  return sql.replace(/\(\s*select\s+auth\.uid\(\)\s*\)/gi, '')
}

function hasBareAuthUid(sql: string) {
  return /\bauth\.uid\(\)/i.test(stripInitplanAuthUid(stripSqlLineComments(sql)))
}

describe('Supabase RLS migration contracts', () => {
  it('keeps storage.objects auth.uid policies covered by a later initplan migration', () => {
    const files = readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort()

    const storagePolicyBareAuthIndexes = files
      .map((file, index) => {
        const sql = readFileSync(resolve(migrationsDir, file), 'utf8')
        const touchesStoragePolicies = /\bon\s+storage\.objects\b/i.test(sql)
        return touchesStoragePolicies && hasBareAuthUid(sql) ? index : -1
      })
      .filter((index) => index >= 0)

    const storageInitplanIndex = files.indexOf('20260614090000_storage_rls_initplan_auth_calls.sql')

    expect(storageInitplanIndex).toBeGreaterThanOrEqual(0)
    expect(storageInitplanIndex).toBeGreaterThanOrEqual(Math.max(...storagePolicyBareAuthIndexes))
  })
})
