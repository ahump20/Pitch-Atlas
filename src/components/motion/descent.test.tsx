import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Descent } from './Descent'

/*
  The descent thread is decoration with the SeamGuide discipline: hidden from
  assistive tech, fully rendered in the DOM (the drop is a CSS clip wipe, never
  gated content), and driven by zero scroll JavaScript — without
  IntersectionObserver support the fallback settles landed immediately.
*/
describe('Descent', () => {
  it('renders a decorative, fully-present thread', () => {
    const { container } = render(<Descent />)
    const el = container.firstElementChild as HTMLElement
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(el.className).toContain('descent')
    // jsdom has no IntersectionObserver: the fallback settles landed, not hidden
    expect(el.className).toContain('is-landed')
    // hairline, ticks, and the open seam-point are all present
    expect(el.querySelector('.descent-line')).not.toBeNull()
    expect(el.querySelectorAll('.descent-ticks path').length).toBe(3)
    expect(el.querySelector('.descent-point')).not.toBeNull()
  })
})
