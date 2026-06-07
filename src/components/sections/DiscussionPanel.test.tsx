import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiscussionPanel } from './DiscussionPanel'
import { useDiscussion, type UseDiscussion } from '../../hooks/useDiscussion'

vi.mock('../../hooks/useDiscussion', () => ({
  useDiscussion: vi.fn(),
}))

const baseDiscussion: UseDiscussion = {
  status: 'ready',
  error: null,
  posts: [],
  displayName: '',
  acceptedTerms: false,
  count: 0,
  refresh: vi.fn(),
  submit: vi.fn(),
  acceptTerms: vi.fn(),
  reportTarget: vi.fn(),
  remove: vi.fn(),
}

describe('DiscussionPanel', () => {
  it('stays collapsed by default and opens into an empty state', async () => {
    const user = userEvent.setup()
    vi.mocked(useDiscussion).mockReturnValue(baseDiscussion)

    render(<DiscussionPanel topicKey="pitch:four-seam" topicName="Four-seam fastball" />)

    expect(screen.getByRole('button', { name: /discussion/i })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('No comments yet')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /discussion/i }))

    expect(screen.getByText('No comments yet')).toBeInTheDocument()
    expect(screen.getByText(/Start the thread with a grip cue/)).toBeInTheDocument()
  })

  it('renders the error state with a retry action', async () => {
    vi.mocked(useDiscussion).mockReturnValue({
      ...baseDiscussion,
      status: 'error',
      error: 'Supabase unavailable',
    })

    render(<DiscussionPanel topicKey="pitch:four-seam" topicName="Four-seam fastball" />)
    await userEvent.click(screen.getByRole('button', { name: /discussion/i }))

    expect(screen.getByText('Could not load the discussion.')).toBeInTheDocument()
    expect(screen.getByText('Supabase unavailable')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })
})
