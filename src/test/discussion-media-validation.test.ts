import { Blob } from 'node:buffer'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMediaValidationHandler } from '../../supabase/functions/validate-discussion-media/handler.ts'
import { MEDIA_BYTE_CAPS } from '../../supabase/functions/_shared/media-type.ts'

const owner = '11111111-1111-4111-8111-111111111111'
const path = owner + '/clip.webm'
const webm = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 1, 2, 3, 4])
const deps = {
  getUser: vi.fn(), captureObject: vi.fn(), download: vi.fn(), record: vi.fn(),
}
const handler = createMediaValidationHandler(deps)
function request(body: unknown): Request {
  return new Request('https://project.supabase.co/functions/v1/validate-discussion-media', {
    method: 'POST',
    headers: { Authorization: 'Bearer session', 'Content-Type': 'application/json',
      Origin: 'https://pitch-atlas.com' },
    body: JSON.stringify(body),
  })
}
beforeEach(() => {
  vi.resetAllMocks()
  deps.getUser.mockResolvedValue({ id: owner, isAnonymous: false })
  deps.captureObject.mockResolvedValue('object-before-download')
  deps.download.mockResolvedValue(new Blob([webm], { type: 'image/jpeg' }))
  deps.record.mockResolvedValue(undefined)
})

describe('trusted discussion-media validation', () => {
  it('records actual bytes and pre-download identity, ignoring caller claims', async () => {
    const result = await handler(request({ storagePath: path, ownerId: 'foreign',
      objectId: 'forged', byteSize: 1, mimeType: 'image/jpeg', kind: 'image' }))
    expect(result.status).toBe(200)
    expect(await result.json()).toEqual({ ok: true, byteSize: 8, mimeType: 'video/webm', kind: 'video' })
    expect(deps.record).toHaveBeenCalledWith({
      ownerId: owner, storagePath: path, objectId: 'object-before-download',
      byteSize: 8, mimeType: 'video/webm', kind: 'video',
    })
    expect(deps.getUser.mock.invocationCallOrder[0]).toBeLessThan(deps.captureObject.mock.invocationCallOrder[0])
    expect(deps.captureObject.mock.invocationCallOrder[0]).toBeLessThan(deps.download.mock.invocationCallOrder[0])
    expect(deps.download.mock.invocationCallOrder[0]).toBeLessThan(deps.record.mock.invocationCallOrder[0])
    expect(result.headers.get('Cache-Control')).toBe('no-store')
  })

  it.each([null, { id: owner, isAnonymous: true }])('rejects an unverified/permanent session: %j', async (user) => {
    deps.getUser.mockResolvedValue(user)
    expect((await handler(request({ storagePath: path }))).status).toBe(401)
    expect(deps.captureObject).not.toHaveBeenCalled()
    expect(deps.download).not.toHaveBeenCalled()
  })

  it.each(['foreign/file.png', owner + '/', owner + '/../foreign/file.png',
    owner + '/./file.png', owner + '//file.png', owner + '/a\\b.png',
    owner + '/' + 'a'.repeat(1024)])('rejects a foreign or ambiguous path: %s', async (storagePath) => {
    expect((await handler(request({ storagePath }))).status).toBe(400)
    expect(deps.download).not.toHaveBeenCalled()
  })

  it('rejects excessive streamed JSON before any privileged operation', async () => {
    expect((await handler(request({ storagePath: path, padding: 'x'.repeat(2048) }))).status).toBe(400)
    expect(deps.captureObject).not.toHaveBeenCalled()
  })

  it.each([
    new Blob(['<svg onload="alert(1)"/>'], { type: 'image/png' }),
    new Blob([new Uint8Array([0x4d, 0x5a])], { type: 'image/png' }),
    new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' }),
    new Blob(),
  ])('rejects unsupported/truncated bytes despite a declared image type', async (blob) => {
    deps.download.mockResolvedValue(blob)
    expect((await handler(request({ storagePath: path }))).status).toBe(400)
    expect(deps.record).not.toHaveBeenCalled()
  })

  it.each([
    { prefix: new Uint8Array([0xff, 0xd8, 0xff]), kind: 'image' as const },
    { prefix: webm, kind: 'video' as const },
  ])('checks the actual $kind size at the cap and cap+1', async ({ prefix, kind }) => {
    const cap = MEDIA_BYTE_CAPS[kind]
    const exact = new Blob([prefix, new Uint8Array(cap - prefix.length)])
    deps.download.mockResolvedValue(exact)
    expect((await handler(request({ storagePath: path }))).status).toBe(200)
    deps.record.mockClear()
    deps.download.mockResolvedValue(new Blob([exact, new Uint8Array(1)]))
    expect((await handler(request({ storagePath: path }))).status).toBe(400)
    expect(deps.record).not.toHaveBeenCalled()
  })

  it('fails closed if object identity changes while validation runs', async () => {
    deps.record.mockRejectedValue(new Error('media_blocked: that upload changed during validation'))
    const result = await handler(request({ storagePath: path }))
    expect(result.status).toBe(400)
    expect(await result.json()).toMatchObject({ ok: false })
  })

  it.each(['avif', 'avis', 'heic', 'heix', 'mif1', 'M4A ', 'xxxx'])(
    'rejects a non-video ftyp major brand despite a declared MP4 MIME: %s', async (brand) => {
      const prefix = new Uint8Array([0, 0, 0, 32, 102, 116, 121, 112,
        ...Array.from(brand).map((char) => char.charCodeAt(0)), 0, 0, 0, 0])
      deps.download.mockResolvedValue(new Blob([prefix], { type: 'video/mp4' }))
      expect((await handler(request({ storagePath: path }))).status).toBe(400)
      expect(deps.record).not.toHaveBeenCalled()
    },
  )

  it.each(['mp42', 'isom', 'qt  '])('retains supported video ftyp brands: %s', async (brand) => {
    const prefix = new Uint8Array([0, 0, 0, 32, 102, 116, 121, 112,
      ...Array.from(brand).map((char) => char.charCodeAt(0)), 0, 0, 0, 0])
    deps.download.mockResolvedValue(new Blob([prefix]))
    expect((await handler(request({ storagePath: path }))).status).toBe(200)
  })

  it('does not download after quota denial or a missing object', async () => {
    deps.captureObject.mockRejectedValueOnce(new Error('rate_limit: slow down'))
    expect((await handler(request({ storagePath: path }))).status).toBe(400)
    deps.captureObject.mockResolvedValueOnce(null)
    expect((await handler(request({ storagePath: path }))).status).toBe(400)
    expect(deps.download).not.toHaveBeenCalled()
  })

  it('hides privileged upstream failures', async () => {
    deps.download.mockRejectedValue(new Error('private backend diagnostic'))
    const result = await handler(request({ storagePath: path }))
    expect(result.status).toBe(502)
    expect(await result.json()).toEqual({ ok: false, error: 'validation_unavailable' })
  })
})
