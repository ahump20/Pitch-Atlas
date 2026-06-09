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

export function normalizeBlazePath(pathname: string): string {
  if (pathname === '/') return '/'
  return pathname.replace(/\/+$/, '')
}

export function moodForPath(pathname: string): BlazeMood {
  const path = normalizeBlazePath(pathname)
  const seriousFlow = /\/(account|block|delete|delete-account|privacy|report)(\/|$)/.test(path)
  if (seriousFlow || path === '/sources') return 'hidden'
  if (
    path === '/sandbox' ||
    path === '/movement-map' ||
    path === '/compare' ||
    path === '/kinetic-chain' ||
    path === '/classify'
  ) {
    return 'still'
  }
  if (path.startsWith('/pitch/') || /^\/repertoire\/[^/]+/.test(path)) return 'chasing'
  if (path === '/repertoire' || path === '/grips') return 'hidden'
  if (path === '/') return 'sniffing'
  if (path.includes('delete') || path.includes('report') || path.includes('privacy')) return 'hidden'
  return 'idle'
}

export function personaForPath(pathname: string): BlazeRoutePersona {
  const path = normalizeBlazePath(pathname)
  if (path === '/') return 'home-plate'
  if (path.startsWith('/pitch/')) return 'pitch-mound'
  if (/^\/repertoire\/[^/]+/.test(path)) return 'scorecard'
  if (path.startsWith('/craftsmen')) return 'rosin-bag'
  if (
    path === '/sandbox' ||
    path === '/movement-map' ||
    path === '/compare' ||
    path === '/kinetic-chain' ||
    path === '/classify'
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
