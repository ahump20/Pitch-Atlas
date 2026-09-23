import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { gripEntryFor } from '../../data/grips'
import { RefractorCard, type RefractorAccent } from './RefractorCard'
import { ACCENT, accentInk } from './accents'
import { GripClip } from './GripClip'

const clip = gripEntryFor('four-seam')?.clip
if (!clip) throw new Error('four-seam grip clip missing from the library')

describe('GripClip presentation composition', () => {
  it('can play a curated home reveal once while keeping a matched poster', () => {
    render(
      <GripClip
        clip={clip}
        playback="once"
        sourceOverride={{
          mp4: '/presentation/hero.mp4',
          webm: '/presentation/hero.webm',
          poster: '/presentation/hero.webp',
          alt: 'Curated four-seam grip angle',
        }}
        mediaClassName="rfx-grip-img--hero"
      />,
    )

    const video = screen.getByLabelText('Curated four-seam grip angle')
    const poster = screen.getByAltText('Curated four-seam grip angle')
    expect(video).not.toHaveAttribute('loop')
    expect(video).toHaveAttribute('poster', '/presentation/hero.webp')
    expect(video.querySelector('source[type="video/mp4"]')).toHaveAttribute('src', '/presentation/hero.mp4')
    expect(video).toHaveClass('rfx-grip-img--hero')
    expect(poster).toHaveClass('rfx-grip-img--hero')
  })
})

describe('RefractorCard editorial hierarchy', () => {
  it('prints the archive vocabulary instead of a generic card face', () => {
    render(
      <MemoryRouter>
        <RefractorCard
          to="/pitch/four-seam"
          accent={{ c1: '#0A141B', c2: '#3D6178', c3: '#B9D4E5' }}
          vnum="00"
          name="Four-seam"
          face={<span>Grip face</span>}
          cue="Fingertips cross the seam path"
          confidence={{ label: "Pitcher's own words", color: '#2C5A8C' }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Filed specimen')).toBeInTheDocument()
    expect(screen.getByText('Grip tell')).toBeInTheDocument()
    expect(screen.getByText('Grip / release / shape')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Four-seam specimen' })).toBeInTheDocument()
  })
})

describe('RefractorCard throwback finishes', () => {
  const card = (accent: RefractorAccent, gold = false) =>
    render(
      <MemoryRouter>
        <RefractorCard to="/pitch/x" accent={accent} gold={gold} vnum="03" name="Card" face={<span>Grip face</span>} />
      </MemoryRouter>,
    ).container.querySelector('.rfx-card')

  it('frames the 12-6 curve in powder and the circle change in teal', () => {
    expect(card(ACCENT['twelve-six'])).toHaveClass('is-powder')
    expect(card(ACCENT['circle-change'])).toHaveClass('is-teal')
    expect(card(ACCENT.slider)?.className).not.toMatch(/is-(powder|teal)/)
  })

  it('keeps the ember 1/1 on its own material', () => {
    const ember = card(ACCENT['twelve-six'], true)
    expect(ember).toHaveClass('is-gold')
    expect(ember).not.toHaveClass('is-powder')
  })

  it('prints small type in bone where the accent is burnt orange', () => {
    expect(accentInk('#bf5700')).toBe('var(--color-bone)')
    expect(accentInk('#8FBAD6')).toBe('#8FBAD6')
  })
})
