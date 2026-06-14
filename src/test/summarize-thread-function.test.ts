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
    expect(source).toContain('"Cache-Control": "no-store"')
    expect(source).toContain('"Pragma": "no-cache"')
    expect(source).toContain('"X-Content-Type-Options": "nosniff"')
    expect(source).toContain('"Referrer-Policy": "no-referrer"')
    expect(source).toMatch(/const jsonHeaders = \{\s+\.\.\.corsHeaders,/)
  })

  it('advertises allowed methods on preflight and unsupported methods', () => {
    expect(source).toContain('const allowedMethods = "POST, OPTIONS"')
    expect(source).toContain('"Access-Control-Allow-Methods": allowedMethods')
    expect(source).toContain('"Allow": allowedMethods')
    expect(source).toContain('headers: { ...corsHeaders, ...allowHeaders }')
    expect(source).toContain('return json(405, { error: "method_not_allowed" }, allowHeaders)')
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
    expect(source).toContain('summarize-thread OpenAI request crashed')
    expect(source).toContain('summarize-thread OpenAI response was empty')
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
    expect(source.indexOf('const bodyResult = await readBody(req)')).toBeLessThan(
      source.indexOf('const config = runtimeConfig()'),
    )
    expect(source.indexOf('if (bodyResult.tooLarge)')).toBeLessThan(
      source.indexOf('const body = bodyResult.body'),
    )
    expect(source.indexOf('if (requestBodyTooLarge(req))')).toBeLessThan(
      source.indexOf('const bodyResult = await readBody(req)'),
    )
    expect(source.indexOf('invalid_thread_id')).toBeLessThan(source.indexOf('const config = runtimeConfig()'))
    expect(source).toContain('return json(500, { error: "server_not_configured" })')
  })

  it('rejects oversized summary request bodies before JSON parsing', () => {
    expect(source).toContain('const MAX_BODY_BYTES = 4096')
    expect(source).toContain('function requestBodyTooLarge(req: Request): boolean')
    expect(source).toContain('req.headers.get("Content-Length")')
    expect(source).toContain('length > MAX_BODY_BYTES')
    expect(source).toContain('return json(413, { error: "request_too_large" })')
  })

  it('bounds streamed summary request bodies before decoding JSON', () => {
    expect(source).toContain('type BodyReadResult')
    expect(source).toContain('invalidJson: boolean')
    expect(source).toContain('req.body.getReader()')
    expect(source).toContain('receivedBytes += value.byteLength')
    expect(source).toContain('receivedBytes > MAX_BODY_BYTES')
    expect(source).toContain('await reader.cancel()')
    expect(source).toContain('new TextDecoder().decode(bytes)')
    expect(source).not.toContain('await req.json()')
  })

  it('returns malformed JSON as a distinct cheap request error', () => {
    expect(source).toContain('invalidJson: true')
    expect(source).toContain('return json(400, { error: "invalid_json" })')
    expect(source.indexOf('if (bodyResult.invalidJson)')).toBeLessThan(
      source.indexOf('const threadIdResult = threadIdFromBody(body)'),
    )
    expect(source.indexOf('if (bodyResult.invalidJson)')).toBeLessThan(
      source.indexOf('const config = runtimeConfig()'),
    )
  })

  it('trims captured Bearer tokens before auth lookups', () => {
    const bearerParserLine = source.split('\n').find((line) => line.includes('header.match'))
    expect(bearerParserLine).toContain('/^Bearer\\s+(.+)$/i')
    expect(source).toContain('const token = match?.[1]?.trim()')
    expect(source).toContain('return token ? token : null')
  })

  it('validates thread ids before Supabase lookups', () => {
    expect(source).toContain('const UUID_PATTERN =')
    expect(source).toContain('function threadIdFromBody(')
    expect(source).toContain('return { error: "thread_id_required" }')
    expect(source).toContain('return { error: "invalid_thread_id" }')
    expect(source.indexOf('const threadIdResult = threadIdFromBody(body)')).toBeLessThan(
      source.indexOf('admin.auth.getUser(token)'),
    )
    expect(source.indexOf('const { threadId } = threadIdResult')).toBeLessThan(
      source.indexOf('.from("thread_participants")'),
    )
  })

  it('caps the transcript before sending it to the model', () => {
    expect(source).toContain('MAX_MESSAGES = 200')
    expect(source).toContain('MAX_TRANSCRIPT_CHARS = 12000')
    expect(source).toContain('transcript.slice(-MAX_TRANSCRIPT_CHARS)')
  })

  it('does not send raw sender ids to the model transcript', () => {
    expect(source).toContain('function senderLabel(')
    expect(source).toContain('const senderLabels = new Map<string, string>()')
    expect(source).toContain('`Participant ${labels.size + 1}`')
    expect(source).toContain('senderLabel(message.sender_id, senderLabels)')
    expect(source).not.toContain('message.sender_id ?? "unknown-sender"')
  })

  it('keeps OpenAI transport and empty response failures in the JSON envelope', () => {
    expect(source).toContain('async function requestSummary(')
    expect(source).toContain('async function readCompletion(')
    expect(source).toContain('function completionMessageContent(')
    expect(source).toContain('catch (error)')
    expect(source).toMatch(/if \(!openaiResp\) \{\s+return json\(502, \{ error: "summary_unavailable" \}\);\s+\}/)
    expect(source).toContain('summarize-thread OpenAI response JSON parse failed')
    expect(source).toContain('const completion = await readCompletion(openaiResp)')
    expect(source).toContain('parseSummary(completionMessageContent(completion))')
    expect(source).toMatch(/if \(!result\) \{\s+console\.error\("summarize-thread OpenAI response was empty or malformed"\);\s+return json\(502, \{ error: "summary_unavailable" \}\);\s+\}/)
  })
})
