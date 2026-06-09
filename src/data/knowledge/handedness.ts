import type { KnowledgeWing } from './types'
import { kc } from './claim'

export const handednessWing: KnowledgeWing = {
  slug: 'handedness',
  navLabel: 'Handedness',
  eyebrow: 'The matchup',
  title: 'Handedness & Platoon Strategy',
  summary:
    'How pitch direction changes when the batter’s hand changes: away, into, arm-side, glove-side, and neutral vertical shapes.',
  sub:
    'The same pitch can be a weapon in one matchup and a danger in another. Handedness turns shape into strategy.',
  accent: 'powder',
  educational: false,
  sections: [
    {
      heading: 'The Platoon Advantage',
      paragraphs: [
        'The platoon advantage is the edge a pitcher gains when the ball is harder for the hitter to see and the pitch shape works away from the barrel. Same-handed matchups usually give breaking balls a cleaner lane: the slider or sweeper moves away from the hitter instead of back into the bat path.',
        'That is why a right-handed slider can feel like a weapon against a right-handed hitter and a risk against a left-handed hitter. The shape did not change. The matchup did.',
        'For a field manual, the rule is simple: ask where the shape finishes relative to that hitter’s barrel, not just what the pitch is called.',
      ],
      claims: [
        kc(
          'Hitters generally perform better against opposite-handed pitchers than same-handed pitchers, a pattern known as the platoon split.',
          'official-data',
          {
            label: 'FanGraphs Sabermetrics Library: Splits',
            url: 'https://library.fangraphs.com/principles/split/',
          },
        ),
        kc(
          'Sliders show a normal platoon effect because glove-side break moves away from same-handed batters.',
          'official-data',
          {
            label: 'FanGraphs Sabermetrics Library: Splits',
            url: 'https://library.fangraphs.com/principles/split/',
          },
        ),
      ],
    },
    {
      heading: 'The Mirror Rule',
      paragraphs: [
        'A horizontally moving pitch mirrors when the batter’s hand changes. A right-handed slider that runs away from a right-handed hitter runs into a left-handed hitter. A changeup that fades away from a left-handed hitter may move back toward a right-handed hitter’s barrel.',
        'This mirror rule is the fastest way to understand why pitch labels alone are not enough. The same slider, cutter, sinker, or changeup can play differently because the hitter sees a different direction.',
        'The grip lesson stays concrete: glove-side movement usually helps against same-handed hitters; arm-side fade is one way to fight the opposite-handed matchup.',
      ],
      claims: [
        kc(
          'Breaking balls thrown by a pitcher tend to move away from batters of the same handedness.',
          'official-data',
          {
            label: 'FanGraphs Sabermetrics Library: Splits',
            url: 'https://library.fangraphs.com/principles/split/',
          },
        ),
        kc(
          'Slider movement is commonly described as glove-side movement created by the pitch’s spin and release.',
          'reputable-analysis',
          {
            label: 'Sporthiatus: Slider Pitch Mechanics and Uses',
            url: 'https://sporthiatus.com/what-is-a-slider-pitch-in-baseball-mechanics-and-uses/',
          },
        ),
      ],
    },
    {
      heading: 'Reverse-Platoon Weapons',
      paragraphs: [
        'A good changeup, screwball, or arm-side fading pitch can flip the normal matchup. Instead of running into an opposite-handed hitter, it fades away from that hitter and makes the barrel reach across the plate.',
        'Tommy Kahnle’s changeup is one modern example analysts point to: a right-handed pitcher using a changeup to fight left-handed hitters because the pitch’s direction and deception work against the expected platoon edge.',
        'That does not make every changeup a reverse-platoon weapon. It has to be sold with arm speed, arrive late, and move away from the hitter it is built to solve.',
      ],
      claims: [
        kc(
          'FanGraphs analysis of Tommy Kahnle’s changeup describes how an elite changeup can work as a reverse-platoon weapon.',
          'reputable-analysis',
          {
            label: "FanGraphs Baseball: Tommy Kahnle's Changeup Change",
            url: 'https://blogs.fangraphs.com/tommy-kahnles-changeup-change/',
          },
        ),
        kc(
          'Right-handed pitchers can use arm-side fading changeups against left-handed hitters when deception and movement direction work together.',
          'reputable-analysis',
          {
            label: "FanGraphs Baseball: Grayson Rodriguez on His Changeup",
            url: 'https://blogs.fangraphs.com/grayson-rodriguez-on-his-changeup-which-isnt-a-screwball-or-is-it/',
          },
        ),
      ],
    },
    {
      heading: 'Neutral Shapes Still Matter',
      paragraphs: [
        'Some pitches are less dependent on batter hand. A true downer curve is mostly vertical. A cutter can be subtle enough to work across both sides because it behaves like a fastball until the last short bite.',
        'Those neutral shapes let a pitcher keep the same plan against more hitters. They also reduce the need to chase a different grip for every matchup.',
        'A complete arsenal needs both: handedness weapons that move away from a specific barrel, and neutral pitches that survive when the matchup is less favorable.',
      ],
      claims: [
        kc(
          'FanGraphs analysis describes the cutter as a pitch that can work across platoon matchups because its movement is subtle and fastball-like.',
          'official-data',
          {
            label: 'FanGraphs Baseball: The Cutter, a Platoon Neutral Offering?',
            url: 'https://blogs.fangraphs.com/the-cutter-a-platoon-neutral-offering/',
          },
        ),
        kc(
          'Vertically oriented pitch shapes are less tied to batter handedness than pitches that move strongly across the plate.',
          'reputable-analysis',
          {
            label: 'FanGraphs Sabermetrics Library: Splits',
            url: 'https://library.fangraphs.com/principles/split/',
          },
        ),
      ],
    },
  ],
  confidenceNote:
    'Sourced from FanGraphs platoon-split references, FanGraphs pitch analyses, and coaching explainers. The wing translates the matchup evidence into direction words instead of publishing handedness leaderboard rows.',
  related: [
    { label: 'Pitch Design', to: '/learn/pitch-design' },
    { label: 'Reading Models', to: '/learn/metrics' },
    { label: 'Sequencing', to: '/learn/sequencing' },
    { label: 'Repertoire', to: '/repertoire' },
  ],
}
