import { describe, it, expect } from 'vitest'
import { friendlyError, sniffMediaKind, sniffMediaType } from './discussion'

/*
  The upload sniff is a security control, not a nicety: it reads the real leading
  bytes so a renamed .exe or an SVG (a script-in-image XSS vector, excluded on
  purpose) is rejected regardless of its filename or its declared type. The DB
  re-checks all of this, but this is the first gate, so it is worth pinning.
*/

function fileFrom(bytes: number[], name: string, type: string): File {
  return new File([new Uint8Array(bytes)], name, { type })
}

describe('sniffMediaKind', () => {
  it('detects a PNG by its magic bytes', async () => {
    expect(await sniffMediaKind(fileFrom([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 'x.png', 'image/png'))).toBe('image')
  })

  it('detects a JPEG', async () => {
    expect(await sniffMediaKind(fileFrom([0xff, 0xd8, 0xff, 0xe0], 'x.jpg', 'image/jpeg'))).toBe('image')
  })

  it('detects a WEBP only when the RIFF container says WEBP', async () => {
    const webp = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]
    expect(await sniffMediaKind(fileFrom(webp, 'x.webp', 'image/webp'))).toBe('image')
    const wav = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45] // RIFF....WAVE
    expect(await sniffMediaKind(fileFrom(wav, 'x.wav', 'audio/wav'))).toBeNull()
  })

  it('detects an mp4 by the ftyp box at offset 4', async () => {
    const mp4 = [0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32]
    expect(await sniffMediaKind(fileFrom(mp4, 'x.mp4', 'video/mp4'))).toBe('video')
  })

  it('derives the storage MIME and extension from bytes instead of the declared type', async () => {
    const webm = [0x1a, 0x45, 0xdf, 0xa3, 0x93, 0x42, 0x82, 0x88]

    await expect(sniffMediaType(fileFrom(webm, 'clip.txt', 'text/plain'))).resolves.toEqual({
      kind: 'video',
      mime: 'video/webm',
      extension: 'webm',
    })
  })

  it('detects QuickTime ftyp by its major brand', async () => {
    const mov = [0, 0, 0, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20]

    await expect(sniffMediaType(fileFrom(mov, 'clip.mov', 'application/octet-stream'))).resolves.toEqual({
      kind: 'video',
      mime: 'video/quicktime',
      extension: 'mov',
    })
  })

  it('rejects a renamed executable even with an image name and type', async () => {
    expect(await sniffMediaKind(fileFrom([0x4d, 0x5a, 0x90, 0x00], 'evil.png', 'image/png'))).toBeNull()
  })

  it('rejects an SVG, the script-in-image vector', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
    const bytes = Array.from(svg).map((c) => c.charCodeAt(0))
    expect(await sniffMediaKind(fileFrom(bytes, 'x.svg', 'image/svg+xml'))).toBeNull()
  })
})

describe('friendlyError', () => {
  it('keeps trigger-tagged copy but hides raw database errors', () => {
    expect(friendlyError({ message: 'rate_limit: slow down' })).toBe('slow down')
    expect(friendlyError({ message: 'content_blocked:' })).toBe('That post contains language we do not allow here.')
    expect(friendlyError({ message: 'permission denied for table discussion_posts' })).toBe(
      'Could not save that just now. Try again.',
    )
    expect(friendlyError(null)).toBe('Could not save that just now. Try again.')
  })
})
