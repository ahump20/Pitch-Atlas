import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RefractionBridge } from './RefractionBridge'
import { PITCHES } from '../../data/pitches'

const featured = PITCHES.find((p) => p.display.specimenNo === '00') ?? PITCHES[0]

describe('RefractionBridge (the seam dissolve, taught)', () => {
  it('names the dissolve mechanism in plain words', () => {
    render(<RefractionBridge featured={featured} />)
    // the signature move only teaches if the page says, in words, that the 3D
    // ball and the flat diagram are one function, not two drawings. It is said
    // in more than one place (headline + prose), so match all of them.
    expect(screen.getAllByText(/one seam|same seam|single function/i).length).toBeGreaterThanOrEqual(1)
  })

  it('keeps the seam-informed label and never claims seam-accurate', () => {
    const { container } = render(<RefractionBridge featured={featured} />)
    expect(container.textContent).toMatch(/seam-informed schematic/i)
    expect(container.textContent).not.toMatch(/seam-accurate/i)
  })
})
