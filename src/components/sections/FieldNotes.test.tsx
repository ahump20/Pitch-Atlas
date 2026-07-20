import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PITCHES } from '../../data/pitches'
import { useFieldNotes, type UseFieldNotes } from '../../hooks/useFieldNotes'
import type { CommunityNote } from '../../lib/community'
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

const liveEntry = {
  ...PITCHES[0],
  community: { ...PITCHES[0].community, enabled: true },
}

const filedNote: CommunityNote = {
  id: 'note-1',
  pitchSlug: PITCHES[0].display.slug,
  authorId: 'author-1',
  displayName: 'RHP_threequarter',
  tweak: 'Thumb tucked deeper under the leather.',
  playerLevel: 'college-plus',
  armSlot: 'three-quarter',
  velocityBand: null,
  intent: 'more-movement',
  claimedResultKind: 'worked-in-bullpen',
  claimedResultNote: null,
  sampleSize: null,
  evidenceUrl: null,
  evidenceLabel: null,
  sourceTier: 'community-firsthand',
  note: null,
  adoptionCount: 3,
  helpfulCount: 2,
  baseRank: 5,
  createdAt: '2026-06-01T00:00:00Z',
  viewerTried: false,
  viewerHelpful: false,
  viewerIsAuthor: false,
}

describe('FieldNotes', () => {
  it('requires context for an unverified field note', async () => {
    vi.mocked(useFieldNotes).mockReturnValue(baseFieldNotes)

    render(<FieldNotes entry={liveEntry} />)

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

    render(<FieldNotes entry={liveEntry} />)

    fireEvent.click(screen.getByRole('button', { name: /write a note/i }))
    fireEvent.change(screen.getByLabelText(/the tweak/i), {
      target: { value: 'Thumb tucked deeper under the leather.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /file field note/i }))

    expect(await screen.findByText(/sent for review.*stays private until approved/i)).toBeInTheDocument()
    expect(screen.queryByText(/your note is live below/i)).not.toBeInTheDocument()
  })

  it('shows a reserved loading surface while public notes load', () => {
    vi.mocked(useFieldNotes).mockReturnValue({ ...baseFieldNotes, status: 'loading' })

    const { container } = render(<FieldNotes entry={liveEntry} />)

    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(3)
  })

  it('shows a recoverable error surface', () => {
    const refresh = vi.fn()
    vi.mocked(useFieldNotes).mockReturnValue({
      ...baseFieldNotes,
      status: 'error',
      error: 'permission denied',
      refresh,
    })

    render(<FieldNotes entry={liveEntry} />)

    expect(screen.getByText(/permission denied/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(refresh).toHaveBeenCalledOnce()
  })

  it('names the honest empty state', () => {
    vi.mocked(useFieldNotes).mockReturnValue(baseFieldNotes)

    render(<FieldNotes entry={liveEntry} />)

    expect(screen.getByRole('heading', { name: /no field notes filed yet/i })).toBeInTheDocument()
    expect(screen.getByText('0 notes')).toBeInTheDocument()
  })

  it('renders populated notes and real counts', () => {
    vi.mocked(useFieldNotes).mockReturnValue({ ...baseFieldNotes, notes: [filedNote] })

    render(<FieldNotes entry={liveEntry} />)

    expect(screen.getByText(filedNote.tweak)).toBeInTheDocument()
    expect(screen.getByText('1 note')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tried this.*3/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /helpful.*2/i })).toBeInTheDocument()
  })
})
