import { describe, expect, it } from 'vitest'
import { PITCHES, pitchBySlug } from './pitches'
import { CONFIDENCE_META, type GripView } from './types'

const VIEWS: GripView[] = ['top', 'side', 'thumb']

const filed = PITCHES.filter((p) => p.canonical.gripModel.status === 'filed')
const unfiled = PITCHES.filter((p) => p.canonical.gripModel.status === 'unfiled')

describe('grip model', () => {
  it('gives every filed pitch a renderable hand and ball model', () => {
    expect(filed.length).toBeGreaterThan(0)
    for (const pitch of filed) {
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

  it('keeps an unfiled grip honest: no contacts, no drawn fingers, a noted unverified claim', () => {
    for (const pitch of unfiled) {
      const model = pitch.canonical.gripModel
      // contacts empty if and only if unfiled — nothing half-drawn
      expect(model.contacts).toHaveLength(0)
      expect(pitch.canonical.fingerPlacement).toHaveLength(0)
      expect(model.provenance.confidence).toBe('unverified')
      expect(model.provenance.note).toBeTruthy()
      expect(model.releaseCue).toBeTruthy()
    }
    // and the inverse: a filed grip never ships empty
    for (const pitch of filed) {
      expect(pitch.canonical.gripModel.contacts.length).toBeGreaterThan(0)
    }
  })

  it('binds every grip to the seven-tier source vocabulary', () => {
    for (const pitch of PITCHES) {
      const provenance = pitch.canonical.gripModel.provenance
      expect(CONFIDENCE_META[provenance.confidence]).toBeDefined()
      expect(provenance.value).toBeTruthy()
      if (provenance.confidence !== 'unverified') {
        expect(provenance.source).toBeDefined()
      }
      const orientation = pitch.canonical.gripModel.orientation
      expect(orientation.knuckleLine).toBeTruthy()
      expect(orientation.palmFacing).toBeTruthy()
    }
  })

  it('keeps seam anchors, offsets, and curl hints inside the authored range', () => {
    for (const pitch of PITCHES) {
      for (const contact of pitch.canonical.gripModel.contacts) {
        expect(contact.seamT).toBeGreaterThanOrEqual(0)
        expect(contact.seamT).toBeLessThanOrEqual(1)
        expect(contact.lift).toBeGreaterThanOrEqual(0)
        expect(contact.curl).toBeGreaterThanOrEqual(0)
        expect(contact.curl).toBeLessThanOrEqual(1)
        expect(Math.abs(contact.seamOffset)).toBeLessThanOrEqual(0.5)
        expect(Math.abs(contact.azimuth)).toBeLessThanOrEqual(180)
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
