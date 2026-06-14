import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(resolve(process.cwd(), 'supabase/functions/summarize-thread/index.ts'), 'utf8')

describe('summarize-thread Edge Function source contract', () => {
  it('is checked in as a JWT-protected browser-callable function', () => {
    const config = readFileSync(resolve(process.cwd(), 'supabase/config.toml'), 'utf8')

    expect(config).toContain('[functions.summarize-thread]')
    expect(config).toContain('verify_jwt = true')
    expect(source).toContain('"OPTIONS"')
    expect(source).toContain('"Access-Control-Allow-Origin"')
    expect(source).toContain('"Access-Control-Allow-Headers"')
    expect(source).toContain('"Access-Control-Allow-Methods"')
    expect(source).toMatch(/const jsonHeaders = \{\s+\.\.\.corsHeaders,/)
  })

  it('keeps a provenance meta envelope on success and error replies', () => {
    expect(source).toContain('source: "pitch-atlas-summarize-thread"')
    expect(source).toContain('fetched_at: new Date().toISOString()')
    expect(source).toContain('timezone: "America/Chicago"')
    expect(source).toMatch(/JSON\.stringify\(\{ \.\.\.body, meta: body\.meta \?\? meta\(\) \}\)/)
  })

  it('does not return raw database or OpenAI error text to the browser', () => {
    expect(source).toContain('participant_lookup_failed')
    expect(source).toContain('messages_lookup_failed')
    expect(source).toContain('summary_unavailable')
    expect(source).not.toContain('participantError.message')
    expect(source).not.toContain('messagesError.message')
    expect(source).not.toContain('errText')
  })

  it('answers cheap request guards before runtime secret checks', () => {
    expect(source).not.toContain('throw new Error("OPENAI_API_KEY is required")')
    expect(source).not.toContain('const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")')
    expect(source.indexOf('if (req.method === "OPTIONS")')).toBeLessThan(
      source.indexOf('const config = runtimeConfig()'),
    )
    expect(source.indexOf('if (!token)')).toBeLessThan(source.indexOf('const config = runtimeConfig()'))
    expect(source).toContain('return json(500, { error: "server_not_configured" })')
  })

  it('caps the transcript before sending it to the model', () => {
    expect(source).toContain('MAX_MESSAGES = 200')
    expect(source).toContain('MAX_TRANSCRIPT_CHARS = 12000')
    expect(source).toContain('transcript.slice(-MAX_TRANSCRIPT_CHARS)')
  })
})
