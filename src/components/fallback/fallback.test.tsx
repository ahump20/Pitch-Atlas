import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SeamSchematic } from './SeamSchematic'
import { CarryDiagram } from './CarryDiagram'
import { MovementPlot } from './MovementPlot'
import { slider } from '../../data/pitches/slider'
import { twelveSix } from '../../data/pitches/twelve-six-curveball'
import { PITCHES } from '../../data/pitches'

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

describe('MovementPlot (the break plot, from the mound)', () => {
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

  // It draws ARM on the right for every pitch. A right-hander's arm side is the
  // third-base side: his right from the mound, a catcher's left. So the words name
  // a right-hander's view from the mound, and the drawing stays where it is.
  const readPlot = (motion: typeof slider.motion) => {
    const { container, unmount } = render(<MovementPlot motion={motion} pitchName="pitch" />)
    const svg = container.querySelector('svg[role="img"]')!
    const textX = (word: string) =>
      Number([...svg.querySelectorAll('text')].find((t) => t.textContent === word)!.getAttribute('x'))
    const balls = [...svg.querySelectorAll('circle[r="17"]')]
    const spinless = Number(balls.find((c) => c.getAttribute('stroke-dasharray'))!.getAttribute('cx'))
    const pitch = Number(balls.find((c) => c.getAttribute('fill')?.startsWith('url('))!.getAttribute('cx'))
    const read = {
      label: svg.getAttribute('aria-label')!,
      title: svg.querySelector('title')!.textContent,
      armRightOfGlove: textX('ARM') > textX('GLOVE'),
      offset: Math.sign(pitch - spinless),
    }
    unmount()
    return read
  }
  const twoSeam = PITCHES.find((p) => p.display.slug === 'two-seam')!

  it('names a right-hander’s view from the mound, never the catcher’s', () => {
    const { label, title } = readPlot(twoSeam.motion)
    expect(label).toMatch(/as a right-handed pitcher sees it from the mound/)
    expect(label).not.toMatch(/catcher/i)
    expect(title).toBe(label)
  })

  it('keeps the drawing: ARM on the right, an arm-side pitch right of the spinless ball, glove-side left', () => {
    const arm = readPlot(twoSeam.motion)
    expect(arm.armRightOfGlove).toBe(true)
    expect(arm.offset).toBe(1)
    expect(readPlot(slider.motion).offset).toBe(-1)
  })
})

describe('SeamSchematic grip silhouette (the sourced-grip honesty gate)', () => {
  const filed = PITCHES.find(
    (p) => p.canonical.gripModel.status === 'filed' && p.canonical.gripModel.contacts.length > 0,
  )

  it('draws labeled finger spines for a filed grip', () => {
    expect(filed).toBeTruthy()
    const { container } = render(
      <SeamSchematic
        grip={filed!.canonical.gripModel.contacts}
        handedness="right"
        surface="stage"
        showAxis={false}
        showStitches={false}
        title=""
      />,
    )
    expect(container.querySelectorAll('[data-grip-finger]').length).toBeGreaterThan(0)
  })

  it('draws no grip spines when the grip is empty (the unfiled state stays honest)', () => {
    const { container } = render(
      <SeamSchematic grip={[]} handedness="right" surface="stage" title="" />,
    )
    expect(container.querySelectorAll('[data-grip-finger]').length).toBe(0)
  })
})
