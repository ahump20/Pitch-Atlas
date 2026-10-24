import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_STANCE } from '../../lib/slowpitch'
import { FlightLabSchematic } from './FlightLabSchematic'
import { buildLabModel, defaultLobParams } from './model'

/*
  The no-WebGL page: the schematic must draw the default batter's zone, the
  lob's marks and the look-for window in jsdom (no ResizeObserver, no canvas),
  with no failure signatures in what a visitor reads.
*/

function model(rule: 'usssa' | 'senior' = 'usssa') {
  return buildLabModel({ rule, stance: { ...DEFAULT_STANCE }, compareIn: 32, params: defaultLobParams(), selected: 'belt' })
}

describe('FlightLabSchematic', () => {
  it('renders the default batter’s zone, marks and window', () => {
    const { container } = render(<FlightLabSchematic model={model()} />)
    const svg = screen.getByRole('img')
    expect(svg.getAttribute('aria-label')).toMatch(/5 ft 2 in batter/)
    expect(svg.getAttribute('aria-label')).toMatch(/20 in high over the plate/)
    const text = container.textContent ?? ''
    for (const label of ['Shoulder · 49 in', 'Chest · 41 in', 'Belt · 31 in', 'Front knee · 15 in']) expect(text).toContain(label)
    expect(text).toContain('Over the plate · 20 in')
    expect(text).toContain('Barrel · 44 in high · 31 in out front')
    expect(text).toContain('Your pitch · 6–37 in')
    expect(text).toMatch(/Strike · -?\d+–\d+ in/)
    expect(text).not.toMatch(/NaN|undefined|\[object Object\]/)
    expect(container.querySelector('polyline')?.getAttribute('points')).toBeTruthy()
  })

  it('drops the shoulder-to-knee zone under Senior rules', () => {
    const { container } = render(<FlightLabSchematic model={model('senior')} />)
    const text = container.textContent ?? ''
    expect(text).not.toContain('Shoulder')
    expect(text).toContain('Belt · 31 in')
  })
})
