import { readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PRESENTATION_MEDIA } from './presentation'

/*
  The hardest media rule, made executable. Motion files may ship only as Austin's
  own grip videos under grips/ or as an explicitly declared presentation-manifest
  derivative with rights and budget receipts. Third-party broadcast, agency, or
  archive footage stays embed-only at its source, never a hosted byte. The EXIF
  tests guard the upload boundary; this guards the committed-bundle floor on both
  platforms. An undeclared planted clip anywhere else fails the build.
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

function posixPath(path: string): string {
  return path.split(sep).join('/')
}

describe('motion-floor guard: only grip or declared presentation videos ship', () => {
  it('public/ holds no motion files outside public/grips/ or the presentation manifest', () => {
    const root = join(process.cwd(), 'public')
    const declaredPresentationMotion = new Set(
      Object.values(PRESENTATION_MEDIA).flatMap((asset) =>
        'motion' in asset && asset.motion
          ? [asset.motion.mp4.src, asset.motion.webm.src].map((src) => src.replace(/^\//, ''))
          : [],
      ),
    )
    const offenders = motionFilesUnder(root)
      .map((file) => posixPath(relative(root, file)))
      .filter((rel) => !rel.startsWith('grips/') && !declaredPresentationMotion.has(rel))
    expect(offenders).toEqual([])
  })

  it('the iOS Resources bundle holds no motion files outside Resources/grips/', () => {
    const root = join(process.cwd(), 'Pitch-Atlas-iOS', 'PitchAtlas', 'Resources')
    // A web-only checkout has no iOS tree; the floor still holds where it exists.
    if (!dirExists(root)) return
    const offenders = motionFilesUnder(root)
      .map((file) => posixPath(relative(root, file)))
      .filter((rel) => !rel.startsWith('grips/'))
    expect(offenders).toEqual([])
  })
})
