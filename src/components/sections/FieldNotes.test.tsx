import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PITCHES } from '../../data/pitches'
import { useFieldNotes, type UseFieldNotes } from '../../hooks/useFieldNotes'
import { FieldNotes } from './FieldNotes'

vi.mock('../../hooks/useFieldNotes', () => ({
  useFieldNotes: vi.fn(),
}))

const baseFieldNotes: UseFieldNotes = {
  status: 'ready',
  error: null,
  notes: [],
  identity: {
    userId: 'anon-1',
    displayName: 'RHP',
    isClaimed: false,
    contributionScore: 0,
    notesCount: 0,
  },
  refresh: vi.fn(),
  submit: vi.fn(),
  toggleTried: vi.fn(),
  toggleHelpful: vi.fn(),
  report: vi.fn(),
  claim: vi.fn(),
}

describe('FieldNotes', () => {
  it('requires context for an unverified field note', async () => {
    const user = userEvent.setup()
    vi.mocked(useFieldNotes).mockReturnValue(baseFieldNotes)

    render(<FieldNotes entry={{ ...PITCHES[0], community: { ...PITCHES[0].community, enabled: true } }} />)

    await user.click(screen.getByRole('button', { name: /write a note/i }))
    await user.clear(screen.getByLabelText(/submitted by/i))
    await user.type(screen.getByLabelText(/submitted by/i), 'RHP_threequarter')
    await user.type(screen.getByLabelText(/the tweak/i), 'Thumb tucked deeper under the leather.')

    await user.click(screen.getByRole('combobox', { name: /source/i }))
    await user.click(await screen.findByRole('option', { name: /a hunch - untested/i }))

    expect(screen.getByLabelText(/context \(required\)/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /post field note/i })).toBeDisabled()
  })
})
