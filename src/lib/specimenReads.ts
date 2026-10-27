import type { GripContactModel, PitchAtlasEntry } from '../data/types'

/*
  The plain reads a specimen gives up, shared by the chapter and the bench so both
  say the same thing in the same words. Every one of them comes from the record;
  none of them is a number.
*/

/** The direction the pitch breaks, in words. */
export function shapeLabel(entry: PitchAtlasEntry): string {
  const m = entry.motion
  if (m.indeterminateBreak) return 'Erratic flutter'
  const v = m.verticalShape === 'ride' ? 'Rides' : m.verticalShape === 'drop' ? 'Drops' : 'Holds flat'
  const h = m.horizontalDir === 'arm-side' ? 'arm-side run' : m.horizontalDir === 'glove-side' ? 'glove-side sweep' : null
  return h ? `${v} · ${h}` : v
}

/** Hold, pressure, leave: the reference hand's three release cues. */
export function releaseSequence(entry: PitchAtlasEntry): { label: 'Hold' | 'Pressure' | 'Leave'; copy: string }[] {
  const gm = entry.canonical.gripModel
  return [
    { label: 'Hold', copy: gm.palmGapCue },
    { label: 'Pressure', copy: gm.contacts.find((c) => c.finger === gm.primaryPressureFinger)?.pressureRole ?? gm.thumbRole },
    { label: 'Leave', copy: gm.releaseCue },
  ]
}

const FINGER_ORDER: GripContactModel['finger'][] = ['index', 'middle', 'ring', 'pinky', 'thumb']
export const FINGER_NAME: Record<GripContactModel['finger'], string> = {
  index: 'Index',
  middle: 'Middle',
  ring: 'Ring',
  pinky: 'Pinky',
  thumb: 'Thumb',
}

/*
  The fingers either hand puts on the ball, in hand order, each with that hand's
  contact (or none). Matched by finger, never by label: the labels differ pitch to
  pitch, and the circle change puts a fourth finger on the ball.
*/
export function fingerRows(entries: PitchAtlasEntry[]) {
  const contactsOf = (entry: PitchAtlasEntry) => entry.canonical.gripModel.contacts
  return FINGER_ORDER.filter((finger) => entries.some((e) => contactsOf(e).some((c) => c.finger === finger))).map((finger) => ({
    finger,
    contacts: entries.map((e) => contactsOf(e).find((c) => c.finger === finger)),
  }))
}
