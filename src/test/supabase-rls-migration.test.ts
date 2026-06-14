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

function stripSqlComments(sql: string) {
  return stripSqlLineComments(sql.replace(/\/\*[\s\S]*?\*\//g, ''))
}

function stripInitplanAuthCalls(sql: string) {
  return sql.replace(
    /\(\s*select\s+auth\.(?:uid|jwt)\(\)(?:\s+as\s+\w+)?\s*\)/gi,
    '',
  )
}

function hasBareAuthCall(sql: string) {
  const normalizedSql = stripInitplanAuthCalls(stripSqlComments(sql))
  return /\bauth\.(?:uid|jwt)\(\)/i.test(normalizedSql)
}

function hasBareAuthUid(sql: string) {
  const normalizedSql = stripInitplanAuthCalls(stripSqlComments(sql))
  return /\bauth\.uid\(\)/i.test(normalizedSql)
}

function policyStatements(sql: string) {
  return (
    stripSqlComments(sql).match(/\b(?:create|alter)\s+policy\b[\s\S]*?;/gi) ?? []
  )
}

function securityDefinerFunctionStatements(sql: string) {
  return (
    stripSqlComments(sql).match(
      /\bcreate\s+(?:or\s+replace\s+)?function\b[\s\S]*?\bas\s+\$[A-Za-z0-9_]*\$/gi,
    ) ?? []
  ).filter((statement) => /\bsecurity\s+definer\b/i.test(statement))
}

function migrationFiles() {
  return readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()
}

describe('Supabase RLS migration contracts', () => {
  it('keeps storage.objects auth.uid policies covered by a later initplan migration', () => {
    const files = migrationFiles()

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

  it('keeps new policy migrations on initplan-wrapped auth calls', () => {
    const files = migrationFiles()
    const initplanIndex = files.indexOf('20260614042849_optimize_rls_initplan_wrap_auth_calls.sql')

    expect(initplanIndex).toBeGreaterThanOrEqual(0)

    const violations = files.slice(initplanIndex + 1).flatMap((file) => {
      const sql = readFileSync(resolve(migrationsDir, file), 'utf8')

      return policyStatements(sql)
        .filter(hasBareAuthCall)
        .map((_statement, statementIndex) => {
          const label = `policy statement ${statementIndex + 1}`
          return `${file}: ${label} uses auth.uid()/auth.jwt() without (select ...)`
        })
    })

    expect(violations).toEqual([])
  })

  it('pins search_path on security definer functions', () => {
    const violations = migrationFiles().flatMap((file) => {
      const sql = readFileSync(resolve(migrationsDir, file), 'utf8')

      return securityDefinerFunctionStatements(sql)
        .filter((statement) => !/\bset\s+search_path\s+(?:=|to)\s+/i.test(statement))
        .map((_statement, statementIndex) => {
          const label = `security definer function ${statementIndex + 1}`
          return `${file}: ${label} does not pin search_path`
        })
    })

    expect(violations).toEqual([])
  })
})
