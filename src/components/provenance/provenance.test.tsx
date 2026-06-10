import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SourceBadge } from './SourceBadge'
import { ConfidenceLabel } from './ConfidenceLabel'
import { SourcedValue } from './SourcedValue'
import { ClaimCard } from './ClaimCard'
import type { Claim } from '../../data/types'
import { SOURCES } from '../../data/sources'

const source = SOURCES['mlb-cole']

describe('SourceBadge', () => {
  it('renders a real outbound link that opens in a new tab safely', () => {
    render(<SourceBadge source={source} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', source.url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
  })
})

describe('ConfidenceLabel', () => {
  it('renders the official-data label', () => {
    render(<ConfidenceLabel confidence="official-data" />)
    expect(screen.getByText('Official data')).toBeInTheDocument()
  })

  it('paints the unverified level with the seam accent', () => {
    render(<ConfidenceLabel confidence="unverified" />)
    const outer = screen.getByText('Unverified').parentElement
    expect(outer?.className).toContain('text-seam')
  })
})

describe('ClaimCard', () => {
  it('files a claim with its subject link, canonical badge, and outbound source', () => {
    const claim: Claim<string> = {
      value: 'Fingers laid across the horseshoe seam, thumb underneath.',
      source,
      confidence: 'reputable-analysis',
    }
    render(
      <MemoryRouter>
        <ClaimCard claim={claim} subject="Four-seam · filed" to="/pitch/four-seam" />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Fingers laid across the horseshoe seam/)).toBeInTheDocument()
    // the badge wording comes from CONFIDENCE_META, never a parallel label map
    expect(screen.getByText('Reputable analysis')).toBeInTheDocument()
    const subjectLink = screen.getByRole('link', { name: /Four-seam · filed/ })
    expect(subjectLink).toHaveAttribute('href', '/pitch/four-seam')
    const outbound = screen.getByRole('link', { name: (n) => n.includes(source.label) })
    expect(outbound).toHaveAttribute('target', '_blank')
  })

  it('keeps the explanatory note visible on a weak claim', () => {
    const claim: Claim<string> = {
      value: 'A relayed figure.',
      confidence: 'unverified',
      note: 'No source corroborated this value this run.',
    }
    render(
      <MemoryRouter>
        <ClaimCard claim={claim} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Unverified')).toBeInTheDocument()
    expect(screen.getByText(/No source corroborated this value/)).toBeInTheDocument()
  })
})

describe('SourcedValue', () => {
  it('prefixes and tags an approximate value', () => {
    const claim: Claim<string> = {
      value: 'roughly the standard grip window',
      source,
      confidence: 'reputable-analysis',
      approximate: true,
      note: 'varies by hand size and source description',
    }
    render(<SourcedValue claim={claim} />)
    expect(screen.getByText(/roughly the standard grip window/)).toBeInTheDocument()
    expect(screen.getByText('approx')).toBeInTheDocument()
    expect(screen.getByText(/varies by hand size/)).toBeInTheDocument()
  })

  it('renders a secondhand-attributed claim with its note', () => {
    const claim: Claim<string> = {
      value: 'Someone said something',
      source,
      confidence: 'secondhand-attributed',
      note: 'relayed by a secondary source',
    }
    render(<SourcedValue claim={claim} />)
    expect(screen.getByText('Secondhand, attributed')).toBeInTheDocument()
    expect(screen.getByText(/relayed by a secondary source/)).toBeInTheDocument()
  })
})
