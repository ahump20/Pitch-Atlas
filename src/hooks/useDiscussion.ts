import { useCallback, useEffect, useState } from 'react'
import { getIdentity } from '../lib/community'
import { dispatchBlazeEvent } from '../components/companions/blazeMotion'
import {
  acceptMediaTerms,
  createPost,
  deletePost,
  hasAcceptedMediaTerms,
  listThread,
  reportMedia,
  reportPost,
  uploadMedia,
  type DiscussionPost,
} from '../lib/discussion'

export type DiscussionStatus = 'idle' | 'loading' | 'error' | 'ready'

export interface SubmitInput {
  displayName: string
  body: string
  files: File[]
  parentId?: string | null
}

export interface SubmitResult {
  ok: true
  /** Present only when the post saved but one or more files failed to attach.
      A non-blocking notice — the comment is live and the composer may clear. */
  mediaError?: string
}

export interface UseDiscussion {
  status: DiscussionStatus
  error: string | null
  posts: DiscussionPost[]
  displayName: string
  acceptedTerms: boolean
  count: number
  refresh: () => void
  submit: (input: SubmitInput) => Promise<SubmitResult>
  acceptTerms: () => Promise<void>
  reportTarget: (target: { postId: string } | { mediaId: string }, reason: string) => Promise<void>
  remove: (postId: string) => Promise<void>
}

function message(err: unknown): string {
  if (err instanceof Error) return err.message
  return 'Something went wrong talking to the server.'
}

function countThread(posts: DiscussionPost[]): number {
  return posts.reduce((n, p) => n + 1 + p.replies.length, 0)
}

/*
  Drives one topic's discussion. Lazy: it makes no Supabase call until the panel is
  opened (`open` true), so a collapsed drop-down on a fast page fetches nothing.
  Opening it loads the thread, the viewer's handle, and whether they have accepted
  the upload terms — all as anonymous reads that never sign anyone in (the account
  is minted on write intent only, inside the data layer). Submit creates the post
  then uploads any attached media, surfacing a friendly error if a file is rejected.
*/
export function useDiscussion(topicKey: string, open: boolean): UseDiscussion {
  const [status, setStatus] = useState<DiscussionStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [posts, setPosts] = useState<DiscussionPost[]>([])
  const [displayName, setDisplayName] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = useCallback(() => setReloadKey((k) => k + 1), [])

  const load = useCallback(async (isCancelled: () => boolean) => {
    setStatus('loading')
    setError(null)
    try {
      const [thread, identity, accepted] = await Promise.all([
        listThread(topicKey),
        getIdentity(),
        hasAcceptedMediaTerms(),
      ])
      if (isCancelled()) return
      setPosts(thread)
      setDisplayName((prev) => prev || identity?.displayName || '')
      setAcceptedTerms(accepted)
      setStatus('ready')
    } catch (err) {
      if (isCancelled()) return
      setError(message(err))
      setStatus('error')
    }
  }, [topicKey])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lazy thread load; runs only after the panel opens
    void load(() => cancelled)
    return () => {
      cancelled = true
    }
  }, [open, load, reloadKey])

  const submit = useCallback(
    async ({ displayName: name, body, files, parentId }: SubmitInput): Promise<SubmitResult> => {
      // createPost throws on a real failure — the composer keeps the draft and
      // shows that error. It is intentionally NOT wrapped here, so the only thing
      // a caller's catch sees is a genuine post-creation failure.
      const postId = await createPost({ topicKey, displayName: name, body, parentId })
      setDisplayName(name)
      // Media is additive: the post is already saved, so a failed upload never
      // loses the comment. Collect every failure (not just the last) and report
      // how many of how many files didn't attach, with the reason. A partial
      // success RETURNS that notice instead of throwing — so the composer clears
      // behind a saved post and never invites a double-post.
      const mediaErrors: string[] = []
      for (const file of files) {
        try {
          await uploadMedia(postId, topicKey, file)
        } catch (err) {
          mediaErrors.push(message(err))
        }
      }
      refresh()
      if (mediaErrors.length > 0) {
        dispatchBlazeEvent({ mood: 'concerned' })
        const reasons = Array.from(new Set(mediaErrors)).join(' ')
        return {
          ok: true,
          mediaError:
            files.length === 1
              ? `Your comment posted, but the file didn't attach. ${reasons}`
              : `Your comment posted, but ${mediaErrors.length} of ${files.length} files didn't attach. ${reasons}`,
        }
      }
      dispatchBlazeEvent({ mood: 'caught' })
      return { ok: true }
    },
    [topicKey, refresh],
  )

  const acceptTerms = useCallback(async () => {
    await acceptMediaTerms()
    setAcceptedTerms(true)
  }, [])

  const reportTarget = useCallback(
    async (target: { postId: string } | { mediaId: string }, reason: string) => {
      if ('postId' in target) await reportPost(target.postId, reason)
      else await reportMedia(target.mediaId, reason)
      dispatchBlazeEvent({ mood: 'still', ttlMs: 1200 })
    },
    [],
  )

  const remove = useCallback(
    async (postId: string) => {
      await deletePost(postId)
      dispatchBlazeEvent({ mood: 'still', ttlMs: 1200 })
      refresh()
    },
    [refresh],
  )

  return {
    status,
    error,
    posts,
    displayName,
    acceptedTerms,
    count: countThread(posts),
    refresh,
    submit,
    acceptTerms,
    reportTarget,
    remove,
  }
}
