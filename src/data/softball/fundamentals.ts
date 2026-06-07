import type { FundamentalBlock, WindmillPhase } from './types'
import { claim } from '../sources'

/*
  The fastpitch fundamentals — the core of the windmill from the ground up, sourced
  to peer-reviewed biomechanics rather than coaching lore. Three things to get
  straight: the four phases of the delivery, where the speed actually comes from
  (the lower half, not the arm circle), and the honest arm-health reality that the
  "underhand is natural and safe" myth gets wrong. Education and documentation only;
  nothing here is medical advice.
*/

export const WINDMILL_PHASES: WindmillPhase[] = [
  {
    num: '01',
    name: 'Wind-up',
    what: claim(
      'From the onset of movement until the stride-foot toe leaves the ground. The pitcher shifts weight back onto the drive leg and loads to push off the rubber — the arm and glove action varies by style, but the job is to set up a powerful drive.',
      'sb-friesen-2025-biomech',
      'reputable-analysis',
    ),
  },
  {
    num: '02',
    name: 'Stride',
    what: claim(
      'From drive-leg lift to stride-foot contact. The drive leg fires a triple extension — hip, knee, and ankle — to propel the body toward the plate while the arm climbs the back of the circle toward the top.',
      'sb-friesen-2025-biomech',
      'reputable-analysis',
    ),
  },
  {
    num: '03',
    name: 'Acceleration',
    what: claim(
      'From stride-foot contact through ball release. This is where the shoulder sees its highest forces: the arm whips down the front of the circle and the wrist snaps the ball out of the low release slot.',
      'sb-friesen-2025-biomech',
      'reputable-analysis',
    ),
  },
  {
    num: '04',
    name: 'Follow-through',
    what: claim(
      'From release through roughly ten milliseconds after. The arm decelerates eccentrically — the brake on the throw, and a health mechanic, not just a finish.',
      'sb-friesen-2025-biomech',
      'reputable-analysis',
    ),
  },
]

export const FUNDAMENTAL_BLOCKS: FundamentalBlock[] = [
  {
    id: 'kinetic-chain',
    index: '02',
    label: 'Where the speed comes from',
    lede:
      'The windmill looks like an arm pitch. It is not. The speed is built from the ground and handed up a chain — the same proximal-to-distal logic as a baseball delivery, run underhand. Coach the lower half, not the arm circle.',
    claims: [
      claim(
        'The force the drive leg puts into the ground during the stride relates directly to pitch velocity — the harder the push off the rubber, the faster the ball.',
        'sb-friesen-2025-biomech',
        'reputable-analysis',
      ),
      claim(
        'The drive depends on a large contraction of the gluteus maximus, and hip external-rotation strength is associated with more energy flowing out through the trunk and pitching arm.',
        'sb-friesen-2025-biomech',
        'reputable-analysis',
      ),
      claim(
        'Energy moves proximal-to-distal: the lower body generates power first, then hands it up the chain to the arm — leading with the arm before the body has fired both slows the pitch and loads the joint.',
        'sb-ler-lowerbody',
        'reputable-analysis',
        { note: 'The sequencing is the well-supported coaching consensus; the windmill’s exact energy-transfer timing is still an active research question.' },
      ),
    ],
  },
  {
    id: 'arm-health',
    index: '03',
    label: 'The arm-health reality',
    educational: true,
    lede:
      'The most repeated claim in softball is that the windmill is "natural" and therefore safe. It is a myth, and an important one to retire. The underhand motion loads the arm hard, and the structure of the sport piles workload on top of it. This is education and documentation, not medical advice — pain questions go to a qualified professional.',
    claims: [
      claim(
        'The windmill loads the shoulder heavily: measured shoulder distraction forces approach 100% of body weight, with peak shoulder and elbow forces around 70-98% of body weight.',
        'sb-barrentine-1998-jospt',
        'reputable-analysis',
        { note: 'From the seminal Barrentine et al. windmill-biomechanics study; corroborated by later work putting shoulder distraction near bodyweight.' },
      ),
      claim(
        'The recurring injuries are anterior shoulder pain and biceps/labral stress — consistent with how hard the biceps-labral complex works through the windmill.',
        'sb-shoulder-stress-pmc',
        'reputable-analysis',
      ),
      claim(
        'Pitchers are about 2.6 times more likely than position players to sustain an upper-extremity injury — and small pitching rosters mean huge single-game and season workloads, with none of the pitch-count limits baseball has built in.',
        'sb-injury-epi-2024',
        'reputable-analysis',
      ),
      claim(
        'There is a lever to pull: the change-up was measured to produce significantly less peak elbow anterior force and shoulder distraction force than the fastball — one reason a deep change is more than a timing pitch.',
        'sb-friesen-2025-biomech',
        'reputable-analysis',
      ),
    ],
  },
  {
    id: 'rules',
    index: '04',
    label: 'The rules that shape the craft',
    lede:
      'A few rules define what a fastpitch delivery is allowed to be, and they shape the whole craft — what the pitcher can do with the lower half off the rubber, and how far the ball has to travel.',
    claims: [
      claim(
        'Competitive fastpitch is thrown from 43 feet at the college and high-school levels — and the underhand windmill is the delivery the game is built on.',
        'sb-wiki-fastpitch',
        'reputable-analysis',
      ),
      claim(
        'Starting in 2023-24, the NCAA made leaping legal: a pitcher may push off and have both feet airborne during the stride. The crow hop — replanting the pivot foot to gain ground before delivering — remains illegal.',
        'sb-ncaa-leaping-2023',
        'official-data',
        { note: 'A genuine recent shift in what the lower half is allowed to do off the rubber.' },
      ),
    ],
  },
]
