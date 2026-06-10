import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MediaStage } from './MediaStage'
import { gripEntryFor } from '../../data/grips'
import * as reducedMotion from '../../hooks/useReducedMotion'

const clip = gripEntryFor('four-seam')?.clip
if (!clip) throw new Error('four-seam grip clip missing from the library')

afterEach(() => {
  vi.restoreAllMocks()
})

describe('MediaStage', () => {
  it('stages the clip as a muted looping video with the poster first and mp4 preferred', () => {
    render(<MediaStage clip={clip} />)
    const video = screen.getByLabelText(clip.alt)
    expect(video.tagName).toBe('VIDEO')
    expect(video).toHaveAttribute('poster', clip.poster)
    expect(video).toHaveProperty('muted', true)
    expect(video).toHaveAttribute('loop')
    expect(video).toHaveAttribute('playsinline')
    const sources = video.querySelectorAll('source')
    expect(sources[0]?.getAttribute('type')).toBe('video/mp4')
  })

  it('holds on the poster frame under reduced motion', () => {
    vi.spyOn(reducedMotion, 'useReducedMotion').mockReturnValue(true)
    render(<MediaStage clip={clip} />)
    const img = screen.getByAltText(clip.alt)
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('src', clip.poster)
  })
})
