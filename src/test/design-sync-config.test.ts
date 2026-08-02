import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'

/*
  Guards the two design-sync traps written up in `.design-sync/NOTES.md`.

  The driver itself lives in `.ds-sync/`, which is gitignored and re-vendored by
  the skill — nothing there survives an update, so the enforcement lives here and
  in `scripts/design-sync.mjs` instead. This file pins the invariants that can be
  checked from tracked source alone:

  1. The ds barrel still re-exports the three components that live outside
     `srcDir`. They reach `window.PitchAtlas` only through that barrel, and when
     they fall out the build still prints success — the manifest is built from
     `cfg.componentSrcMap`, never from what actually bundled.

  2. `cfg.cssEntry` names the stylesheet the built app actually loads. The hash
     changes on every `vite build`, so a stored value goes stale silently. The
     dist half only runs post-build (same PITCH_ATLAS_CHECK_DIST gate as the
     prerender gate); the shape half runs always.
*/

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const CONFIG = path.join(ROOT, '.design-sync/config.json')
const BARREL = path.join(ROOT, 'src/components/ds/index.ts')
const DIST_HTML = path.join(ROOT, 'dist/index.html')
const shouldCheckDist = process.env.PITCH_ATLAS_CHECK_DIST === '1'

/* Re-exported from brand/, provenance/ and refractor/ — all outside srcDir. */
const OUT_OF_SRCDIR = ['BrandMark', 'ConfidenceDot', 'PitchSpecimenCard'] as const

const config = JSON.parse(readFileSync(CONFIG, 'utf8')) as { cssEntry?: string; srcDir?: string }

describe('design-sync config', () => {
  it.each(OUT_OF_SRCDIR)('ds barrel re-exports %s', (name) => {
    const barrel = readFileSync(BARREL, 'utf8')
    expect(barrel).toMatch(new RegExp(`\\b${name}\\b`))
  })

  it('declares a cssEntry under dist/assets', () => {
    expect(config.cssEntry).toMatch(/^dist\/assets\/.+\.css$/)
  })

  it('has the wrapper that supplies --entry', () => {
    const wrapper = path.join(ROOT, 'scripts/design-sync.mjs')
    expect(existsSync(wrapper)).toBe(true)
    /* The flag is optional in the driver; the wrapper is what makes it certain. */
    expect(readFileSync(wrapper, 'utf8')).toContain("'--entry'")
  })
})

describe.runIf(shouldCheckDist)('design-sync config against the real build', () => {
  it('points cssEntry at the stylesheet dist/index.html actually loads', () => {
    const html = readFileSync(DIST_HTML, 'utf8')
    const linked = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)]
      .map((m) => /href=["']([^"']+\.css)["']/i.exec(m[0])?.[1])
      .filter((href): href is string => Boolean(href))
      .map((href) => `dist/${href.replace(/^\//, '')}`)

    expect(new Set(linked).size).toBe(1)
    expect(config.cssEntry).toBe(linked[0])
  })

  it('resolves cssEntry to a file that exists', () => {
    expect(existsSync(path.join(ROOT, config.cssEntry!))).toBe(true)
  })
})
