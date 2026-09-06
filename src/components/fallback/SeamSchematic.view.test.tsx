import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PITCHES } from '../../data/pitches'
import { SeamSchematic } from './SeamSchematic'

describe('schematic study orientation', () => {
  it('changes the drawn geometry for side/thumb and restores the top view exactly', () => {
    const contacts = PITCHES[0].canonical.gripModel.contacts
    const props = { grip: contacts, referenceContacts: contacts, surface: 'stage' as const }
    const { container, rerender } = render(<SeamSchematic {...props} view="top" />)
    const paths = () => [...container.querySelectorAll('path')].map(path => path.getAttribute('d'))
    const top = paths()
    rerender(<SeamSchematic {...props} view="side" />)
    expect(paths()).not.toEqual(top)
    const side = paths()
    rerender(<SeamSchematic {...props} view="thumb" />)
    expect(paths()).not.toEqual(side)
    rerender(<SeamSchematic {...props} view="top" />)
    expect(paths()).toEqual(top)
  })
})
