import { useCallback, useEffect, useState } from 'react'
import {
  claimWithEmail,
  ensureSession,
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
  Drives the live Field Notes for one pitch: signs the visitor in anonymously,
  loads the ranked notes and the contributor's identity, and exposes optimistic
  Tried This / Helpful toggles that revert on failure. Re-loads when the selected
  pitch changes. The view branches on `status` for loading / error / empty / ready.

  `enabled` gates the whole thing. While the community layer is a preview the hook
  makes NO Supabase calls — no anonymous sign-in, no fetch — so a visitor who
  cannot use the loop never mints an account. It still runs (Rules of Hooks); it
  just sits idle until the layer is opened.
*/
export function useFieldNotes(pitchSlug: string, enabled = true): UseFieldNotes {
  const [status, setStatus] = useState<FieldNotesStatus>(enabled ? 'loading' : 'ready')
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState<CommunityNote[]>([])
  const [identity, setIdentity] = useState<CommunityIdentity | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setStatus('loading')
    setError(null)
    ;(async () => {
      try {
        await ensureSession()
        const [loadedNotes, loadedIdentity] = await Promise.all([listNotes(pitchSlug), getIdentity()])
        if (cancelled) return
        setNotes(loadedNotes)
        setIdentity(loadedIdentity)
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        setError(message(err))
        setStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [pitchSlug, reloadKey, enabled])

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
      const created = await submitNote(input)
      refresh()
      return created
    },
    [refresh],
  )

  const report = useCallback(async (noteId: string, reason: string) => {
    await reportNote(noteId, reason)
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
