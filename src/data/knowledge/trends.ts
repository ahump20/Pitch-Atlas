import type { KnowledgeWing } from './types'
import { kc } from './claim'

export const trendsWing: KnowledgeWing = {
  slug: 'trends',
  navLabel: 'State of the Craft',
  eyebrow: 'Pitch design trends',
  title: "State of the Craft: Sweep, Fade, Wake, and Lost Lines",
  summary:
    'The sweeper became a named mainstream shape, the kick-change spread through coaching video, the sinker became more tactical, and the screwball remains a broken teaching lineage.',
  sub:
    'Modern pitch craft moves faster than formal research. The honest way to file it is by naming what is sourced, what is observed, and what remains open.',
  accent: 'powder',
  educational: false,
  sections: [
    {
      heading: 'The Sweeper Got a Name',
      paragraphs: [
        'When Statcast added the sweeper as its own pitch type, it did not invent a new grip. It named a shape pitchers had already been throwing: a breaking ball that moves across the plate with more sweep than a traditional slider.',
        'The name mattered because names travel. Once coaches, analysts, and players had a shared label, the pitch became easier to teach, scout, and refine. The craft lesson is not that everyone needs one. It is that a named shape becomes easier to build.',
        'Miles Mikolas captured the tension well when he objected that the pitch had been around under other names. Both things can be true: old shape, new label, faster spread.',
      ],
      claims: [
        kc('Statcast officially added sweeper as a discrete pitch type.', 'official-data', {
          label: 'MLB.com Glossary: Sweeper',
          url: 'https://www.mlb.com/glossary/pitch-types/sweeper',
        }),
        kc('FanGraphs documented the sweeper’s broader adoption and the naming shift around the pitch.', 'reputable-analysis', {
          label: 'FanGraphs: Early Pitch Usage Trends',
          url: 'https://blogs.fangraphs.com/lets-take-a-peek-at-some-early-2025-pitch-usage-trends/',
        }),
      ],
    },
    {
      heading: 'The Kick-Change Spread Like a Grip Tip',
      paragraphs: [
        'The kick-change is a useful case study because it traveled like modern coaching actually travels: facility video, player experimentation, social clips, bullpen adoption, then game use. The pitch is not magic. It is a changeup idea with a spiked-finger cue that helps some arms create late fade and tumble.',
        'Hayden Birdsong and Clay Holmes became public examples of the pitch entering major-league arsenals after being taught and discussed through modern development channels.',
        'The honest read is that the grip is teachable, the shape is interesting, and the long-term evidence is still young. That is exactly the kind of claim that needs source labels rather than hype.',
      ],
      claims: [
        kc('Tread Athletics teaching content helped popularize the kick-change grip and spiked-finger cue.', 'secondhand-attributed', {
          label: 'Tread Athletics teaching content',
          url: 'https://www.tiktok.com/@tread_athletics/video/7402251034896272686',
        }, 'The grip-language source is coaching content, not peer-reviewed research.'),
        kc('CBS Sports documented Clay Holmes adding a kick-change as part of his transition into a starting role.', 'reputable-analysis', {
          label: 'CBS Sports: Clay Holmes and the kick-change',
          url: 'https://www.cbssports.com/mlb/news/mets-clay-holmes-continues-to-excel-in-starting-role-thanks-to-kick-changeup-other-new-pitches/',
        }),
      ],
    },
    {
      heading: 'The Sinker Became More Tactical',
      paragraphs: [
        'The sinker has not disappeared. It has changed jobs. In a game that prizes high fastballs, sweepers, and cutters, the sinker is less often the default fastball and more often a matchup or contact-management tool.',
        'That makes the two-seam grip more interesting, not less. A good sinker still gives the pitcher arm-side run, depth, and ground-ball shape. It just has to fit the rest of the arsenal instead of standing alone as the whole plan.',
        'The craft question is the same as always: does this two-seam shape give your fastball family another lane, or does it blur into a pitch you already throw?',
      ],
      claims: [
        kc('FanGraphs has documented the modern sinker becoming more specialized within broader fastball mixes.', 'reputable-analysis', {
          label: 'FanGraphs: Early Pitch Usage Trends',
          url: 'https://blogs.fangraphs.com/lets-take-a-peek-at-some-early-2025-pitch-usage-trends/',
        }),
        kc('MLB classifies the sinker as a fastball family pitch with arm-side run and sinking action.', 'official-data', {
          label: 'MLB.com Glossary: Sinker',
          url: 'https://www.mlb.com/glossary/pitch-types/sinker',
        }),
      ],
    },
    {
      heading: 'The Screwball Is a Broken Teaching Line',
      paragraphs: [
        'The screwball is nearly gone because the teaching line broke. Christy Mathewson, Carl Hubbell, Fernando Valenzuela, and John Franco kept the pitch visible in earlier eras, but modern development systems rarely teach it.',
        'The injury fear is real as culture, but the evidence is thinner than the fear. Coaches repeat the warning, fewer pitchers learn the pitch, and fewer coaches remain who can teach it safely. That loop turns a rare pitch into a museum piece.',
        'A future revival would need more than nostalgia. It would need a credible coach, careful progression, and honest injury research. Until then, the screwball belongs in the lost-pitches wing with a clear uncertainty label.',
      ],
      claims: [
        kc('The screwball’s decline is commonly attributed to perceived injury risk and a loss of teaching expertise.', 'reputable-analysis', {
          label: 'Wikipedia: Screwball',
          url: 'https://en.wikipedia.org/wiki/Screwball',
        }, 'The injury-risk claim remains partly anecdotal because pitch-specific biomechanical research is limited.'),
        kc('Historical screwball pitchers include Christy Mathewson, Carl Hubbell, Fernando Valenzuela, and John Franco.', 'reputable-analysis', {
          label: 'Wikipedia: Screwball',
          url: 'https://en.wikipedia.org/wiki/Screwball',
        }),
      ],
    },
    {
      heading: 'Seam-Shifted Wake Made Grip Matter More',
      paragraphs: [
        'Seam-shifted wake gave coaches a better language for something pitchers had felt for a long time: seam presentation can make a ball move differently than spin alone would suggest.',
        'That idea connects the sinker, kick-change, and some modern changeups. It puts the grip back at the center. Where the seams sit, which finger leaves last, and how the ball exits the hand can change the shape a hitter sees.',
        'This is the strongest modern argument for Pitch Atlas as a field manual. The future of pitch design is not just better dashboards. It is better grip language tied to honest source labels.',
      ],
      claims: [
        kc('Seam-shifted wake describes movement created by asymmetric airflow around the baseball’s seams, beyond a simple spin-only explanation.', 'reputable-analysis', {
          label: 'Driveline Baseball: Seam-Shifted Wakes and Sinkers',
          url: 'https://www.drivelinebaseball.com/2020/11/more-than-what-it-seams-an-introduction-to-seam-shifted-wakes-and-their-effect-on-sinkers/',
        }),
        kc('MLB.com and FanGraphs have highlighted Tarik Skubal’s changeup as a prominent modern seam-shifted-wake example.', 'reputable-analysis', {
          label: 'MLB.com: Tarik Skubal changeup',
          url: 'https://www.mlb.com/tigers/news/how-tarik-skubal-s-changeup-became-one-of-baseball-s-best-pitches',
        }),
      ],
    },
  ],
  confidenceNote:
    'Claims are tiered by source: MLB glossary material, FanGraphs trend analysis, Driveline seam-wake writing, coaching content, and mainstream reporting. The route names modern pitch-design movements without publishing pitch-behavior figures or leaderboard examples.',
  related: [
    { label: 'Learn: Spin and Shape', to: '/learn/spin' },
    { label: 'Learn: Pitch Design Principles', to: '/learn/pitch-design' },
    { label: 'Pitch Profile: Slider', to: '/pitch/slider' },
    { label: 'Shape Map', to: '/movement-map' },
  ],
}
