import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { featuredPitchSet } from '../../data/featured'
import { gripEntryFor } from '../../data/grips'
import { ChromeWall } from './ChromeWall'

describe('ChromeWall (the filed set)', () => {
  it('shows one real filed specimen per core family', () => {
    const { container } = render(
      <MemoryRouter>
        <ChromeWall />
      </MemoryRouter>,
    )

    const featured = featuredPitchSet()
    expect(featured).toHaveLength(3)
    expect(container.querySelectorAll('.v2-mount')).toHaveLength(featured.length)
    for (const entry of featured) {
      expect(screen.getAllByText(entry.display.shortName).length).toBeGreaterThan(0)
    }
  })

  it('keeps sourced grip and shape detail on the card backs', () => {
    const { container } = render(
      <MemoryRouter>
        <ChromeWall />
      </MemoryRouter>,
    )
    expect(container.querySelectorAll('.rfx-grip-twin').length).toBeGreaterThan(0)
    const keys = [...container.querySelectorAll('.rfx-scout-k')].map((node) => node.textContent)
    expect(keys.filter((key) => key === 'Grip cue')).toHaveLength(featuredPitchSet().length)
    expect(keys.filter((key) => key === 'Shape')).toHaveLength(featuredPitchSet().length)
    for (const entry of featuredPitchSet()) {
      const gripCue = entry.canonical.gripDetails[0] ?? entry.canonical.grip
      expect(gripCue.source).toBeTruthy()
      expect(shapeSource(entry)).toBeTruthy()
      expect(container.querySelector(`a[href="${gripCue.source?.url}"]`)).not.toBeNull()
      expect(container.querySelector(`a[href="${shapeSource(entry)?.url}"]`)).not.toBeNull()
    }
  })

  it('keeps collectible grading off the restrained card front', () => {
    const { container } = render(
      <MemoryRouter>
        <ChromeWall />
      </MemoryRouter>,
    )
    expect(container.querySelector('.rfx-grade')).toBeNull()
    expect(container.querySelectorAll('.rfx-read').length).toBe(featuredPitchSet().length)
    expect(container.querySelectorAll('.rfx-gripchip')).toHaveLength(featuredPitchSet().length)
  })

  /* The front door used to hard-code the seam drawing and the words "Reference
     schematic" onto all three cards, so the two pitches Austin filmed showed a
     drawing while their real clips shipped unused. Derive the expectation from
     the grip library instead of pinning a literal, so a new clip can't be
     shadowed again without this failing. */
  it('plays Austin\'s own grip video on every featured pitch that has one', () => {
    const { container } = render(
      <MemoryRouter>
        <ChromeWall />
      </MemoryRouter>,
    )

    const filmed = featuredPitchSet().filter((entry) => gripEntryFor(entry.display.slug)?.clip)
    expect(filmed.length).toBeGreaterThan(0)
    expect(screen.getAllByText('Austin video')).toHaveLength(filmed.length)

    for (const entry of filmed) {
      const clip = gripEntryFor(entry.display.slug)?.clip
      expect(container.querySelector(`video source[src="${clip?.mp4}"]`)).not.toBeNull()
    }
  })
})

function shapeSource(entry: ReturnType<typeof featuredPitchSet>[number]) {
  return entry.canonical.physics.shape.source
}
