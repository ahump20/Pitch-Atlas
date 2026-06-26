import type { FC, SVGProps } from 'react'

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
export const IconHard: FC<IconProps> = (props) => (
  <svg {...svgBase} {...props}>
    <path d="M2 8 L6 4 L10 8" />
  </svg>
)

// break: a hooking quarter-turn with a head — the ball that bends.
export const IconBreak: FC<IconProps> = (props) => (
  <svg {...svgBase} {...props}>
    <path d="M3 2.5 Q3 9 9 9" />
    <path d="M6.4 9 L9 9 L9 6.4" />
  </svg>
)

// slow: a drooping arc — the ball that falls off.
export const IconSlow: FC<IconProps> = (props) => (
  <svg {...svgBase} {...props}>
    <path d="M2 4 C4 10 8 10 10 4" />
  </svg>
)

// weird: a flutter line — knuckle / wobble.
export const IconWeird: FC<IconProps> = (props) => (
  <svg {...svgBase} {...props}>
    <path d="M1.5 6 Q3 3 4.5 6 T7.5 6 T10.5 6" />
  </svg>
)

// banned: a slashed ring — doctored / illegal.
export const IconBanned: FC<IconProps> = (props) => (
  <svg {...svgBase} {...props}>
    <circle cx="6" cy="6" r="4.2" />
    <line x1="3" y1="3" x2="9" y2="9" />
  </svg>
)
