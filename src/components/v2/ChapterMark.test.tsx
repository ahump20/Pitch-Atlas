import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChapterMark } from './ChapterMark'

/*
  The chapter mark's tick wears its chapter's scene tint when one is passed —
  the same accent the section publishes to the far stratum — and falls back to
  the refractor cyan class when none is. Both states must hold, or the mark
  and the room stop agreeing on whose chapter this is.
*/
describe('ChapterMark', () => {
  it('renders the plate number and chapter name', () => {
    render(<ChapterMark n="06" name="The Tools" />)
    expect(screen.getByText('06')).toBeInTheDocument()
    expect(screen.getByText('The Tools')).toBeInTheDocument()
  })

  it('tints the tick with the passed accent', () => {
    render(<ChapterMark n="06" name="The Tools" accent="#00A2A0" />)
    const tick = screen.getByText('■')
    expect(tick.getAttribute('style')).toContain('color: rgb(0, 162, 160)')
  })

  it('falls back to the cyan tick without an accent', () => {
    render(<ChapterMark n="01" name="The Mission" />)
    const tick = screen.getByText('■')
    expect(tick.className).toContain('text-cyan')
    expect(tick.getAttribute('style')).toBeNull()
  })
})
