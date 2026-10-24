import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { gripEntryFor } from '../../data/grips'
import { setMotionPref } from '../refractor/material/motionPref'
import { GripMotion } from '../sections/GripLibrary'
import { AutoplayVideo } from './AutoplayVideo'

/*
  The hold itself. jsdom has no media, so the guard's play()/pause() are swapped for
  spies; everything between the visitor's Pause and those two calls is the real code.
  jsdom has no IntersectionObserver either, so a mounted clip counts as on screen.
*/
const guard = vi.hoisted(() => ({ play: vi.fn(), pause: vi.fn() }))
vi.mock('../../hooks/useAutoplayGuard', async () => {
  const { useRef } = await import('react')
  return {
    useAutoplayGuard: () => ({ ref: useRef(null), blocked: false, play: guard.play, pause: guard.pause }),
  }
})

const clip = gripEntryFor('four-seam')?.clip
if (!clip) throw new Error('four-seam grip clip missing from the library')

afterEach(() => {
  act(() => setMotionPref('live'))
  guard.play.mockClear()
  guard.pause.mockClear()
})

describe('the visitor’s Pause on a looping clip', () => {
  it('holds a running clip and lets it run again on Resume', () => {
    render(<AutoplayVideo clip={clip} className="rfx-grip-img" onSettled={() => {}} render={() => null} />)
    expect(guard.play).toHaveBeenCalled()
    expect(guard.pause).not.toHaveBeenCalled()

    guard.play.mockClear()
    act(() => setMotionPref('paused'))
    expect(guard.pause).toHaveBeenCalled()
    expect(guard.play).not.toHaveBeenCalled()

    act(() => setMotionPref('live'))
    expect(guard.play).toHaveBeenCalled()
  })

  it('keeps a clip still when the Pause was pressed on an earlier page', () => {
    setMotionPref('paused')
    render(<AutoplayVideo clip={clip} className="rfx-grip-img" onSettled={() => {}} render={() => null} />)
    expect(guard.play).not.toHaveBeenCalled()
    expect(guard.pause).toHaveBeenCalled()
  })

  it('holds the grip library’s clip too', () => {
    setMotionPref('paused')
    render(<GripMotion clip={clip} />)
    expect(guard.play).not.toHaveBeenCalled()
    expect(guard.pause).toHaveBeenCalled()
  })
})
