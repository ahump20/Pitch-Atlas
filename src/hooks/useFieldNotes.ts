import { useCallback, useEffect, useState } from 'react'
import {
  claimWithEmail,
  getIdentity,
  listNotes,
  reportNote,
  setHelpful,
  setTried,
  submitNote,
  type CommunityIdentity,
  type CommunityNote,
  type NewFieldNote,
} from '../lib/community'
import { dispatchBlazeEvent } from '../components/companions/blazeMotion'

export type FieldNotesStatus = 'loading' | 'error' | 'ready'

export interface UseFieldNotes {
  status: FieldNotesStatus
  error: string | null
  notes: CommunityNote[]
  identity: CommunityIdentity | null
  refresh: () => void
  submit: (input: NewFieldNote) => Promise<CommunityNote>
  toggleTried: (noteId: string) => Promise<void>
  toggleHelpful: (noteId: string) => Promise<void>
  report: (noteId: string, reason: string) => Promise<void>
  claim: (email: string) => Promise<void>
}

function message(err: unknown): string {
  if (err instanceof Error) return err.message
  return 'Something went wrong talking to the server.'
}

/*
  Drives the live Field Notes for one pitch: loads the ranked notes and the
  contributor's identity, and exposes optimistic Tried This / Helpful toggles
  that revert on failure. Re-loads when the selected pitch changes. The view
  branches on `status` for loading / error / empty / ready.

  Reading never signs anyone in — the anon role's SELECT grants serve the public
  set, and a visitor without a session just sees no viewer flags. The anonymous
  account is minted on write intent only (post / mark / report), inside the
  data-layer functions themselves.

  `enabled` gates the whole thing. While the community layer is a preview, or in
  tests, the hook makes NO Supabase calls (no anonymous sign-in, no fetch), so a
  visitor who cannot use the loop never mints an account. It still runs (Rules of
  Hooks); it just sits idle at status 'ready' with no notes until the layer opens.
*/
export function useFieldNotes(pitchSlug: string, enabled = true): UseFieldNotes {
  const active = enabled && import.meta.env.MODE !== 'test'
  const [status, setStatus] = useState<FieldNotesStatus>(active ? 'loading' : 'ready')
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState<CommunityNote[]>([])
  const [identity, setIdentity] = useState<CommunityIdentity | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = useCallback(() => setReloadKey((k) => k + 1), [])

  const load = useCallback(
    async (isCancelled: () => boolean) => {
      setStatus('loading')
      setError(null)
      try {
        const [loadedNotes, loadedIdentity] = await Promise.all([listNotes(pitchSlug), getIdentity()])
        if (isCancelled()) return
        setNotes(loadedNotes)
        setIdentity(loadedIdentity)
        setStatus('ready')
      } catch (err) {
        if (isCancelled()) return
        setError(message(err))
        setStatus('error')
      }
    },
    [pitchSlug],
  )

  useEffect(() => {
    if (!active) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gated async load sets loading status; the effect early-returns when the community layer is inactive
    void load(() => cancelled)
    return () => {
      cancelled = true
    }
  }, [active, load, reloadKey])

  const reloadIdentity = useCallback(async () => {
    try {
      const next = await getIdentity()
      setIdentity(next)
    } catch {
      /* identity is a nicety; never block the loop on it */
    }
  }, [])

  const toggleEngagement = useCallback(
    async (noteId: string, kind: 'tried' | 'helpful', mutate: (noteId: string, on: boolean) => Promise<void>) => {
      const current = notes.find((n) => n.id === noteId)
      if (!current || current.viewerIsAuthor) return
      const wasOn = kind === 'tried' ? current.viewerTried : current.viewerHelpful

      // optimistic
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? {
                ...n,
                viewerTried: kind === 'tried' ? !wasOn : n.viewerTried,
                viewerHelpful: kind === 'helpful' ? !wasOn : n.viewerHelpful,
                adoptionCount: kind === 'tried' ? n.adoptionCount + (wasOn ? -1 : 1) : n.adoptionCount,
                helpfulCount: kind === 'helpful' ? n.helpfulCount + (wasOn ? -1 : 1) : n.helpfulCount,
              }
            : n,
        ),
      )

      try {
        await mutate(noteId, !wasOn)
        void reloadIdentity()
      } catch {
        // revert + resync from the server
        refresh()
      }
    },
    [notes, refresh, reloadIdentity],
  )

  const toggleTried = useCallback((noteId: string) => toggleEngagement(noteId, 'tried', setTried), [toggleEngagement])
  const toggleHelpful = useCallback(
    (noteId: string) => toggleEngagement(noteId, 'helpful', setHelpful),
    [toggleEngagement],
  )

  const submit = useCallback(
    async (input: NewFieldNote) => {
      try {
        const created = await submitNote(input)
        refresh()
        dispatchBlazeEvent({ mood: 'caught' })
        return created
      } catch (err) {
        dispatchBlazeEvent({ mood: 'concerned' })
        throw err
      }
    },
    [refresh],
  )

  const report = useCallback(async (noteId: string, reason: string) => {
    await reportNote(noteId, reason)
    dispatchBlazeEvent({ mood: 'still', ttlMs: 1200 })
  }, [])

  const claim = useCallback(
    async (email: string) => {
      await claimWithEmail(email)
      await reloadIdentity()
    },
    [reloadIdentity],
  )

  return { status, error, notes, identity, refresh, submit, toggleTried, toggleHelpful, report, claim }
}
