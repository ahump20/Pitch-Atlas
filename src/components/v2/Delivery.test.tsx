import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DeliveryFigure } from './Delivery'

/*
  The chapter pitcher starts on its held phase, so the prerendered page and the
  hydrated one agree, then steps one frame at a time to its own phase. Reduced
  motion lands there without stepping. jsdom has no IntersectionObserver, so the
  reveal counts the figure as seen straight away.
*/
const frame = (el: HTMLElement) => el.querySelector('use')?.getAttribute('href')?.split('#')[1]

function preferReducedMotion(reduced: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: reduced && query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  })
}

describe('DeliveryFigure', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('steps from its held phase to its own, one frame at a time', () => {
    preferReducedMotion(false)
    const { container } = render(<DeliveryFigure from={3} to={5} />)
    expect(frame(container)).toBe('f3')
    act(() => vi.advanceTimersByTime(90))
    expect(frame(container)).toBe('f4')
    act(() => vi.advanceTimersByTime(90))
    expect(frame(container)).toBe('f5')
    act(() => vi.advanceTimersByTime(500))
    expect(frame(container)).toBe('f5')
  })

  it('lands on its phase without stepping under reduced motion', () => {
    preferReducedMotion(true)
    const { container } = render(<DeliveryFigure from={7} to={10} />)
    act(() => vi.advanceTimersByTime(0))
    expect(frame(container)).toBe('f10')
  })
})
