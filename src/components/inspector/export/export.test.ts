import { describe, expect, it } from 'vitest'
import { PITCHES, pitchBySlug } from '../../../data/pitches'
import { cardLayout } from './cardLayout'
import { backText, frontText } from './composeCard'
import { exportEligibility } from './eligibility'
import { captionFor, exportFilename } from './exportPng'
import { loopLight, loopPose, webmSupport, WEBM_FRAMES } from './exportWebm'
import { poseDimensions, projectCorners } from './poseCard'

const fourSeam = pitchBySlug('four-seam')!

describe('cardLayout', () => {
  it('matches the DOM proportions at the 360px reference width', () => {
    const l = cardLayout({ width: 360, gold: false })
    expect(l.height).toBe(504)
    expect(l.pad).toBe(13)
    expect(l.radius).toBe(9)
    expect(l.fieldRadius).toBe(4)
    expect(l.window.w / l.window.h).toBeCloseTo(10 / 9, 5)
    expect(l.window.x).toBeCloseTo(13 + 3.06 * 3.6, 5)
    expect(l.strip.y + l.strip.h).toBeCloseTo(l.inner.y + l.inner.h, 5)
    expect(l.plate.y).toBeGreaterThan(l.window.y + l.window.h)
  })
  it('gives the 1/1 its heavier rim and scales with the width', () => {
    const l = cardLayout({ width: 1500, gold: true })
    expect(l.pad).toBeCloseTo((16 * 1500) / 360, 5)
    expect(l.u).toBe(15)
    expect(l.windowRadius[0]).toBeCloseTo(21.67 * 15, 5)
  })
})

describe('what the card prints', () => {
  it('reads the four-seam front from the record and the grip library', () => {
    const t = frontText(fourSeam)
    expect(t.name).toBe('Four-seam')
    expect(t.number).toBe('00')
    expect(t.chip).toBe('Austin video')
    expect(t.cue).toBe('Fingertips cross the seam path')
    expect(t.confidence).toBe("Pitcher's own words")
    expect(t.approx).toBe(false)
    expect(t.strip[1]).toContain('Open specimen')
  })
  it('reads the back rows with their claim tiers and sources', () => {
    const t = backText(fourSeam)
    expect(t.rows.map((r) => r.key)).toEqual(['Grip cue', 'Shape'])
    expect(t.rows[0].source).toMatch(/^Grip: /)
    expect(t.rows[1].source).toMatch(/^Shape: /)
    expect(t.rows.every((r) => r.confidence.length > 0)).toBe(true)
  })
})

describe('exportEligibility', () => {
  it('lets a first-party clip leave with its attribution', () => {
    const e = exportEligibility(fourSeam, 'front')
    expect(e.exportable).toBe(true)
    expect(e.attribution).toBe("Grip: Austin video, pitcher's own words")
  })
  it('labels a drawn face as the seam-informed schematic', () => {
    const drawn = PITCHES.find((p) => exportEligibility(p, 'front').attribution.startsWith('Reference schematic'))
    expect(drawn).toBeDefined()
    expect(exportEligibility(drawn!, 'front').attribution).toContain('seam-informed')
  })
  it('refuses a face filed under linked-only terms, and says why', () => {
    const restricted = { ...fourSeam, display: { ...fourSeam.display, slug: 'not-in-the-library' }, canonical: { ...fourSeam.canonical, rights: 'linked-only' as const } }
    const e = exportEligibility(restricted, 'front')
    expect(e.exportable).toBe(false)
    expect(e.reason).toMatch(/do not allow a copy/)
  })
  it('always exports the sourced back and names its sources', () => {
    const e = exportEligibility(fourSeam, 'back')
    expect(e.exportable).toBe(true)
    expect(e.attribution).toMatch(/Grip: .+ · Shape: .+/)
  })
})

describe('caption and filename', () => {
  it('carries the number, the name, the attribution and the URL', () => {
    const c = captionFor(fourSeam, 'front')
    expect(c).toContain('Filed specimen 00')
    expect(c).toContain('Four-seam fastball')
    expect(c).toContain("Austin video, pitcher's own words")
    expect(c).toContain('pitch-atlas.com/pitch/four-seam')
    expect(captionFor(fourSeam, 'back')).toContain('Sources')
  })
  it('names the file by pitch, number and face', () => {
    expect(exportFilename(fourSeam, 'front', 'png')).toBe('pitch-atlas-four-seam-00-front.png')
    expect(exportFilename(fourSeam, 'back', 'webm')).toBe('pitch-atlas-four-seam-00-back.webm')
  })
})

describe('the loop closes', () => {
  it('returns to the request pose and light at phase 1', () => {
    const base = { rx: 8, ry: -6 }
    const light = { x: 0.62, y: 0.4, height: 1.1, strength: 1 }
    const p0 = loopPose(base, 0)
    const p1 = loopPose(base, 1)
    expect(Math.abs(p0.rx - p1.rx)).toBeLessThan(1e-9)
    expect(Math.abs(p0.ry - p1.ry)).toBeLessThan(1e-9)
    expect(p0).toEqual(base)
    const l0 = loopLight(light, 0)
    const l1 = loopLight(light, 1)
    expect(Math.abs(l0.x - l1.x)).toBeLessThan(1e-9)
    expect(Math.abs(l0.y - l1.y)).toBeLessThan(1e-9)
    expect(l0.x).toBeCloseTo(light.x, 9)
    expect(WEBM_FRAMES).toBe(210)
  })
  it('moves in between', () => {
    expect(loopPose({ rx: 0, ry: 0 }, 0.25).rx).toBeCloseTo(4.5, 9)
  })
})

describe('webmSupport', () => {
  it('says plainly when the browser cannot record, instead of failing later', () => {
    const s = webmSupport()
    expect(s.ok).toBe(false)
    if (!s.ok) expect(s.reason).toMatch(/PNG export still works/)
  })
})

describe('pose geometry', () => {
  it('keeps the posed card inside the margin and tips the right edge away when rx is positive', () => {
    const dims = poseDimensions(1500, 2100)
    expect(dims.width).toBe(1800)
    const q = projectCorners(1500, 2100, { rx: 12, ry: 0 }, dims.width / 2, dims.margin + 1050)
    // right corners recede: closer together vertically than the left ones
    expect(q[2].y - q[1].y).toBeLessThan(q[3].y - q[0].y)
    for (const p of q) {
      expect(p.x).toBeGreaterThan(0)
      expect(p.x).toBeLessThan(dims.width)
      expect(p.y).toBeGreaterThan(0)
      expect(p.y).toBeLessThan(dims.height)
    }
  })
})
