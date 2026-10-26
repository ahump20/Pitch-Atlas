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
    const text = (container.textContent ?? '').toUpperCase()
    for (const label of ['SHOULDER · 49 IN', 'CHEST · 41 IN', 'BELT · 31 IN', 'FRONT KNEE · 15 IN']) expect(text).toContain(label)
    expect(text).toContain('OVER THE PLATE · 20 IN')
    expect(text).toContain('BARREL · 44 IN HIGH · 31 IN OUT FRONT')
    expect(text).toContain('YOUR PITCH · 6–37 IN')
    expect(text).toMatch(/STRIKE · -?\d+–\d+ IN/)
    expect(text).not.toMatch(/NAN|UNDEFINED|\[OBJECT OBJECT\]/)
    expect(container.querySelector('polyline')?.getAttribute('points')).toBeTruthy()
  })

  it('drops the shoulder-to-knee zone under Senior rules', () => {
    const { container } = render(<FlightLabSchematic model={model('senior')} />)
    const text = (container.textContent ?? '').toUpperCase()
    expect(text).not.toContain('SHOULDER')
    expect(text).toContain('BELT · 31 IN')
  })
})
