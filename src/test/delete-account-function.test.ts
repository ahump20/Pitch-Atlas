import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(resolve(process.cwd(), 'supabase/functions/delete-account/index.ts'), 'utf8')

describe('delete-account Edge Function source contract', () => {
  it('answers browser preflight and returns CORS headers with JSON replies', () => {
    expect(source).toContain('"OPTIONS"')
    expect(source).toContain('"Access-Control-Allow-Origin"')
    expect(source).toContain('"Access-Control-Allow-Headers"')
    expect(source).toContain('"Access-Control-Allow-Methods"')
    expect(source).toContain('"Cache-Control": "no-store"')
    expect(source).toContain('"Pragma": "no-cache"')
    expect(source).toContain('"X-Content-Type-Options": "nosniff"')
    expect(source).toContain('"Referrer-Policy": "no-referrer"')
    expect(source).toMatch(/const jsonHeaders = \{\s+\.\.\.corsHeaders,/)
  })

  it('keeps a provenance meta envelope on success and error replies', () => {
    expect(source).toContain('source: "pitch-atlas-delete-account"')
    expect(source).toContain('fetched_at: new Date().toISOString()')
    expect(source).toContain('timezone: "America/Chicago"')
    expect(source).toMatch(/JSON\.stringify\(\{ \.\.\.body, meta: body\.meta \?\? meta\(\) \}\)/)
  })

  it('does not return raw storage, database, or auth error text to the browser', () => {
    expect(source).toContain('class CleanupFailure extends Error')
    expect(source).toContain('console.error(`delete-account ${code}`, detail)')
    expect(source).toContain('error: "delete_account_failed"')
    expect(source).not.toContain('user_id?: string')
    expect(source).not.toContain('user_id: userId')
    expect(source).not.toContain('removed_storage_objects')
    expect(source).not.toContain('deleted_auth_user')
    expect(source).not.toContain('error.message')
    expect(source).not.toContain('removeError.message')
    expect(source).not.toContain('blockError.message')
    expect(source).not.toContain('deleteUserError.message')
  })

  it('parses standard Bearer authorization headers', () => {
    const bearerParserLine = source.split('\n').find((line) => line.includes('header.match'))
    expect(bearerParserLine).toContain('/^Bearer\\s+(.+)$/i')
    expect(bearerParserLine).not.toContain('/^Bearer\\\\s+(.+)$/i')
  })

  it('answers missing-token requests before runtime secret checks', () => {
    expect(source.indexOf('if (!token)')).toBeLessThan(
      source.indexOf('Deno.env.get("SUPABASE_URL")'),
    )
    expect(source.indexOf('missing_bearer_token')).toBeLessThan(
      source.indexOf('server_not_configured'),
    )
  })

  it('drains media storage beyond the first page and removes objects in batches', () => {
    expect(source).toContain('offset += STORAGE_LIST_PAGE_SIZE')
    expect(source).toContain('STORAGE_REMOVE_BATCH_SIZE')
    expect(source).toContain('paths.slice(i, i + STORAGE_REMOVE_BATCH_SIZE)')
  })

  it('cleans private thread rows for the deleted user before auth removal', () => {
    expect(source).toContain('OPTIONAL_DELETE_MISSING_CODES')
    expect(source).toContain('"42P01"')
    expect(source).toContain('"42703"')
    expect(source).toContain('deleteIfTableExists(admin, "messages", "sender_id", userId)')
    expect(source).toContain('deleteIfTableExists(admin, "thread_participants", "user_id", userId)')
    expect(source).toContain('deleteIfTableExists(admin, "threads", "created_by", userId)')

    const messagesCleanupIndex = source.indexOf('deleteIfTableExists(admin, "messages", "sender_id", userId)')
    const authDeleteIndex = source.indexOf('admin.auth.admin.deleteUser(userId)')
    expect(messagesCleanupIndex).toBeGreaterThan(-1)
    expect(authDeleteIndex).toBeGreaterThan(messagesCleanupIndex)
  })
})
