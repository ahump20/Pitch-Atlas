import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { gripEntryFor } from '../../data/grips'
import { RefractorCard } from './RefractorCard'
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
