import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/*
  The hardest media rule, made executable. The only motion files that may ship in
  public/ or the iOS bundle are Austin's own first-party grip videos (under a
  grips/ folder). Everything else — third-party MLB broadcast, agency, or archive
  footage — stays embed-only at its source, never a hosted byte. The EXIF tests
  guard the upload boundary; this guards the committed-bundle floor on both
  platforms. A planted clip anywhere else fails the build.
*/

const MOTION_EXT = /\.(mp4|webm|mov|m4v|avi|mkv|gif)$/i

function motionFilesUnder(dir: string): string[] {
  const out: string[] = []
  const walk = (d: string) => {
    let entries
    try {
      entries = readdirSync(d, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = join(d, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (MOTION_EXT.test(entry.name)) out.push(full)
    }
  }
  walk(dir)
  return out
}

function dirExists(dir: string): boolean {
  try {
    return statSync(dir).isDirectory()
  } catch {
    return false
  }
}

describe('motion-floor guard: only first-party grip videos ship', () => {
  it('public/ holds no motion files outside public/grips/', () => {
    const root = join(process.cwd(), 'public')
    const offenders = motionFilesUnder(root)
      .map((file) => relative(root, file))
      .filter((rel) => !rel.startsWith(`grips${'/'}`))
    expect(offenders).toEqual([])
  })

  it('the iOS Resources bundle holds no motion files outside Resources/grips/', () => {
    const root = join(process.cwd(), 'Pitch-Atlas-iOS', 'PitchAtlas', 'Resources')
    // A web-only checkout has no iOS tree; the floor still holds where it exists.
    if (!dirExists(root)) return
    const offenders = motionFilesUnder(root)
      .map((file) => relative(root, file))
      .filter((rel) => !rel.startsWith(`grips${'/'}`))
    expect(offenders).toEqual([])
  })
})
