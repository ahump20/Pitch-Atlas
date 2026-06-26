import type { FC, SVGProps } from 'react'
import { IconBanned, IconBreak, IconHard, IconSlow, IconWeird } from './familyCrumbIcons'

/*
  The pitch-family crumb: a small icon + word that names WHAT KIND of pitch this is
  (hard / break / slow / weird / banned). It is decoration with a job, and it is a
  different job from the confidence dot — the crumb says what the pitch is, the dot
  says how much to trust the number. Icons are inline SVG on currentColor so they
  inherit the crumb's bone text and stay crisp at 11px. The five families cover the
  whole repertoire; the 12 filed specimens only use hard / break / slow.
*/

export type FamilyKind = 'HARD' | 'BREAK' | 'SLOW' | 'WEIRD' | 'BANNED'

/** The five-value family space (canonical records use the first three). */
export type CrumbFamily = 'fastball' | 'breaking' | 'offspeed' | 'specialty' | 'banned'

type IconProps = SVGProps<SVGSVGElement>

export interface FamilyCrumb {
  kind: FamilyKind
  label: string
  Icon: FC<IconProps>
}

export const FAMILY_CRUMB: Record<CrumbFamily, FamilyCrumb> = {
  fastball: { kind: 'HARD', label: 'HARD', Icon: IconHard },
  breaking: { kind: 'BREAK', label: 'BREAK', Icon: IconBreak },
  offspeed: { kind: 'SLOW', label: 'SLOW', Icon: IconSlow },
  specialty: { kind: 'WEIRD', label: 'WEIRD', Icon: IconWeird },
  banned: { kind: 'BANNED', label: 'BANNED', Icon: IconBanned },
}

/** The crumb for a pitch family. An unmapped family falls back to the specialty/WEIRD
    crumb — it reads as "unclassified" rather than confidently mislabeling it as BREAK. */
export function familyCrumb(family: string): FamilyCrumb {
  return FAMILY_CRUMB[family as CrumbFamily] ?? FAMILY_CRUMB.specialty
}
