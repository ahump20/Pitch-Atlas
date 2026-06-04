import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SeamSchematic } from './SeamSchematic'
import { CarryDiagram } from './CarryDiagram'

describe('SeamSchematic (the no-WebGL visual)', () => {
  it('renders an accessible svg built from the seam curve', () => {
    const { container } = render(<SeamSchematic />)
    const svg = container.querySelector('svg[role="img"]')
    expect(svg).toBeTruthy()
    expect((svg?.getAttribute('aria-label') ?? '').length).toBeGreaterThan(10)
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0)
  })
})

describe('CarryDiagram (the gravity ghost in 2D)', () => {
  it('draws the induced vertical break value with an approximate marker', () => {
    const { getByText } = render(<CarryDiagram ivbInches={16} approximate />)
    expect(getByText(/16 in IVB/)).toBeInTheDocument()
  })
})
