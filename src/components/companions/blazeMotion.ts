export type BlazeMood =
  | 'idle'
  | 'chasing'
  | 'caught'
  | 'sniffing'
  | 'napping'
  | 'concerned'
  | 'still'
  | 'hidden'

export type BlazeCompanionEventType = Exclude<BlazeMood, 'idle' | 'hidden'>
export type BlazeReaction = 'none' | 'bark' | 'belly' | 'oops'
export type BlazeRoutePersona =
  | 'home-plate'
  | 'pitch-mound'
  | 'scorecard'
  | 'rosin-bag'
  | 'chalk-talk'
  | 'quiet'

export const BLAZE_STORAGE_KEY = 'pitchAtlas.showBlazeCompanion'
export const BLAZE_EVENT_NAME = 'pitch-atlas:blaze-event'
export const BLAZE_PREFERENCE_EVENT_NAME = 'pitch-atlas:blaze-preference'

export interface BlazeCompanionEventDetail {
  mood: BlazeCompanionEventType
  ttlMs?: number
  reaction?: Exclude<BlazeReaction, 'none'>
}

export interface BlazePreferenceEventDetail {
  enabled: boolean
}

declare global {
  interface WindowEventMap {
    [BLAZE_EVENT_NAME]: CustomEvent<BlazeCompanionEventDetail>
    [BLAZE_PREFERENCE_EVENT_NAME]: CustomEvent<BlazePreferenceEventDetail>
  }
}

export function clampScrollProgress(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export function moodForPath(pathname: string): BlazeMood {
  const seriousFlow = /\/(account|block|delete|delete-account|privacy|report)(\/|$)/.test(pathname)
  if (seriousFlow || pathname === '/sources') return 'hidden'
  if (
    pathname === '/sandbox' ||
    pathname === '/movement-map' ||
    pathname === '/compare' ||
    pathname === '/kinetic-chain' ||
    pathname === '/classify'
  ) {
    return 'still'
  }
  if (pathname.startsWith('/pitch/') || /^\/repertoire\/[^/]+/.test(pathname)) return 'chasing'
  if (pathname === '/repertoire' || pathname === '/grips') return 'hidden'
  if (pathname === '/') return 'sniffing'
  if (pathname.includes('delete') || pathname.includes('report') || pathname.includes('privacy')) return 'hidden'
  return 'idle'
}

export function personaForPath(pathname: string): BlazeRoutePersona {
  if (pathname === '/') return 'home-plate'
  if (pathname.startsWith('/pitch/')) return 'pitch-mound'
  if (/^\/repertoire\/[^/]+/.test(pathname)) return 'scorecard'
  if (pathname.startsWith('/craftsmen')) return 'rosin-bag'
  if (
    pathname === '/sandbox' ||
    pathname === '/movement-map' ||
    pathname === '/compare' ||
    pathname === '/kinetic-chain' ||
    pathname === '/classify'
  ) {
    return 'chalk-talk'
  }
  return 'quiet'
}

export function reactionForMood(mood: BlazeMood): BlazeReaction {
  if (mood === 'caught') return 'belly'
  if (mood === 'concerned') return 'oops'
  return 'none'
}

export function reduceMoodForMotion(mood: BlazeMood, reducedMotion: boolean): BlazeMood {
  if (!reducedMotion) return mood
  if (mood === 'hidden') return mood
  if (mood === 'concerned' || mood === 'still') return mood
  return 'still'
}

export function initialBlazePreference(storage: Storage | undefined): boolean {
  if (!storage) return true
  const stored = storage.getItem(BLAZE_STORAGE_KEY)
  return stored === null ? true : stored !== 'false'
}

export function dispatchBlazeEvent(detail: BlazeCompanionEventDetail): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(BLAZE_EVENT_NAME, { detail }))
}

export function dispatchBlazePreference(enabled: boolean): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(BLAZE_PREFERENCE_EVENT_NAME, { detail: { enabled } }))
}
