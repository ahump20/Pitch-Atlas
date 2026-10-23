import type { PitchAtlasEntry } from '../../../data/types'
import type { CardMaterial } from '../../refractor/material/materialPresets'

/*
  The export contract the inspector calls. Everything painted onto an export comes
  from the pitch record or the grip library; the request only says which face, which
  finish, which pose and light, and which backdrop.
*/
export type ExportFace = 'front' | 'back'
export type ExportBackdrop = 'transparent' | 'void'

/** degrees, the same convention as useCardTilt (rotateX(ry) rotateY(rx)) */
export interface ExportPose {
  rx: number
  ry: number
}

/** x, y in 0..1 of the card; height in card widths; strength 0..2 */
export interface ExportLight {
  x: number
  y: number
  height: number
  strength: number
}

export interface ExportRequest {
  entry: PitchAtlasEntry
  face: ExportFace
  material: CardMaterial
  backMaterial: CardMaterial
  pose: ExportPose
  light: ExportLight
  backdrop: ExportBackdrop
  /** the live stage on the page, if any, so the exported frame shows the same media the visitor sees */
  stage?: HTMLElement | null
  /** how the support check found the loop can be made, so the export does not ask the browser again */
  via?: WebmVerdict
}

export interface ExportProgress {
  phase: 'preparing' | 'rendering' | 'encoding' | 'done'
  fraction: number
}

/** How a loop can be made in this browser: its own encoder with the WebM codec it accepted
    at the export's frame size, or the live recorder with the WebM type it records. */
export type WebmVerdict = { path: 'encoder'; codec: 'vp9' | 'vp8' } | { path: 'recorder'; mimeType: string }

/** The quick answer carries no verdict (it has not asked the browser yet); the probe's always does. */
export type WebmSupport = { ok: true; via?: WebmVerdict } | { ok: false; reason: string }

/** A finished loop and how it was made: the browser's encoder keeps every frame for
    exactly seven seconds; the live recorder keeps the frames it had time for. */
export interface WebmResult {
  blob: Blob
  path: 'encoder' | 'recorder'
}

export interface Eligibility {
  exportable: boolean
  attribution: string
  reason?: string
}
