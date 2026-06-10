import { describe, expect, it } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { GripViewer } from './GripViewer'
import { PITCHES } from '../../data/pitches'
import { CONFIDENCE_META } from '../../data/types'

/*
  THE HARD RULE of the Grip Lab, as a test: no pitch page may render a Grip Lab
  with a naked generic baseball. Every filed grip draws at least one solved
  finger; every unfiled grip renders the explicit no-canonical-grip state. There
  is no third branch. jsdom has no WebGL, so these renders exercise the same
  schematic path a no-WebGL or reduced-motion visitor gets — the floor, not the
  showcase — which is exactly the surface that must never be naked.
*/

describe('GripViewer hard rule: never a naked ball', () => {
  for (const pitch of PITCHES) {
    const slug = pitch.display.slug
    const status = pitch.canonical.gripModel.status

    it(`${slug}: renders ${status === 'filed' ? 'solved fingers' : 'the explicit unfiled state'}`, () => {
      const { container } = render(<GripViewer entry={pitch} accentColor="#caa14a" />)
      const fingers = container.querySelectorAll('[data-grip-finger]')
      const unfiledMarker = container.querySelector('[data-grip-unfiled]')

      // the rule itself: one of the two honest outcomes, never neither
      expect(fingers.length > 0 || unfiledMarker !== null).toBe(true)

      if (status === 'filed') {
        expect(fingers.length).toBeGreaterThanOrEqual(1)
        expect(unfiledMarker).toBeNull()
      } else {
        expect(fingers.length).toBe(0)
        expect(unfiledMarker).not.toBeNull()
        expect(container.textContent).toContain('No canonical grip on file')
      }
    })

    it(`${slug}: wears the seven-tier source badge inside the visual panel`, () => {
      const { container } = render(<GripViewer entry={pitch} accentColor="#caa14a" />)
      const badge = container.querySelector('[data-grip-source-badge]')
      expect(badge).not.toBeNull()
      const tier = pitch.canonical.gripModel.provenance.confidence
      expect(badge?.textContent).toContain(CONFIDENCE_META[tier].label)
    })
  }
})

describe('GripViewer controls', () => {
  const fourSeam = PITCHES.find((p) => p.display.slug === 'four-seam')!

  it('flips the hand from the keyboard (F) and walks views with the arrows', () => {
    const { container, getByRole } = render(<GripViewer entry={fourSeam} accentColor="#caa14a" />)
    const panel = container.querySelector('[data-grip-viewer]')!

    const pressed = (name: string) =>
      getByRole('button', { name }).getAttribute('aria-pressed')

    expect(pressed('Right')).toBe('true')
    fireEvent.keyDown(panel, { key: 'f' })
    expect(pressed('Left')).toBe('true')

    expect(pressed('Top')).toBe('true')
    fireEvent.keyDown(panel, { key: 'ArrowRight' })
    expect(pressed('Side')).toBe('true')
    fireEvent.keyDown(panel, { key: 'ArrowLeft' })
    expect(pressed('Top')).toBe('true')
  })

  it('lifts the hand away (H) without ever leaving a naked unlabeled panel', () => {
    const { container } = render(<GripViewer entry={fourSeam} accentColor="#caa14a" />)
    const panel = container.querySelector('[data-grip-viewer]')!

    expect(container.querySelectorAll('[data-grip-finger]').length).toBeGreaterThan(0)
    fireEvent.keyDown(panel, { key: 'h' })
    // the hand is lifted deliberately, on the visitor's command — the source
    // badge stays, so the panel is still a labeled specimen, not a naked ball
    expect(container.querySelectorAll('[data-grip-finger]').length).toBe(0)
    expect(container.querySelector('[data-grip-source-badge]')).not.toBeNull()
    fireEvent.keyDown(panel, { key: 'h' })
    expect(container.querySelectorAll('[data-grip-finger]').length).toBeGreaterThan(0)
  })
})
