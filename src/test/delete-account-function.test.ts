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
    expect(source).toMatch(/const jsonHeaders = \{\s+\.\.\.corsHeaders,/)
  })

  it('drains media storage beyond the first page and removes objects in batches', () => {
    expect(source).toContain('offset += STORAGE_LIST_PAGE_SIZE')
    expect(source).toContain('STORAGE_REMOVE_BATCH_SIZE')
    expect(source).toContain('paths.slice(i, i + STORAGE_REMOVE_BATCH_SIZE)')
  })
})
