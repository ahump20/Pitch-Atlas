import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { uploadMedia } from './discussion'

/*
  Characterization tests for the upload EXIF/GPS scrub.

  `scrubImageMetadata()` in ./discussion is the privacy boundary: still images are
  re-encoded through a canvas so camera/GPS EXIF is dropped before any bytes leave
  the device. It shipped in #133 with zero tests, so one canvas-behaviour change or
  refactor away from silently uploading the original metadata-laden File. The core
  assertion below is on the BYTES handed to storage — the uploaded payload must be
  the re-encoded blob, never the original `File` — plus the documented graceful
  fallbacks (undecodable image, `toBlob` null) and the GIF pass-through.

  jsdom implements none of the decode/canvas pipeline, so we stub Image / canvas /
  URL per the deferred plan. (setup.ts globally stubs getContext to return null; we
  override it per test for the happy path.)
*/

const mocks = vi.hoisted(() => ({
  ensureSession: vi.fn(),
  getSessionUserId: vi.fn(),
  from: vi.fn(),
  storageFrom: vi.fn(),
  rpc: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  insert: vi.fn(),
}))

vi.mock('./community', () => ({
  ensureSession: mocks.ensureSession,
  getSessionUserId: mocks.getSessionUserId,
}))

vi.mock('./supabase', () => ({
  COMMUNITY_ENABLED: true,
  supabase: {
    from: mocks.from,
    rpc: mocks.rpc,
    storage: { from: mocks.storageFrom },
  },
}))

function fileFrom(bytes: number[], name: string, type: string): File {
  return new File([new Uint8Array(bytes)], name, { type })
}

// Leading bytes sniffMediaType reads (first 16). JPEG is scrubbed; GIF is not.
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]
const GIF = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00]

// --- Per-test switches for the browser stubs jsdom lacks. ---
type ImageMode = 'load' | 'error' | 'zero'
let imageMode: ImageMode
let toBlobResult: Blob | null
let getContextResult: 'ctx' | null
let drawImageSpy: ReturnType<typeof vi.fn>
let toBlobSpy: ReturnType<typeof vi.fn>
let getContextSpy: ReturnType<typeof vi.fn>
let revokeSpy: ReturnType<typeof vi.fn>
let createSpy: ReturnType<typeof vi.fn>

let originalImage: typeof globalThis.Image
let originalGetContext: typeof HTMLCanvasElement.prototype.getContext
let originalToBlob: typeof HTMLCanvasElement.prototype.toBlob
let originalCreate: typeof URL.createObjectURL
let originalRevoke: typeof URL.revokeObjectURL

beforeEach(() => {
  vi.clearAllMocks()
  mocks.ensureSession.mockResolvedValue('user-1')
  mocks.upload.mockResolvedValue({ error: null })
  mocks.remove.mockResolvedValue({ error: null })
  mocks.insert.mockResolvedValue({ error: null })
  mocks.storageFrom.mockReturnValue({ upload: mocks.upload, remove: mocks.remove })
  mocks.from.mockImplementation(() => ({ insert: mocks.insert }))

  imageMode = 'load'
  // Sentinel re-encoded blob: a KNOWN size that differs from every test File so the
  // "uploaded the scrubbed blob, not the File" assertion is unambiguous.
  toBlobResult = new Blob([new Uint8Array(999)])
  getContextResult = 'ctx'
  drawImageSpy = vi.fn()
  toBlobSpy = vi.fn((cb: BlobCallback) => cb(toBlobResult))
  getContextSpy = vi.fn(() => (getContextResult === 'ctx' ? { drawImage: drawImageSpy } : null))
  revokeSpy = vi.fn()
  createSpy = vi.fn(() => 'blob:stub')

  originalImage = globalThis.Image
  originalGetContext = HTMLCanvasElement.prototype.getContext
  originalToBlob = HTMLCanvasElement.prototype.toBlob
  originalCreate = URL.createObjectURL
  originalRevoke = URL.revokeObjectURL

  URL.createObjectURL = createSpy as unknown as typeof URL.createObjectURL
  URL.revokeObjectURL = revokeSpy as unknown as typeof URL.revokeObjectURL

  // `new Image()`; setting `.src` resolves onload/onerror on a microtask.
  class StubImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    naturalWidth = 100
    naturalHeight = 80
    set src(_value: string) {
      queueMicrotask(() => {
        if (imageMode === 'error') {
          this.onerror?.()
          return
        }
        if (imageMode === 'zero') {
          this.naturalWidth = 0
          this.naturalHeight = 0
        }
        this.onload?.()
      })
    }
  }
  globalThis.Image = StubImage as unknown as typeof globalThis.Image

  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: getContextSpy,
  })
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    configurable: true,
    value: toBlobSpy,
  })
})

afterEach(() => {
  globalThis.Image = originalImage
  URL.createObjectURL = originalCreate
  URL.revokeObjectURL = originalRevoke
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: originalGetContext,
  })
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    configurable: true,
    value: originalToBlob,
  })
})

describe('uploadMedia EXIF/GPS scrub', () => {
  it('uploads the re-encoded blob, not the original File (JPEG happy path)', async () => {
    const file = fileFrom(JPEG, 'photo.jpg', 'image/jpeg')

    await uploadMedia('post-1', 'pitch:four-seam', file)

    // The core security assertion: the bytes handed to storage are the scrubbed
    // sentinel blob, never the metadata-laden original File.
    const [, payload] = mocks.upload.mock.calls[0]
    expect(payload).toBe(toBlobResult)
    expect(payload).not.toBe(file)
    expect((payload as Blob).size).toBe(999)
    expect(drawImageSpy).toHaveBeenCalled()
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({ byte_size: 999, mime_type: 'image/jpeg', kind: 'image' }),
    )
    // The object URL opened for the decode is revoked (no leak).
    expect(revokeSpy).toHaveBeenCalled()
  })

  it('falls back to the original File when the image cannot be decoded', async () => {
    imageMode = 'error'
    const file = fileFrom(JPEG, 'photo.jpg', 'image/jpeg')

    await uploadMedia('post-1', 'pitch:four-seam', file)

    const [, payload] = mocks.upload.mock.calls[0]
    expect(payload).toBe(file) // scrub returned null → original bytes, upload still succeeds
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ byte_size: file.size }))
    expect(revokeSpy).toHaveBeenCalled()
  })

  it('falls back to the original File when canvas encoding yields no blob', async () => {
    toBlobResult = null
    toBlobSpy.mockImplementation((cb: BlobCallback) => cb(null))
    const file = fileFrom(JPEG, 'photo.jpg', 'image/jpeg')

    await uploadMedia('post-1', 'pitch:four-seam', file)

    const [, payload] = mocks.upload.mock.calls[0]
    expect(payload).toBe(file)
    expect(drawImageSpy).toHaveBeenCalled() // it tried to scrub, then fell back
    expect(revokeSpy).toHaveBeenCalled()
  })

  it('skips the canvas scrub entirely for GIF and uploads the original', async () => {
    const file = fileFrom(GIF, 'anim.gif', 'image/gif')

    await uploadMedia('post-1', 'pitch:four-seam', file)

    const [, payload] = mocks.upload.mock.calls[0]
    expect(payload).toBe(file)
    expect(toBlobSpy).not.toHaveBeenCalled()
    expect(drawImageSpy).not.toHaveBeenCalled()
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({ mime_type: 'image/gif', kind: 'image' }),
    )
  })
})
