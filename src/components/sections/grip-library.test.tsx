import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GripLibrary, SpecimenGrips } from './GripLibrary'
import { AUSTIN_GRIPS, CIRCLE_CHANGE_DISTINCTION } from '../../data/grips'

/*
  Gate: the circle change distinction. The data really carries no Austin grip
  photo or clip for the circle change, and the exact distinction copy renders
  wherever the entry's grip imagery is communicated — the library and the
  specimen page's evidence section.
*/

const circle = AUSTIN_GRIPS.find((g) => g.id === 'circle-change')

describe('circle change distinction', () => {
  it('the underlying data truly has no Austin grip photo or clip', () => {
    expect(circle).toBeDefined()
    expect(circle?.photos).toEqual([])
    expect(circle?.clip).toBeUndefined()
    expect(circle?.photoStatus).toBe('note-only')
  })

  it('the grip library renders the exact distinction copy', () => {
    render(
      <MemoryRouter>
        <GripLibrary />
      </MemoryRouter>,
    )
    expect(
      screen.getByText('Circle Changeup · Filed from external sources · No Austin grip photo'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "Austin's personal grip library excludes the circle change because his hand size could not form it cleanly.",
      ),
    ).toBeInTheDocument()
  })

  it('the specimen evidence section renders the exact distinction copy', () => {
    render(
      <MemoryRouter>
        <SpecimenGrips entry={circle} accentColor="#5FA27B" />
      </MemoryRouter>,
    )
    expect(screen.getByText(CIRCLE_CHANGE_DISTINCTION.marker)).toBeInTheDocument()
    expect(screen.getByText(CIRCLE_CHANGE_DISTINCTION.reason)).toBeInTheDocument()
  })
})
