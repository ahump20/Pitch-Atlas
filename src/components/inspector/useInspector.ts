import { useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { pitchBySlug } from '../../data/pitches'
import type { GripView, Handedness } from '../../data/types'
import { useCompare } from '../compare/compareContext'
import type { Aspect, BenchPatch, InspectorApi, OpenOptions } from './inspectorContext'

/*
  `?inspect=<slug>` is the bench's state, so Back closes it and the link shares it.
  Beside it ride `with` (the partner), `aspect`, and the ball's `orientation` and
  `hand`, in the names /compare already uses (`view` belongs to the Pitch Index).

  Opening pushes one history entry and marks it in history state. Everything that
  changes what the open bench shows replaces that entry and keeps the mark. Closing
  goes back when the entry carries the mark, which it still does after Back returns to
  it from a chapter, so a reader never gains a stray entry. Without the mark (a shared
  link) closing rewrites the address in place. Only filed slugs are honoured, and a
  partner must be a different filed pitch.
*/
const ASPECTS: readonly Aspect[] = ['card', 'grip', 'release', 'flight']
const VIEWS: readonly GripView[] = ['top', 'side', 'thumb']
const BENCH_KEYS = ['inspect', 'with', 'aspect', 'orientation', 'hand'] as const

export interface BenchState {
  slug: string | null
  partner: string | null
  aspect: Aspect
  orientation: GripView | null
  hand: Handedness
}

function filed(raw: string | null | undefined): string | null {
  // the entry's own slug must match, so no crafted key is honoured
  return raw && pitchBySlug(raw)?.display?.slug === raw ? raw : null
}

function normalize(state: BenchState): BenchState {
  const partner = state.slug && state.partner && state.partner !== state.slug ? state.partner : null
  // the pair is about the hands; the card is one specimen's
  const aspect = partner && state.aspect === 'card' ? 'grip' : state.aspect
  return { ...state, partner, aspect }
}

export function readBench(params: URLSearchParams): BenchState {
  const aspect = params.get('aspect')
  const view = params.get('orientation')
  return normalize({
    slug: filed(params.get('inspect')),
    partner: filed(params.get('with')),
    aspect: ASPECTS.find((a) => a === aspect) ?? 'card',
    orientation: VIEWS.find((v) => v === view) ?? null,
    hand: params.get('hand') === 'left' ? 'left' : 'right',
  })
}

function writeBench(params: URLSearchParams, state: BenchState): URLSearchParams {
  const next = new URLSearchParams(params)
  for (const key of BENCH_KEYS) next.delete(key)
  if (!state.slug) return next
  next.set('inspect', state.slug)
  if (state.partner) next.set('with', state.partner)
  if (state.aspect !== 'card') next.set('aspect', state.aspect)
  if (state.orientation) next.set('orientation', state.orientation)
  if (state.hand === 'left') next.set('hand', 'left')
  return next
}

const same = (a: BenchState, b: BenchState) =>
  a.slug === b.slug && a.partner === b.partner && a.aspect === b.aspect && a.orientation === b.orientation && a.hand === b.hand

function isBenchEntry(state: unknown): boolean {
  return typeof state === 'object' && state !== null && (state as { bench?: unknown }).bench === true
}

export function useInspectorParam(): InspectorApi {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const compare = useCompare()
  const current = readBench(params)

  const commit = useCallback(
    (target: BenchState, push: boolean) => {
      // a chosen pair is also the comparison tray's pair, so it is waiting after Close
      if (target.slug && target.partner && compare && (compare.selection.a !== target.slug || compare.selection.b !== target.partner)) {
        compare.update({ a: target.slug, b: target.partner })
      }
      setParams(
        writeBench(params, target),
        push
          ? { preventScrollReset: true, state: { bench: true } }
          : { replace: true, preventScrollReset: true, state: location.state },
      )
    },
    [compare, location.state, params, setParams],
  )

  const open = useCallback(
    (next: string, options: OpenOptions = {}) => {
      const slug = filed(next)
      if (!slug) return
      const now = readBench(params)
      const target = normalize({
        slug,
        partner: filed(options.partner),
        aspect: options.aspect ?? 'card',
        orientation: now.slug ? now.orientation : null,
        hand: now.hand,
      })
      // a second click on what is already open changes nothing
      if (now.slug && same(now, target)) return
      commit(target, !now.slug)
    },
    [commit, params],
  )

  const set = useCallback(
    (patch: BenchPatch) => {
      const now = readBench(params)
      if (!now.slug) return
      const target = normalize({
        slug: patch.slug !== undefined ? filed(patch.slug) ?? now.slug : now.slug,
        partner: patch.partner !== undefined ? filed(patch.partner) : now.partner,
        aspect: patch.aspect ?? now.aspect,
        orientation: patch.orientation !== undefined ? patch.orientation : now.orientation,
        hand: patch.hand ?? now.hand,
      })
      if (!same(now, target)) commit(target, false)
    },
    [commit, params],
  )

  const close = useCallback(() => {
    if (isBenchEntry(location.state)) {
      navigate(-1)
      return
    }
    setParams(writeBench(params, { ...readBench(params), slug: null }), { replace: true, preventScrollReset: true })
  }, [location.state, navigate, params, setParams])

  return { ...current, open, set, close }
}
