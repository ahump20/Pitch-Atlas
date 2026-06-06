import { describe, expect, it } from 'vitest'
import { PITCHES, pitchBySlug } from './pitches'
import type { GripView } from './types'

const VIEWS: GripView[] = ['top', 'side', 'thumb']

describe('grip model', () => {
  it('gives every pitch a renderable hand and ball model', () => {
    for (const pitch of PITCHES) {
      const model = pitch.canonical.gripModel
      expect(VIEWS).toContain(model.defaultView)
      expect(model.contacts.length).toBeGreaterThanOrEqual(3)
      expect(model.thumbRole).toBeTruthy()
      expect(model.palmGapCue).toBeTruthy()
      expect(model.releaseCue).toBeTruthy()
      expect(model.visualCaveat).toMatch(/schematic/i)
      expect(model.contacts.some((contact) => contact.finger === 'thumb')).toBe(true)
      expect(model.contacts.some((contact) => contact.finger === model.primaryPressureFinger)).toBe(true)
    }
  })

  it('keeps seam anchors and curl hints inside the authored range', () => {
    for (const pitch of PITCHES) {
      for (const contact of pitch.canonical.gripModel.contacts) {
        expect(contact.seamT).toBeGreaterThanOrEqual(0)
        expect(contact.seamT).toBeLessThanOrEqual(1)
        expect(contact.lift).toBeGreaterThanOrEqual(0)
        expect(contact.curl).toBeGreaterThanOrEqual(0)
        expect(contact.curl).toBeLessThanOrEqual(1)
        expect(contact.seamRelation).toBeTruthy()
        expect(contact.pressureRole).toBeTruthy()
        expect(contact.cue).toBeTruthy()
      }
    }
  })

  it('keeps live-photo grip tells distinct on filed specimen pages', () => {
    expect(pitchBySlug('four-seam')?.canonical.gripModel.visualCaveat).toContain('crossing a seam path')
    expect(pitchBySlug('two-seam')?.canonical.gripModel.visualCaveat).toContain('train tracks')
    expect(pitchBySlug('twelve-six')?.canonical.gripModel.visualCaveat).toContain('thumb as the main opposing pressure')
    expect(pitchBySlug('circle-change')?.canonical.gripModel.visualCaveat).toContain('thumb-index circle is visible')
    expect(pitchBySlug('splitter')?.canonical.gripModel.visualCaveat).toContain('outside the seam tracks')
  })
})
