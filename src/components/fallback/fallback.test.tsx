import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SeamSchematic } from './SeamSchematic'
import { CarryDiagram } from './CarryDiagram'
import { MovementPlot } from './MovementPlot'
import { slider } from '../../data/pitches/slider'
import { twelveSix } from '../../data/pitches/twelve-six-curveball'

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
  it('draws carry as shape, not a measured value', () => {
    const { getByText } = render(<CarryDiagram />)
    expect(getByText(/CARRY/)).toBeInTheDocument()
  })
})

describe('MovementPlot (the catcher-eye break plot)', () => {
  it('describes a curveball as a drop below a spinless ball', () => {
    const { container } = render(<MovementPlot motion={twelveSix.motion} pitchName="curveball" />)
    const svg = container.querySelector('svg[role="img"]')
    expect(svg).toBeTruthy()
    expect(svg?.getAttribute('aria-label')).toMatch(/drops/)
    expect(svg?.getAttribute('aria-label')).not.toMatch(/inches/)
  })

  it('describes the gyro slider by direction, not magnitude', () => {
    const { container } = render(<MovementPlot motion={slider.motion} pitchName="slider" />)
    const svg = container.querySelector('svg[role="img"]')
    expect(svg).toBeTruthy()
    expect(svg?.getAttribute('aria-label')).toMatch(/sweeps glove-side/)
    expect(svg?.getAttribute('aria-label')).not.toMatch(/inches/)
  })
})
