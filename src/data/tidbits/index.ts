import type { Claim } from '../types'
import { claim } from '../sources'

/*
  The tidbits. Ten real, sourced baseball facts hidden in the archive as in-context
  easter eggs: each surfaces from an interaction on a historical surface and teaches
  something weird, disputed, or genuinely surprising about the game. Same provenance
  discipline as the rest of the atlas - every fact is a Claim with a real Source and
  the honest confidence tier. Nothing here is invented; the facts are paraphrased in
  our own words and cited, never copied. A discovered tidbit is collected into the
  found-index; the eggLocation names where it was filed.
*/

export interface Tidbit {
  /** Stable id the host surface references and the found-index keys on. */
  id: string
  /** Short headline for the reveal and the index. */
  title: string
  /** The fact itself, sourced. The displayed body is claim.value. */
  claim: Claim<string>
  /** Human-readable place this is filed from, for the found-index. */
  eggLocation: string
}

export const TIDBITS: Tidbit[] = [
  {
    id: 'stitches',
    title: '108 stitches, sewn by hand',
    claim: claim(
      'Every regulation baseball is closed by hand with 108 double stitches - 216 individual passes - of waxed red thread roughly 88 inches long. The standard was fixed in 1934, and the balls are still stitched by hand today.',
      'wiki-baseball-ball',
      'reputable-analysis',
    ),
    eggLocation: 'The Shape Lab',
  },
  {
    id: 'doubleday',
    title: 'Doubleday did not invent baseball',
    claim: claim(
      'The story that Abner Doubleday invented baseball in Cooperstown in 1839 was manufactured by a commission in the 1900s working from one questionable letter. Doubleday was a West Point cadet that year, never claimed the game, and never once mentioned baseball in his own diaries.',
      'wiki-doubleday-myth',
      'reputable-analysis',
    ),
    eggLocation: 'The footer vow',
  },
  {
    id: 'sixty-six',
    title: 'Why 60 feet, 6 inches',
    claim: claim(
      'The pitching rubber sits 60 feet 6 inches from home plate because in 1893 the distance was deliberately pushed back to cool off overpowering pitchers - not, as the legend goes, because a surveyor misread a blueprint that said "60 feet 0 inches."',
      'mlb-mound-distance',
      'reputable-analysis',
    ),
    eggLocation: 'The Learn wing',
  },
  {
    id: 'the-k',
    title: 'Why K means strikeout',
    claim: claim(
      'The box score and the "K" for a strikeout both come from one 19th-century writer, Henry Chadwick. He used K because it is the last letter of "struck" - he had already given the letter S to the sacrifice.',
      'britannica-k-strikeout',
      'reputable-analysis',
    ),
    eggLocation: 'The colophon',
  },
  {
    id: 'spitball-ban',
    title: 'The 17 grandfathered spitballers',
    claim: claim(
      'When the spitball was outlawed in February 1920, seventeen pitchers were granted lifetime exemptions to keep throwing it. Burleigh Grimes threw the last legal spitball in 1934; three of the seventeen later reached the Hall of Fame.',
      'sabr-spitball-deadball',
      'reputable-analysis',
    ),
    eggLocation: 'A lost-pitch plate',
  },
  {
    id: 'eephus',
    title: 'The pitch you could watch sail',
    claim: claim(
      'Rip Sewell’s eephus floated as high as 25 feet before dropping over the plate, and in years of throwing it only Ted Williams ever homered off it, at the 1946 All-Star Game at Fenway Park. A teammate named it: "Eephus ain’t nothing, and that’s what that ball is."',
      'tht-eephus-sewell',
      'reputable-analysis',
    ),
    eggLocation: 'The Pitch Index search',
  },
  {
    id: 'rubbing-mud',
    title: 'The secret mud on every ball',
    claim: claim(
      'Before every major-league game, every new ball is rubbed with mud from a single secret spot on a Delaware River tributary - Lena Blackburne’s rubbing mud - to kill the factory shine and give pitchers grip. The exact location has been a family secret for generations.',
      'hof-rubbing-mud',
      'reputable-analysis',
    ),
    eggLocation: 'The Grip Library',
  },
  {
    id: 'knuckleball',
    title: 'A pitch that barely spins',
    claim: claim(
      'A knuckleball is thrown to spin as little as possible - ideally no more than about half a turn on the entire trip to the plate. That near-absence of spin is the whole trick: the seams steer the air, and the ball wanders unpredictably.',
      'wiki-knuckleball',
      'reputable-analysis',
    ),
    eggLocation: 'The Craftsmen hall',
  },
  {
    id: 'first-night-game',
    title: 'The night the lights came on',
    claim: claim(
      'The first big-league night game was May 24, 1935, at Cincinnati’s Crosley Field. President Franklin Roosevelt switched the lights on from the White House, pressing a gold telegraph key 500 miles away.',
      'sabr-first-night-game',
      'reputable-analysis',
    ),
    eggLocation: 'The Lost Pitches hall',
  },
  {
    id: 'curveball-claim',
    title: 'Who really threw the first curveball',
    claim: claim(
      'Candy Cummings is credited with the curveball - he said he got the idea watching seashells curve through the air, first broke one off against Harvard in 1867, and entered the Hall of Fame for it in 1939. But the claim is disputed: Fred Goldsmith and Phonney Martin each said they threw it too.',
      'wiki-candy-cummings',
      'reputable-analysis',
    ),
    eggLocation: 'A craftsman file',
  },
]

const BY_ID: Record<string, Tidbit> = Object.fromEntries(TIDBITS.map((t) => [t.id, t]))

export function tidbitById(id: string): Tidbit | undefined {
  return BY_ID[id]
}

/** The total count, for the found-index "N of 10 filed" line. */
export const TIDBIT_COUNT = TIDBITS.length
