import { describe, expect, it } from 'vitest'
import { pitchBySlug } from './pitches'
import { solveGripPose } from '../lib/gripPose'
import type { GripContactModel, PitchAtlasEntry } from './types'

/*
  Per-pitch acceptance constraints: the authored grips must keep matching what
  the sources say a hand actually does. Each block encodes a real-world tell —
  the cutter lock is the headline: an off-center four-seam can never regress
  into a slider look, because this file fails first.
*/

function entry(slug: string): PitchAtlasEntry {
  const p = pitchBySlug(slug)
  if (!p) throw new Error(`No pitch filed at slug "${slug}"`)
  return p
}

function contact(slug: string, finger: GripContactModel['finger']): GripContactModel {
  const c = entry(slug).canonical.gripModel.contacts.find((x) => x.finger === finger)
  if (!c) throw new Error(`No ${finger} contact authored for "${slug}"`)
  return c
}

const topFingers = (slug: string) =>
  entry(slug).canonical.gripModel.contacts.filter(
    (c) => c.finger === 'index' || c.finger === 'middle',
  )

describe('tell-lock: the cutter is an off-center four-seam, never a slider', () => {
  it('keeps both top fingers crossing the seam (|azimuth| >= 60) with a glove-side shift (seamOffset < 0)', () => {
    const fingers = topFingers('cutter')
    expect(fingers.length).toBe(2)
    for (const f of fingers) {
      expect(Math.abs(f.azimuth)).toBeGreaterThanOrEqual(60)
      expect(f.seamOffset).toBeLessThan(0)
    }
  })

  it('keeps the cut on middle-finger pressure, like the sources say', () => {
    expect(entry('cutter').canonical.gripModel.primaryPressureFinger).toBe('middle')
    expect(contact('cutter', 'middle').pressureTier).toBe('primary')
  })

  it('stays distinct from the slider, whose fingers ride the seam instead of crossing it', () => {
    for (const f of topFingers('slider')) {
      expect(Math.abs(f.azimuth)).toBeLessThanOrEqual(45)
    }
    // crossing vs riding is the structural difference, locked numerically
    const cutterMin = Math.min(...topFingers('cutter').map((f) => Math.abs(f.azimuth)))
    const sliderMax = Math.max(...topFingers('slider').map((f) => Math.abs(f.azimuth)))
    expect(cutterMin - sliderMax).toBeGreaterThanOrEqual(15)
  })
})

describe('fastball family', () => {
  it('four-seam: fingertip pads cross the horseshoe seam, on the seam itself', () => {
    for (const f of topFingers('four-seam')) {
      expect(Math.abs(f.azimuth)).toBeGreaterThanOrEqual(60)
      expect(Math.abs(f.seamOffset)).toBeLessThanOrEqual(0.02)
      expect(['tip', 'pad']).toContain(f.engagement)
    }
  })

  it('two-seam: fingers ride the narrow lanes along the seams, never across them', () => {
    for (const f of topFingers('two-seam')) {
      expect(Math.abs(f.azimuth)).toBeLessThanOrEqual(25)
      expect(Math.abs(f.seamOffset)).toBeLessThanOrEqual(0.02)
    }
  })
})

describe('split family: outside the seams, depth tells splitter from forkball', () => {
  it('splitter and forkball both sit outside the seams (seamOffset > 0)', () => {
    for (const slug of ['splitter', 'forkball']) {
      for (const f of topFingers(slug)) {
        expect(f.seamOffset).toBeGreaterThan(0)
      }
    }
  })

  it('forkball is visibly deeper than the splitter: wider offsets, longer leather hug', () => {
    const splitIndex = contact('splitter', 'index')
    const forkIndex = contact('forkball', 'index')
    expect(forkIndex.seamOffset).toBeGreaterThan(splitIndex.seamOffset)
    expect(forkIndex.engagement).toBe('inside')
    expect(splitIndex.engagement).toBe('pad')
    const splitHug = solveGripPose(splitIndex).contactArc
    const forkHug = solveGripPose(forkIndex).contactArc
    expect(forkHug).toBeGreaterThan(splitHug)
  })

  it('splinker stays a light split: narrower than the splitter, on a two-seam orientation', () => {
    for (const f of topFingers('splinker')) {
      expect(f.seamOffset).toBeGreaterThan(0)
      expect(f.seamOffset).toBeLessThan(contact('splitter', 'index').seamOffset)
      expect(Math.abs(f.azimuth)).toBeLessThanOrEqual(25)
    }
  })
})

describe('offspeed and breaking tells', () => {
  it('circle change: thumb and index close the circle, ball deeper in the hand', () => {
    expect(contact('circle-change', 'index').pinchesToward).toBe('thumb')
    expect(contact('circle-change', 'thumb').pinchesToward).toBe('index')
    expect(entry('circle-change').canonical.gripModel.ballDepth).toBe('deep-in-hand')
    // the circle frees the index from carrying the ball
    expect(contact('circle-change', 'index').pressureTier).toBe('light')
  })

  it('12-6 curve: middle finger leverages the seam, thumb braced as the opposing support', () => {
    const middle = contact('twelve-six', 'middle')
    expect(middle.pressureTier).toBe('primary')
    expect(Math.abs(middle.seamOffset)).toBeLessThanOrEqual(0.02)
    const thumb = contact('twelve-six', 'thumb')
    expect(thumb.pressureTier).toBe('support')
    expect(Math.abs(thumb.seamOffset)).toBeLessThanOrEqual(0.02)
    expect(thumb.pressureRole.toLowerCase()).toMatch(/oppos|brace|anchor/)
  })

  it('knuckleball: the top fingers engage with nails or knuckles, never flat pads', () => {
    for (const f of topFingers('knuckleball')) {
      expect(['nail', 'knuckle']).toContain(f.engagement)
    }
  })

  it('eephus: no canonical grip is invented — status unfiled, zero contacts', () => {
    const gm = entry('eephus').canonical.gripModel
    expect(gm.status).toBe('unfiled')
    expect(gm.contacts).toHaveLength(0)
    expect(gm.provenance.confidence).toBe('unverified')
  })
})
