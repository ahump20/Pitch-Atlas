import { CONFIDENCE_META, type PitchAtlasEntry, type VisualReference } from '../../../data/types'
import { gripEntryFor } from '../../../data/grips'
import type { Eligibility, ExportFace } from './types'

/*
  What may leave the site as a file. The rights policy in docs/NORTHSTAR.md: first-party
  media and our own geometry ship freely; public-domain and licensed media ship with
  their attribution; anything linked-only or restricted stays on the page it was
  linked from. The back is the sourced record and always exports, with its sources
  named in the caption.
*/

function referenceAllowed(ref: VisualReference): boolean {
  if (ref.rights === 'original') return true
  if (ref.rights === 'public-domain' || ref.rights === 'licensed') return Boolean(ref.attribution || ref.kind === 'public-domain')
  return false
}

function referenceCredit(ref: VisualReference): string {
  if (ref.rights === 'original') return ref.attribution ? `Photo: ${ref.attribution}` : 'Photo: first-party'
  if (ref.rights === 'public-domain') return ref.attribution ? `Photo: ${ref.attribution}, public domain` : 'Photo: public domain'
  return ref.attribution ? `Photo: ${ref.attribution}` : 'Photo: licensed'
}

export function exportEligibility(entry: PitchAtlasEntry, face: ExportFace): Eligibility {
  const { canonical, display } = entry
  if (face === 'back') {
    const gripCue = canonical.gripDetails[0] ?? canonical.grip
    const shape = canonical.physics.shape
    const parts = [
      gripCue.source ? `Grip: ${gripCue.source.label}` : null,
      shape.source ? `Shape: ${shape.source.label}` : null,
    ].filter((p): p is string => Boolean(p))
    return { exportable: true, attribution: parts.join(' · ') || `Sourced record, specimen ${display.specimenNo}` }
  }

  const grip = gripEntryFor(display.slug)
  if (grip?.clip) {
    return { exportable: true, attribution: `Grip: Austin video, ${CONFIDENCE_META[grip.claimTier].label.toLowerCase()}` }
  }
  const photo = grip?.photos[0]
  if (photo) {
    if (!referenceAllowed(photo)) {
      return {
        exportable: false,
        attribution: '',
        reason: 'This grip photo is shown under terms that do not allow a copy to leave the page.',
      }
    }
    return { exportable: true, attribution: `${referenceCredit(photo)}, ${CONFIDENCE_META[grip.claimTier].label.toLowerCase()}` }
  }
  // no first-party media: the face is our own seam-informed schematic
  if (canonical.rights === 'linked-only' || canonical.rights === 'restricted') {
    return {
      exportable: false,
      attribution: '',
      reason: 'This specimen is filed under terms that do not allow a copy to leave the page.',
    }
  }
  const referenceClaim = canonical.gripDetails[0] ?? canonical.grip
  return {
    exportable: true,
    attribution: `Reference schematic, seam-informed · ${CONFIDENCE_META[referenceClaim.confidence].label.toLowerCase()}`,
  }
}
