import type { Claim } from '../types'
import { secondhand } from '../sources'
import { CRAFTSMEN } from '../craftsmen'

/*
  The rotating quote pool. Pitching craft, the mental game, and the philosophy of
  the game and of life in the Augie Garrido / Nick Saban vein. Same provenance
  discipline as everything else: every line is a Claim carrying its source and the
  honest confidence tier. Baseball quotes are the most misattributed content on
  the web, so a line that could not be tied to a reachable source is left out, not
  reconstructed, and a relayed line wears the secondhand-attributed label.

  The pool the UI rotates over is QUOTES (the curated life-and-game-philosophy
  lines authored here) plus the already-sourced craftsmen quotes, reused rather
  than restated. The craftsmen lines are gated by their own array's tests; the new
  lines below are gated by this file being walked in sources.test.ts.
*/

export interface AtlasQuote {
  id: string
  /** Who said it. */
  attribution: string
  /** Short context: a role or an era, for the line under the attribution. */
  context?: string
  /** The quote itself, sourced. The displayed text is claim.value. */
  claim: Claim<string>
}

/*
  Curated philosophy-of-the-game lines. Augie Garrido coached the most wins in
  NCAA Division I baseball history and wrote about the game as a way of living;
  Nick Saban's "process" is the same idea from the football side. Every line here
  is relayed through a secondary source (a book review, leadership writing), so it
  carries the secondhand-attributed tier and a note saying so.
*/
export const QUOTES: AtlasQuote[] = [
  {
    id: 'garrido-destroys-past',
    attribution: 'Augie Garrido',
    context: 'Winningest coach in NCAA Division I baseball history',
    claim: secondhand(
      'When a pitcher releases the ball and sends it on a four one-hundredths of a second journey toward the batter’s box, he simultaneously destroys the past and creates the future.',
      'garrido-life-yours-to-win',
      'Verbatim from Garrido’s Life Is Yours to Win (2011), Chapter 4; read through the SimmonsField review of the book rather than first-hand from the primary text.',
    ),
  },
  {
    id: 'garrido-testing-ourselves',
    attribution: 'Augie Garrido',
    context: 'Life Is Yours to Win, 2011',
    claim: secondhand(
      'Testing ourselves and defining ourselves is the "everything" of competition.',
      'garrido-life-yours-to-win',
      'Verbatim from Garrido’s Life Is Yours to Win (2011), Chapter 4; relayed through the SimmonsField book review.',
    ),
  },
  {
    id: 'garrido-never-an-opponent',
    attribution: 'Augie Garrido',
    context: 'Life Is Yours to Win, 2011',
    claim: secondhand(
      'No matter who is on the mound or no matter what team you are playing, you are always playing the game of baseball, you are never playing an opponent.',
      'garrido-life-yours-to-win',
      'Verbatim from Garrido’s Life Is Yours to Win (2011); relayed through the SimmonsField book review.',
    ),
  },
  {
    id: 'garrido-make-a-fool',
    attribution: 'Augie Garrido',
    context: 'Life Is Yours to Win, 2011',
    claim: secondhand(
      'Just when you think you know something, the game will make a fool of you.',
      'garrido-life-yours-to-win',
      'Verbatim from Garrido’s Life Is Yours to Win (2011); relayed through the SimmonsField book review.',
    ),
  },
  {
    id: 'garrido-winners-come-back',
    attribution: 'Augie Garrido',
    context: 'Life Is Yours to Win, 2011',
    claim: secondhand(
      'Some claim that winning is everything, but if that were true, why do winners keep coming back for more?',
      'garrido-life-yours-to-win',
      'Verbatim from Garrido’s Life Is Yours to Win (2011), Chapter 4; relayed through the SimmonsField book review.',
    ),
  },
  {
    id: 'saban-the-process',
    attribution: 'Nick Saban',
    context: 'On "the Process"',
    claim: secondhand(
      'Don’t think about winning the championship. Think about what you needed to do in this drill, on this play, in this moment. That is the process: think about what we can do today, the task at hand.',
      'saban-process-std',
      'Saban’s framing of "the Process," widely relayed through leadership writing (it traces back to Bob Rotella’s How Champions Think); cited here via a secondary source, not a primary Saban transcript.',
    ),
  },
]

/*
  The full pool the UI rotates over: the curated lines above, plus every craftsman
  who has a real, sourced quote on file. The craftsmen quotes are pithy and
  verbatim where the tier says so; they are reused here, not duplicated, so the one
  source of truth stays in the craftsmen wing. Deterministic order (no Date / no
  random) so it prerenders cleanly; the surfaces pick a line client-side.
*/
export function quotePool(): AtlasQuote[] {
  const fromCraftsmen: AtlasQuote[] = CRAFTSMEN.filter((c) => c.quote).map((c) => ({
    id: `q-craftsman-${c.slug}`,
    attribution: c.name,
    context: c.kind === 'legend' ? 'A pitch, not a person' : c.signaturePitch,
    claim: c.quote as Claim<string>,
  }))
  return [...QUOTES, ...fromCraftsmen]
}
