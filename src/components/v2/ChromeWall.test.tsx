import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { featuredPitchSet } from '../../data/featured'
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
    expect(screen.getAllByText('Reference schematic')).toHaveLength(featuredPitchSet().length)
  })
})

function shapeSource(entry: ReturnType<typeof featuredPitchSet>[number]) {
  return entry.canonical.physics.shape.source
}
