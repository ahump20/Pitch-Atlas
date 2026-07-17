import type { FundamentalBlock, WindmillPhase } from './types'
import { claim } from '../sources'

/* Fastpitch route and SEO copy shared with structural safety coverage. */
export const SOFTBALL_FASTPITCH_COPY = {
  description:
    'The core of fastpitch softball pitching: the four phases of the windmill delivery, how the lower half and trunk set up the arm circle, and the rules that shape the motion. Sourced to biomechanics and official rules.',
  heroSub:
    'The underhand windmill is a whole-body sequence. Here are its four phases, how the lower half and trunk set up the arm circle, and the rules that shape the delivery.',
  phaseLede:
    'Biomechanics splits the delivery into four phases: wind-up, stride, acceleration, and follow-through. Each phase continues the motion started by the one before it.',
} as const

export const SOFTBALL_HUB_FASTPITCH_BLURB =
  'The four phases of the windmill, how the lower half and trunk set up the arm circle, and the rules that shape the delivery.'

export const WINDMILL_PHASES: WindmillPhase[] = [
  {
    num: '01',
    name: 'Wind-up',
    what: claim(
      'From the onset of movement until the stride-foot toe leaves the ground. The pitcher shifts weight onto the drive leg while the arm and glove action set the delivery in motion.',
      'sb-friesen-2025-biomech',
      'reputable-analysis',
    ),
  },
  {
    num: '02',
    name: 'Stride',
    what: claim(
      'From drive-leg lift to stride-foot contact. The drive leg extends to move the body toward the plate while the arm climbs the back of the circle.',
      'sb-friesen-2025-biomech',
      'reputable-analysis',
    ),
  },
  {
    num: '03',
    name: 'Acceleration',
    what: claim(
      'From stride-foot contact through ball release. The arm moves down the front of the circle and the hand delivers the ball from the low release slot.',
      'sb-friesen-2025-biomech',
      'reputable-analysis',
    ),
  },
  {
    num: '04',
    name: 'Follow-through',
    what: claim(
      'From release through the end of the motion. The arm continues forward while the trunk and lower half carry the pitcher into a balanced finish.',
      'sb-friesen-2025-biomech',
      'reputable-analysis',
    ),
  },
]

export const FUNDAMENTAL_BLOCKS: FundamentalBlock[] = [
  {
    id: 'sequence',
    index: '02',
    label: 'Where the speed comes from',
    lede:
      'The windmill is a whole-body sequence. The lower half starts the move, the trunk carries it forward, and the arm circle completes it at release.',
    claims: [
      claim(
        'The drive-leg push moves the pitcher toward the plate while the arm circle develops behind it.',
        'sb-friesen-2025-biomech',
        'reputable-analysis',
      ),
      claim(
        'Hip extension and rotation contribute to the stride and help set the trunk in motion before release.',
        'sb-friesen-2025-biomech',
        'reputable-analysis',
      ),
      claim(
        'The delivery follows a lower-body-to-trunk-to-arm sequence; changing that order changes the timing and pace of the pitch.',
        'sb-ler-lowerbody',
        'reputable-analysis',
        {
          note: 'The broad sequence is well supported; exact timing within the windmill remains an active research question.',
        },
      ),
    ],
  },
  {
    id: 'rules',
    index: '03',
    label: 'The rules that shape the craft',
    lede:
      'A few rules define a legal fastpitch delivery. They shape what the lower half can do off the rubber and how far the ball travels.',
    claims: [
      claim(
        'Competitive fastpitch is thrown from 43 feet at the college and high-school levels, with the underhand windmill as the game’s defining delivery.',
        'sb-wiki-fastpitch',
        'reputable-analysis',
      ),
      claim(
        'Starting in 2023-24, the NCAA made leaping legal: a pitcher may push off and have both feet airborne during the stride. Replanting the pivot foot before delivering remains illegal.',
        'sb-ncaa-leaping-2023',
        'official-data',
        { note: 'A recent change in what the lower half may do after leaving the rubber.' },
      ),
    ],
  },
]
