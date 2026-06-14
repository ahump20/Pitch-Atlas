import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MediaStage } from './MediaStage'
import { autoplayDecision } from './AutoplayVideo'
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

  it('drives playback from the viewport, not the autoPlay attribute', () => {
    // The fix: offscreen clips must not decode, so the browser never gets an
    // `autoplay` hint — an IntersectionObserver plays the clip only when visible.
    render(<MediaStage clip={clip} />)
    const video = screen.getByLabelText(clip.alt)
    expect(video).not.toHaveAttribute('autoplay')
  })

  it('holds on the poster frame under reduced motion', () => {
    vi.spyOn(reducedMotion, 'useReducedMotion').mockReturnValue(true)
    render(<MediaStage clip={clip} />)
    const img = screen.getByAltText(clip.alt)
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('src', clip.poster)
    // reduced motion never mounts the clip at all
    expect(screen.queryByLabelText(clip.alt)).toBeNull()
  })
})

describe('autoplayDecision (viewport gating)', () => {
  it('plays when the clip enters the viewport', () => {
    expect(autoplayDecision([{ isIntersecting: true }])).toBe('play')
  })

  it('pauses when the clip leaves the viewport', () => {
    expect(autoplayDecision([{ isIntersecting: false }])).toBe('pause')
  })

  it('plays again on re-entry — the decision is stateless, so a clip that scrolls back in resumes', () => {
    // simulate leave then re-enter: each callback yields the right action
    expect(autoplayDecision([{ isIntersecting: false }])).toBe('pause')
    expect(autoplayDecision([{ isIntersecting: true }])).toBe('play')
  })

  it('plays when any slice is visible across batched entries', () => {
    expect(
      autoplayDecision([{ isIntersecting: false }, { isIntersecting: true }]),
    ).toBe('play')
  })

  it('does nothing with no entries', () => {
    expect(autoplayDecision([])).toBe('none')
  })
})
