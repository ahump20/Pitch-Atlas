import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SourceBadge } from './SourceBadge'
import { ConfidenceLabel } from './ConfidenceLabel'
import { SourcedValue } from './SourcedValue'
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

describe('SourcedValue', () => {
  it('prefixes and tags an approximate value', () => {
    const claim: Claim<string> = {
      value: '2,300 rpm',
      source,
      confidence: 'reputable-analysis',
      approximate: true,
      note: 'era-dependent baseline',
    }
    render(<SourcedValue claim={claim} />)
    expect(screen.getByText(/2,300 rpm/)).toBeInTheDocument()
    expect(screen.getByText('approx')).toBeInTheDocument()
    expect(screen.getByText(/era-dependent baseline/)).toBeInTheDocument()
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
