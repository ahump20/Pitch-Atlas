import type { FC, SVGProps } from 'react'

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

const svgBase: IconProps = {
  viewBox: '0 0 12 12',
  width: 11,
  height: 11,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

// hard: a rising chevron — the ball that carries.
const IconHard: FC<IconProps> = (props) => (
  <svg {...svgBase} {...props}>
    <path d="M2 8 L6 4 L10 8" />
  </svg>
)

// break: a hooking quarter-turn with a head — the ball that bends.
const IconBreak: FC<IconProps> = (props) => (
  <svg {...svgBase} {...props}>
    <path d="M3 2.5 Q3 9 9 9" />
    <path d="M6.4 9 L9 9 L9 6.4" />
  </svg>
)

// slow: a drooping arc — the ball that falls off.
const IconSlow: FC<IconProps> = (props) => (
  <svg {...svgBase} {...props}>
    <path d="M2 4 C4 10 8 10 10 4" />
  </svg>
)

// weird: a flutter line — knuckle / wobble.
const IconWeird: FC<IconProps> = (props) => (
  <svg {...svgBase} {...props}>
    <path d="M1.5 6 Q3 3 4.5 6 T7.5 6 T10.5 6" />
  </svg>
)

// banned: a slashed ring — doctored / illegal.
const IconBanned: FC<IconProps> = (props) => (
  <svg {...svgBase} {...props}>
    <circle cx="6" cy="6" r="4.2" />
    <line x1="3" y1="3" x2="9" y2="9" />
  </svg>
)

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
