import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SoftballProvenanceRow } from './SoftballProvenanceRow'
import { SOFTBALL_PITCHES } from '../../data/softball'
import { CONFIDENCE_META } from '../../data/types'
import { asOfDate } from '../../lib/format'
import type { Claim } from '../../data/types'

/*
  Gate: the softball provenance row renders all four fields from real data —
  claim type, canonical source tier, the source's real retrievedAt as "last
  checked", and the recorded open question. Missing date reads "not recorded";
  missing question reads "none on file". Nothing invented to fill a slot.
*/

const riseball = SOFTBALL_PITCHES.find((p) => p.slug === 'riseball')!
const fastball = SOFTBALL_PITCHES.find((p) => p.slug === 'fastball')!

describe('SoftballProvenanceRow', () => {
  it('renders the four fields from the riseball record', () => {
    render(
      <SoftballProvenanceRow
        claimType="Movement"
        claim={riseball.movement}
        openQuestion={riseball.openQuestion}
      />,
    )
    expect(screen.getByText('Movement')).toBeInTheDocument()
    expect(
      screen.getByText(CONFIDENCE_META[riseball.movement.confidence].label),
    ).toBeInTheDocument()
    // The date is the source's real retrievedAt — never typed in here.
    expect(riseball.movement.source).toBeDefined()
    expect(
      screen.getByText(`Last checked ${asOfDate(riseball.movement.source!.retrievedAt)}`),
    ).toBeInTheDocument()
    expect(
      screen.getByText(`Open question: ${riseball.openQuestion}`),
    ).toBeInTheDocument()
  })

  it('reads "none on file" when the data records no open question', () => {
    expect(fastball.openQuestion).toBeUndefined()
    render(
      <SoftballProvenanceRow claimType="Movement" claim={fastball.movement} />,
    )
    expect(screen.getByText('Open question: none on file')).toBeInTheDocument()
  })

  it('reads "not recorded" when a claim carries no checked date', () => {
    const weak: Claim<string> = {
      value: 'a relayed description with no registered source',
      confidence: 'unverified',
      note: 'no source corroborates this value',
    }
    render(<SoftballProvenanceRow claimType="Movement" claim={weak} />)
    expect(screen.getByText('Last checked not recorded')).toBeInTheDocument()
  })
})
