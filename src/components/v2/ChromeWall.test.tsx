import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ChromeWall } from './ChromeWall'

describe('ChromeWall (the filed set)', () => {
  it('keeps the specimen grade on every card front', () => {
    // The grade is the owner-confirmed read of how richly each specimen is
    // preserved. It must not be silently retired by a future pass.
    const { container } = render(
      <MemoryRouter>
        <ChromeWall />
      </MemoryRouter>,
    )
    expect(container.querySelectorAll('.rfx-grade').length).toBeGreaterThan(0)
  })

  it('surfaces the sourced grip silhouette on filed specimens', () => {
    const { container } = render(
      <MemoryRouter>
        <ChromeWall />
      </MemoryRouter>,
    )
    expect(container.querySelectorAll('.rfx-grip-twin').length).toBeGreaterThan(0)
  })

  it('groups specimens by family with a labeled header and count', () => {
    const { container } = render(
      <MemoryRouter>
        <ChromeWall />
      </MemoryRouter>,
    )
    const heads = container.querySelectorAll('.v2-family-head')
    expect(heads.length).toBeGreaterThanOrEqual(3) // fastball / breaking / offspeed
    const fastball = Array.from(heads).find((h) => /hard|fastball/i.test(h.textContent ?? ''))
    expect(fastball).toBeTruthy()
    // the gold chase (four-seam, specimen 00) lives inside the fastball group
    expect(fastball?.parentElement?.querySelector('.v2-mount.is-chase')).toBeTruthy()
  })
})
