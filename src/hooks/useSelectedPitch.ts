import { useSyncExternalStore } from 'react'
import { PITCHES, pitchBySlug } from '../data/pitches'
import type { PitchAtlasEntry } from '../data/types'

/*
  The selected specimen lives in the URL hash as #/<slug>, so a pitch is
  deep-linkable and shareable. We subscribe to it with useSyncExternalStore,
  which reads an external source the idiomatic way and never sets state inside an
  effect. In-page anchors (#main, #foundation) use a leading word, not #/, so
  they are ignored here and never swap the pitch (see lib/scroll.ts).
*/
function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** Parse #/<slug> from the hash. Returns '' for in-page anchors or no hash. */
function readSlug(): string {
  if (typeof window === 'undefined') return ''
  const m = window.location.hash.match(/^#\/([^#?]+)/)
  return m ? decodeURIComponent(m[1]) : ''
}

export function useSelectedPitch(): PitchAtlasEntry {
  const slug = useSyncExternalStore(subscribe, readSlug, () => '')
  return pitchBySlug(slug) ?? PITCHES[0]
}
