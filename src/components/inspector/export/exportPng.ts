import type { PitchAtlasEntry } from '../../../data/types'
import { createComposer, loadCardFonts, resolveStageMedia } from './composeCard'
import { exportEligibility } from './eligibility'
import { poseCard, poseDimensions } from './poseCard'
import type { ExportFace, ExportRequest } from './types'

/*
  The PNG: the card at 1500 pixels wide, composed and posed offscreen, encoded, and
  handed back as a Blob for the panel to download. Fonts and media are awaited first
  so the first export is as crisp as the tenth.
*/

export const PNG_CARD_WIDTH = 1500

/** The caption plate's text: who this is, where it came from, where to find it. */
export function captionFor(entry: PitchAtlasEntry, face: ExportFace): string {
  const { canonical, display } = entry
  const eligibility = exportEligibility(entry, face)
  return [
    'Pitch Atlas',
    `Filed specimen ${display.specimenNo}${face === 'back' ? ' · Sources' : ''}`,
    canonical.name,
    eligibility.attribution,
    `pitch-atlas.com/pitch/${display.slug}`,
  ]
    .filter(Boolean)
    .join(' · ')
}

export function exportFilename(entry: PitchAtlasEntry, face: ExportFace, ext: 'png' | 'webm'): string {
  return `pitch-atlas-${entry.display.slug}-${entry.display.specimenNo}-${face}.${ext}`
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export async function exportSpecimenPng(req: ExportRequest): Promise<Blob> {
  const eligibility = exportEligibility(req.entry, req.face)
  if (!eligibility.exportable) throw new Error(eligibility.reason ?? 'This face cannot be exported.')
  await loadCardFonts()
  const media = req.face === 'front' ? await resolveStageMedia(req.stage) : null
  const composer = createComposer({
    entry: req.entry,
    face: req.face,
    material: req.face === 'front' ? req.material : req.backMaterial,
    width: PNG_CARD_WIDTH,
    media,
  })
  try {
    const face = document.createElement('canvas')
    face.width = composer.layout.width
    face.height = composer.layout.height
    const faceCtx = face.getContext('2d')
    if (!faceCtx) throw new Error('A drawing surface could not be created.')
    composer.draw(faceCtx, req.pose, req.light)

    const dims = poseDimensions(face.width, face.height)
    const out = document.createElement('canvas')
    out.width = dims.width
    out.height = dims.height
    const outCtx = out.getContext('2d')
    if (!outCtx) throw new Error('A drawing surface could not be created.')
    poseCard(outCtx, face, {
      pose: req.pose,
      backdrop: req.backdrop,
      caption: captionFor(req.entry, req.face),
      gold: req.entry.display.specimenNo === '00' && req.face === 'front',
    })
    return await new Promise<Blob>((resolve, reject) => {
      out.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The PNG could not be encoded.'))), 'image/png')
    })
  } finally {
    composer.dispose()
  }
}
