import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SeamGuide } from './SeamGuide'

/*
  The red thread is decoration with discipline: hidden from assistive tech,
  fully rendered in the DOM (the draw is a CSS wipe, never gated content), and
  driven by zero scroll JavaScript — without IntersectionObserver support the
  fallback resolves to the stitched state immediately.
*/
describe('SeamGuide', () => {
  it('renders a decorative, fully-present stitch row', () => {
    const { container } = render(<SeamGuide variant="tear" />)
    const guide = container.firstElementChild as HTMLElement
    expect(guide.getAttribute('aria-hidden')).toBe('true')
    expect(guide.className).toContain('seam-guide--tear')
    // jsdom has no IntersectionObserver: the fallback settles stitched, not hidden
    expect(guide.className).toContain('is-stitched')
    expect(container.querySelectorAll('path').length).toBeGreaterThan(10)
  })

  it.each(['underline', 'orbit'] as const)('renders the %s accent', (variant) => {
    const { container } = render(<SeamGuide variant={variant} />)
    const guide = container.firstElementChild as HTMLElement
    expect(guide.className).toContain(`seam-guide--${variant}`)
    expect(container.querySelectorAll('path').length).toBeGreaterThan(5)
  })
})
