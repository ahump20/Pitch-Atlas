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

function publicTableNamesCreated(sql: string) {
  return [...stripSqlComments(sql).matchAll(
    /\bcreate\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-zA-Z_][a-zA-Z0-9_]*)\b/gi,
  )].map((match) => match[1].toLowerCase())
}

function publicTablesWithRlsEnabled(sql: string) {
  return [...stripSqlComments(sql).matchAll(
    /\balter\s+table\s+public\.([a-zA-Z_][a-zA-Z0-9_]*)\s+enable\s+row\s+level\s+security\b/gi,
  )].map((match) => match[1].toLowerCase())
}

function securityDefinerFunctionStatements(sql: string) {
  return (
    stripSqlComments(sql).match(
      /\bcreate\s+(?:or\s+replace\s+)?function\b[\s\S]*?\bas\s+\$[A-Za-z0-9_]*\$/gi,
    ) ?? []
  ).filter((statement) => /\bsecurity\s+definer\b/i.test(statement))
}

function publicFunctionSecurityModeEvents(sql: string) {
  return (
    stripSqlComments(sql).match(
      /\bcreate\s+(?:or\s+replace\s+)?function\b[\s\S]*?\bas\s+\$[A-Za-z0-9_]*\$/gi,
    ) ?? []
  ).flatMap((statement) => {
    const match = statement.match(
      /\bcreate\s+(?:or\s+replace\s+)?function\s+public\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/i,
    )

    if (!match) {
      return []
    }

    return [{
      functionName: match[1].toLowerCase(),
      mode: /\bsecurity\s+definer\b/i.test(statement) ? 'definer' : 'invoker',
    }]
  })
}

function executePrivilegeEvents(sql: string) {
  return (
    stripSqlComments(sql).match(
      /\b(?:grant|revoke)\s+execute\s+on\s+function\s+public\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^;]*\)[^;]*;/gi,
    ) ?? []
  ).map((statement) => {
    const action = statement.match(/\b(grant|revoke)\b/i)?.[1]?.toLowerCase()
    const functionName = statement.match(/public\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/i)?.[1]?.toLowerCase()

    return { action, functionName }
  })
}

function migrationFiles() {
  return readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()
}

const clientCallablePublicDefinerFunctions = new Set<string>([
  'block_user',
  'unblock_user',
  'my_blocked_users',
  // These three are deliberately exposed through narrow guards: permanent-account
  // ownership + accepted terms for reservations, and a SHA-256 Vault-secret match
  // for the scheduled cleanup authorization gate.
  'reserve_discussion_media_upload',
  'release_discussion_media_upload',
  'authorize_discussion_media_gc',
])

describe('Supabase RLS migration contracts', () => {
  it('enables RLS on every public table created by migrations', () => {
    const createdTables = new Map<string, string[]>()
    const rlsEnabledTables = new Set<string>()

    for (const file of migrationFiles()) {
      const sql = readFileSync(resolve(migrationsDir, file), 'utf8')

      for (const tableName of publicTableNamesCreated(sql)) {
        createdTables.set(tableName, [...(createdTables.get(tableName) ?? []), file])
      }

      for (const tableName of publicTablesWithRlsEnabled(sql)) {
        rlsEnabledTables.add(tableName)
      }
    }

    const violations = [...createdTables.entries()]
      .filter(([tableName]) => !rlsEnabledTables.has(tableName))
      .map(([tableName, files]) => `public.${tableName} created without RLS enabled (${files.join(', ')})`)

    expect(violations).toEqual([])
  })

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

  it('keeps public security definer functions closed to direct client execute', () => {
    const files = migrationFiles()
    const lastSecurityMode = new Map<string, string>()
    const lastExecuteEvent = new Map<string, string | undefined>()

    for (const file of files) {
      const sql = readFileSync(resolve(migrationsDir, file), 'utf8')

      for (const event of publicFunctionSecurityModeEvents(sql)) {
        lastSecurityMode.set(event.functionName, event.mode)
      }

      for (const event of executePrivilegeEvents(sql)) {
        if (event.functionName) {
          lastExecuteEvent.set(event.functionName, event.action)
        }
      }
    }

    const violations = [...lastSecurityMode.entries()]
      .filter(([_functionName, mode]) => mode === 'definer')
      .map(([functionName]) => functionName)
      .filter((functionName) => !clientCallablePublicDefinerFunctions.has(functionName))
      .filter((functionName) => lastExecuteEvent.get(functionName) !== 'revoke')
      .map((functionName) => `public.${functionName} has no final client execute revoke`)

    expect(violations).toEqual([])
  })

  it('keeps internal SQL helpers closed to direct client execute', () => {
    const internalHelpers = new Set(['note_base_rank'])
    const lastExecuteEvent = new Map<string, string | undefined>()

    for (const file of migrationFiles()) {
      const sql = readFileSync(resolve(migrationsDir, file), 'utf8')

      for (const event of executePrivilegeEvents(sql)) {
        if (event.functionName && internalHelpers.has(event.functionName)) {
          lastExecuteEvent.set(event.functionName, event.action)
        }
      }
    }

    const violations = [...internalHelpers]
      .filter((functionName) => lastExecuteEvent.get(functionName) !== 'revoke')
      .map((functionName) => `public.${functionName} has no final client execute revoke`)

    expect(violations).toEqual([])
  })

  it('keeps the unused Supabase GraphQL API disabled without changing table reads', () => {
    const migration = readFileSync(
      resolve(migrationsDir, '20260615133500_disable_unused_pg_graphql.sql'),
      'utf8',
    )
    const sql = stripSqlComments(migration)

    expect(sql).toMatch(/\bdrop\s+extension\s+if\s+exists\s+pg_graphql\s*;/i)
    expect(sql).not.toMatch(/\brevoke\s+select\s+on\s+public\./i)
    expect(sql).not.toMatch(/\brevoke\s+all\s+on\s+public\./i)
  })
})
