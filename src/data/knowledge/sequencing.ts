import type { KnowledgeWing } from './types'
import { kc } from './claim'

export const sequencingWing: KnowledgeWing = {
  slug: 'sequencing',
  navLabel: 'Sequencing & Tunneling',
  eyebrow: 'How pitches work together',
  title: 'Sequencing & Tunneling',
  summary:
    'How to make different pitches look alike early, split late, and change a hitter’s timing across the whole count.',
  sub:
    'Tunneling is the early lie. Sequencing is the larger plan: move the eyes, change the clock, and choose the next pitch because of what the last pitch made the hitter believe.',
  accent: 'powder',
  educational: false,
  sections: [
    {
      heading: 'The Tunnel Is an Early Look',
      paragraphs: [
        'A tunnel is the shared early window of two pitches. The hitter sees the same release, the same first lane, and the same body language long enough that the bat has to start making a decision before the pitch reveals its final shape.',
        'To build a tunnel, the pitcher has to repeat the release. Arm slot, head position, trunk angle, and intent all matter. If the fastball and breaking ball come out of different windows, the hitter gets the answer early.',
        'Late movement is the payoff. The sinker and slider can start from the same lane, then one runs down and arm-side while the other peels glove-side. The hitter is no longer reading a pitch. He is reacting to the wrong first look.',
      ],
      claims: [
        kc(
          'Baseball Prospectus formalized pitch tunneling as the study of how similar pitches look at the hitter’s decision point and how they separate afterward.',
          'official-data',
          {
            label: 'Baseball Prospectus: Introducing Pitch Tunnels',
            url: 'https://www.baseballprospectus.com/news/article/31030/prospectus-feature-introducing-pitch-tunnels/',
          },
        ),
        kc(
          'Release consistency and shared early trajectory are the practical foundation of pitch tunneling.',
          'reputable-analysis',
          {
            label: 'Baseball Scouter: The Art of Pitch Tunneling',
            url: 'https://baseballscouter.com/what-is-pitch-tunneling-strategy/',
          },
        ),
      ],
    },
    {
      heading: 'Fastball First, Then the Clock Changes',
      paragraphs: [
        'In hitter timing, the game can be read as fastball versus offspeed. The fastball is the pitch a hitter must cover first: if he sits fastball, he can still try to wait on something slower. If he sits slow and the fastball comes, it is already in the mitt.',
        'That fastball-first timing problem is why a consistent four-seam is the bread-and-butter pitch when a pitcher can command it. The fastball establishes the clock. The changeup, splitter, curve, or slider punishes the hitter for starting that clock too early.',
        'A good sequence does not mean variety for its own sake. It means the next pitch answers what the last pitch made the hitter guard.',
      ],
      claims: [
        kc(
          'Pitch sequencing research shows that pitch order changes how later pitches play, especially when a fastball sets the hitter’s timing expectation.',
          'reputable-analysis',
          {
            label: 'The Hardball Times: The Effects of Pitch Sequencing',
            url: 'https://tht.fangraphs.com/the-effects-of-pitch-sequencing/',
          },
        ),
        kc(
          'Pitchers can use offspeed and fastball sequencing to control hitter timing rather than relying on one pitch in isolation.',
          'reputable-analysis',
          {
            label: 'The Hardball Times: Pitch Tunneling, Is It Real?',
            url: 'https://tht.fangraphs.com/pitch-tunneling-is-it-real-and-how-do-pitchers-actually-pitch/',
          },
        ),
      ],
    },
    {
      heading: 'Move the Eyes Before You Move the Bat',
      paragraphs: [
        'Eye level is a sequencing tool. A fastball up and in changes the hitter’s posture. A changeup or curve below the zone changes the clock. A slider away asks the barrel to chase across a different lane.',
        'The useful question is not “what pitch is next?” It is “what did the last pitch make him protect?” If the hitter is guarding the hands, the outside lane opens. If he is guarding soft below the zone, firm in the zone plays louder.',
        'Austin’s own attack plan follows that logic: establish the four-seam on the hands, move the hitter’s eyes, change the clock below the zone, then return to a fastball spot the hitter has not been allowed to sit on.',
      ],
      claims: [
        kc(
          'Sequencing research supports sinker-slider and repeated-pitch patterns as viable ways to create timing and location problems for hitters.',
          'reputable-analysis',
          {
            label: 'The Hardball Times: Pitch Sequencing',
            url: 'https://tht.fangraphs.com/pitch-sequencing/',
          },
        ),
        kc(
          'Pitchers sometimes prioritize the count, hitter tendency, and desired contact over the most visually perfect tunnel.',
          'reputable-analysis',
          {
            label: 'The Hardball Times: Pitch Tunneling, Is It Real?',
            url: 'https://tht.fangraphs.com/pitch-tunneling-is-it-real-and-how-do-pitchers-actually-pitch/',
          },
        ),
      ],
    },
    {
      heading: 'Train the Pair, Then Call the Game',
      paragraphs: [
        'The bullpen version is controlled: film the release, overlay the fastball against the breaking ball, and make both pitches pass through the same early look. The game version is messier. Counts, hitter swings, fatigue, and command decide whether that pair is still the right call.',
        'That is why tunneling is a tool, not a religion. A near-perfect tunnel is useless if it puts the pitch in the wrong place for the count. A less elegant pair can be perfect if it gets the hitter to protect the wrong lane.',
        'The archive rule: build the tunnel in practice, then sequence like a pitcher. Watch the hitter. Keep the first look honest. Let the late shape tell the lie.',
      ],
      claims: [
        kc(
          'Pitchers can train tunneling by comparing release frames and early pitch paths, then pairing that work with game-context pitch calling.',
          'reputable-analysis',
          {
            label: 'Baseball Scouter: The Art of Pitch Tunneling',
            url: 'https://baseballscouter.com/what-is-pitch-tunneling-strategy/',
          },
        ),
        kc(
          'The best sequencing decisions balance deception with the desired baseball outcome, rather than treating tunnel quality as the only goal.',
          'reputable-analysis',
          {
            label: 'The Hardball Times: Pitch Tunneling, Is It Real?',
            url: 'https://tht.fangraphs.com/pitch-tunneling-is-it-real-and-how-do-pitchers-actually-pitch/',
          },
        ),
      ],
    },
  ],
  confidenceNote:
    'Core concepts are sourced from Baseball Prospectus, The Hardball Times, and coaching references. The route keeps the tunnel and sequencing ideas but removes inch gaps, rate tables, and perceived-speed examples.',
  related: [
    { label: 'Compare two pitches', to: '/compare' },
    { label: 'Pitch Design', to: '/learn/pitch-design' },
    { label: 'Mechanics', to: '/learn/mechanics' },
    { label: 'Spin & Shape', to: '/learn/spin' },
    { label: 'Fastball', to: '/pitch/four-seam' },
  ],
}
