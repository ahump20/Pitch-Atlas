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
}

export interface ExportProgress {
  phase: 'preparing' | 'rendering' | 'encoding' | 'done'
  fraction: number
}

export type WebmSupport = { ok: true; mimeType: string } | { ok: false; reason: string }

export interface Eligibility {
  exportable: boolean
  attribution: string
  reason?: string
}
