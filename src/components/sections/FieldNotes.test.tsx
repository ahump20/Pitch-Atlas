import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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
    vi.mocked(useFieldNotes).mockReturnValue(baseFieldNotes)

    render(<FieldNotes entry={{ ...PITCHES[0], community: { ...PITCHES[0].community, enabled: true } }} />)

    fireEvent.click(screen.getByRole('button', { name: /write a note/i }))
    fireEvent.change(screen.getByLabelText(/submitted by/i), { target: { value: 'RHP_threequarter' } })
    fireEvent.change(screen.getByLabelText(/the tweak/i), { target: { value: 'Thumb tucked deeper under the leather.' } })

    fireEvent.click(screen.getByRole('combobox', { name: /source/i }))
    fireEvent.click(await screen.findByRole('option', { name: /a hunch - untested/i }))

    expect(screen.getByLabelText(/context \(required\)/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /file field note/i })).toBeDisabled()
  })

  it('tells the contributor that a new note stays private for review', async () => {
    const submit = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useFieldNotes).mockReturnValue({ ...baseFieldNotes, submit })

    render(<FieldNotes entry={{ ...PITCHES[0], community: { ...PITCHES[0].community, enabled: true } }} />)

    fireEvent.click(screen.getByRole('button', { name: /write a note/i }))
    fireEvent.change(screen.getByLabelText(/the tweak/i), {
      target: { value: 'Thumb tucked deeper under the leather.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /file field note/i }))

    expect(await screen.findByText(/sent for review.*stays private until approved/i)).toBeInTheDocument()
    expect(screen.queryByText(/your note is live below/i)).not.toBeInTheDocument()
  })
})
