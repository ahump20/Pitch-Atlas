import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAutoplayGuard } from './useAutoplayGuard'

/*
  The guard is inert under vitest, where jsdom has no media; these run it as a browser
  would and hand it a video whose play() answers the way a browser's does.
*/
afterEach(() => {
  vi.unstubAllEnvs()
})

function videoAnswering(name: string): HTMLVideoElement {
  const video = document.createElement('video')
  video.play = () => Promise.reject(new DOMException('play() did not start', name))
  video.pause = () => undefined
  return video
}

async function playWith(name: string) {
  vi.stubEnv('MODE', 'production')
  const { result } = renderHook(() => useAutoplayGuard<HTMLVideoElement>())
  result.current.ref.current = videoAnswering(name)
  await act(async () => {
    result.current.play()
  })
  return result.current.blocked
}

describe('useAutoplayGuard', () => {
  it('falls back to the poster when the browser refuses autoplay', async () => {
    expect(await playWith('NotAllowedError')).toBe(true)
  })

  it('keeps the clip when a pause interrupts its start, so Resume can play it', async () => {
    // pause() while play() is still pending rejects that play with an AbortError; that is
    // the visitor's Pause (or the clip leaving the screen), not a refusal
    expect(await playWith('AbortError')).toBe(false)
  })
})
