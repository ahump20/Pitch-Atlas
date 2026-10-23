import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiscussionPanel } from './DiscussionPanel'
import { useDiscussion, type UseDiscussion } from '../../hooks/useDiscussion'
import { friendlyReadError } from '../../lib/discussion'

const toast = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}))

vi.mock('../../hooks/useDiscussion', () => ({
  useDiscussion: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast,
}))

const baseDiscussion: UseDiscussion = {
  status: 'ready',
  error: null,
  posts: [],
  displayName: '',
  acceptedTerms: false,
  count: 0,
  refresh: vi.fn(),
  // submit resolves to the SubmitResult contract: { ok, mediaError? }
  submit: vi.fn().mockResolvedValue({ ok: true }),
  acceptTerms: vi.fn(),
  reportTarget: vi.fn(),
  remove: vi.fn(),
}

const LAZY_FORUM = { timeout: 30000 }

describe('DiscussionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('stays collapsed by default and opens into an empty state', async () => {
    const user = userEvent.setup()
    vi.mocked(useDiscussion).mockReturnValue(baseDiscussion)

    render(<DiscussionPanel topicKey="pitch:four-seam" topicName="Four-seam fastball" />)

    expect(screen.getByRole('button', { name: /discussion/i })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('No comments yet')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /discussion/i }))

    // The forum is code-split (React.lazy): a labelled skeleton holds while the
    // chunk loads, then the empty state lands. Flush the lazy import's microtask
    // so the suspended boundary resolves before we assert.
    expect(await screen.findByText('No specimens filed yet', {}, LAZY_FORUM)).toBeInTheDocument()
    expect(screen.getByText(/Start the file with a grip cue/)).toBeInTheDocument()
  })

  it('says one honest thing when the discussion cannot load', async () => {
    const refresh = vi.fn()
    // What the data layer hands the view when Supabase cannot be reached. It may
    // not reach the visitor.
    const failure = friendlyReadError({ message: 'TypeError: Failed to fetch' })
    vi.mocked(useDiscussion).mockReturnValue({ ...baseDiscussion, status: 'error', error: failure, refresh })

    render(<DiscussionPanel topicKey="pitch:four-seam" topicName="Four-seam fastball" />)
    await userEvent.click(screen.getByRole('button', { name: /discussion/i }))

    // Await the lazy forum chunk, then read its error state.
    const alert = await screen.findByRole('alert', {}, LAZY_FORUM)

    // One heading, and the failure said once.
    expect(within(alert).getByText('Could not load the discussion.')).toBeInTheDocument()
    expect(alert.textContent?.match(/could(?:n't| not) load/gi)).toHaveLength(1)

    // One short sentence: no echo of the error, no guess at cause or duration,
    // no doubled period, no "Try again" competing with the button below it.
    const description = alert.querySelector('[data-slot="alert-description"]')?.textContent?.trim() ?? ''
    expect(description).toMatch(/^[A-Z].*\.$/)
    expect(description.split(/(?<=[.!?])\s+/)).toHaveLength(1)
    expect(description).not.toContain('..')
    expect(description).not.toMatch(/hiccup|usually|passing|try again/i)
    expect(alert.textContent).not.toContain(failure)

    await userEvent.click(within(alert).getByRole('button', { name: /try again/i }))
    expect(refresh).toHaveBeenCalledOnce()
  })

  it('shows delete failures from the discussion data layer', async () => {
    const user = userEvent.setup()
    const remove = vi.fn().mockRejectedValue(
      new Error('That post has replies from other contributors, so it cannot be deleted.'),
    )
    vi.mocked(useDiscussion).mockReturnValue({
      ...baseDiscussion,
      posts: [
        {
          id: 'post-1',
          topicKey: 'pitch:four-seam',
          authorId: 'user-1',
          displayName: 'Austin',
          body: 'Seam cue question.',
          createdAt: '2026-06-15T08:00:00.000Z',
          viewerIsAuthor: true,
          media: [],
          replies: [],
        },
      ],
      count: 1,
      remove,
    })

    render(<DiscussionPanel topicKey="pitch:four-seam" topicName="Four-seam fastball" />)
    await user.click(screen.getByRole('button', { name: /discussion/i }))
    expect(await screen.findByText('Seam cue question.', {}, LAZY_FORUM)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    const deleteActions = screen.getAllByRole('button', { name: /^delete$/i })
    await user.click(deleteActions[deleteActions.length - 1])

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'That post has replies from other contributors, so it cannot be deleted.',
      )
    })
    expect(remove).toHaveBeenCalledWith('post-1')
  })

  it('renders uploaded media as a filed specimen card', async () => {
    const user = userEvent.setup()
    vi.mocked(useDiscussion).mockReturnValue({
      ...baseDiscussion,
      posts: [
        {
          id: 'post-1',
          topicKey: 'pitch:four-seam',
          authorId: 'user-1',
          displayName: 'Austin',
          body: 'Index finger pressure felt cleaner here.',
          createdAt: '2026-06-15T08:00:00.000Z',
          viewerIsAuthor: false,
          media: [
            {
              id: 'media-abc123',
              kind: 'image',
              url: 'https://media.example/four-seam.jpg',
              width: 640,
              height: 480,
            },
          ],
          replies: [],
        },
      ],
      count: 1,
    })

    render(<DiscussionPanel topicKey="pitch:four-seam" topicName="Four-seam fastball" />)
    await user.click(screen.getByRole('button', { name: /discussion/i }))

    expect(await screen.findByText('Image specimen', {}, LAZY_FORUM)).toBeInTheDocument()
    expect(screen.getByText('Four-seam fastball')).toBeInTheDocument()
    expect(screen.getByText(/PA-FOUR-20260615-MEDIAA/)).toBeInTheDocument()
    expect(screen.getByText(/Filed by Austin/)).toBeInTheDocument()
    expect(screen.getByAltText('Four-seam fastball specimen uploaded by Austin')).toHaveAttribute(
      'src',
      'https://media.example/four-seam.jpg',
    )
  })
})
