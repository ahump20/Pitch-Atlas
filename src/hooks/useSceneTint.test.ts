import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSceneTint } from './useSceneTint'

/*
  The scene-tint driver only ever writes a CSS custom property — it must be
  inert where IntersectionObserver is missing (jsdom, old browsers) and must
  leave no property behind on unmount, so a route change never strands a stale
  chapter tint on <html>.
*/
describe('useSceneTint', () => {
  afterEach(() => document.documentElement.style.removeProperty('--scene-tint'))

  it('is inert without IntersectionObserver and cleans up after itself', () => {
    const el = document.createElement('section')
    el.setAttribute('data-scene-tint', '#37D6FF')
    document.body.appendChild(el)
    const { unmount } = renderHook(() => useSceneTint())
    expect(document.documentElement.style.getPropertyValue('--scene-tint')).toBe('')
    unmount()
    expect(document.documentElement.style.getPropertyValue('--scene-tint')).toBe('')
    el.remove()
  })
})
