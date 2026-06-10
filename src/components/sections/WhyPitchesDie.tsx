import { claim } from '../../data/sources'
import type { Claim } from '../../data/types'
import { ClaimCard } from '../provenance/ClaimCard'

/*
  The through-line the Lost-Pitches archive was missing: why a pitch dies. Four
  forces, in the order they take a pitch out of the game, each carrying its own
  source. This is the spine under the tiered entries — the same provenance model as
  everything else, our framing in original words, every figure a Claim with a link.
*/

interface Force {
  era: string
  heading: string
  body: string
  claims: Claim<string>[]
}

const FORCES: Force[] = [
  {
    era: '1920 →',
    heading: 'A rule outlaws it.',
    body: 'The first and bluntest way a pitch dies: the rulebook bans it. In February 1920 the Joint Rules Committee outlawed the spitball and the rest of the doctored-ball family, grandfathering only seventeen active spitballers — the last of whom, Burleigh Grimes, threw legally until 1934. The ban did not end the craft so much as drive it underground, and the enforcement has never really stopped: Gaylord Perry built a Hall of Fame career on a grease ball hitters could never quite prove, and Joe Niekro was ejected in 1987 when an emery board fell out of his pocket on the mound.',
    claims: [
      claim('In February 1920 the Joint Rules Committee banned the spitball and the doctored-ball pitches, a turning point that helped end the dead-ball era.', 'sabr-deadball-spitball', 'reputable-analysis', { note: 'SABR: the 1920 ban and the end of the deadball era.' }),
      claim('Seventeen active spitballers were grandfathered in; Burleigh Grimes, the last of them, threw the pitch legally through 1934.', 'wiki-spitball', 'reputable-analysis', { note: 'The grandfather clause and Grimes’s 1934 finish.' }),
      claim('Joe Niekro was ejected in 1987 when an emery board and sandpaper fell from his pocket as the umpires checked him — the doctored-ball lineage, still being policed decades later.', 'sabr-niekro-1987', 'reputable-analysis', { note: 'SABR Games Project, August 3, 1987.' }),
    ],
  },
  {
    era: '1948',
    heading: 'A ruling kills it mid-career.',
    body: 'A pitch can also be legislated out from under the arm that throws it. Satchel Paige’s hesitation pitch — a pause in the delivery that froze hitters — was legal when he brought it to the majors in 1948. Then, after a memorable at-bat against Mickey Platt, American League president Will Harridge ruled the hesitation a balk. The pitch did not get banned by name; the motion that made it work was simply declared illegal, and it vanished with the ruling.',
    claims: [
      claim('Satchel Paige’s hesitation pitch was ruled a balk by AL president Will Harridge in 1948, after an at-bat against Mickey Platt — legislating the pitch out of the game.', 'wiki-satchel-paige', 'reputable-analysis', { note: 'The 1948 Platt at-bat and the Harridge balk ruling.' }),
    ],
  },
  {
    era: 'Always',
    heading: 'The technique dies with the arm.',
    body: 'The quietest death, and the one this wing is built on: a box score survives, a grip does not. In segregated baseball there was almost no film, no institutional archive, and a barnstorming culture that kept no technical record. When an arm stopped throwing, the exact feel of its pitch went with it. The statistics can be reconstructed pitch by pitch from surviving scorecards; the hand on the ball cannot. That asymmetry is why every plate in this archive wears a documentation tier instead of a precision it cannot support.',
    claims: [
      claim('The Negro Leagues record is being rebuilt from surviving box scores game by game, with the 1920s the most completely documented decade — but a box score preserves the outcome, never the grip.', 'seamheads-db', 'reputable-analysis', { note: 'The Seamheads reconstruction method and its coverage.' }),
    ],
  },
  {
    era: '2020 · 2024',
    heading: 'The record comes back — but only the numbers.',
    body: 'Recovery is real, and it is recent. In December 2020 Major League Baseball reclassified the Negro Leagues as major league, folding roughly 3,400 players into the record it had omitted for half a century. In May 2024 the statistics were formally integrated — Josh Gibson surfacing atop the all-time batting list at a .372 average. It is the happiest force in this archive and the most honest about its limit: the numbers return, the names are restored, and the technique mostly stays lost.',
    claims: [
      claim('In December 2020 MLB reclassified the Negro Leagues as major league, recognizing roughly 3,400 players it had previously omitted.', 'pbs-negro-leagues-2020', 'reputable-analysis', { note: 'PBS NewsHour, December 16, 2020.' }),
      claim('In May 2024 the Negro Leagues statistics were integrated into the MLB record books, with Josh Gibson topping the all-time batting average at .372.', 'cbs-negro-leagues-2024', 'reputable-analysis', { note: 'CBS News, May 2024.' }),
    ],
  },
]

/* The receipts under each force: the precise sourced statements the narrative
   paraphrases, filed as claim cards — the canonical unit, never an ad-hoc list. */
function ForceReceipts({ claims }: { claims: Claim<string>[] }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
      {claims.map((c, i) => (
        <ClaimCard key={i} claim={c} />
      ))}
    </div>
  )
}

export function WhyPitchesDie() {
  return (
    <section className="border-t border-ink/15">
      <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-20">
        <p className="rfx-skick">The through-line</p>
        <h2 className="rfx-stitle mt-2 text-3xl leading-tight md:text-4xl">Why pitches die.</h2>
        <p className="mt-4 max-w-[68ch] text-base leading-relaxed text-ink-2">
          An archive of lost pitches is really an archive of how pitches get lost. Four forces take a pitch
          out of the game — and the entries below are what each one left behind.
        </p>

        <ol className="mt-12 space-y-10">
          {FORCES.map((f) => (
            <li key={f.heading} className="grid gap-3 border-l-2 border-seam/40 pl-5 md:grid-cols-[7rem_1fr] md:gap-6 md:pl-0 md:border-l-0">
              <div className="md:border-l-2 md:border-seam/40 md:pl-5">
                <span className="mono-label text-seam">{f.era}</span>
              </div>
              <div>
                <h3 className="font-athletic uppercase text-xl text-ink">{f.heading}</h3>
                <p className="mt-2 max-w-[64ch] text-base leading-relaxed text-ink">{f.body}</p>
                <ForceReceipts claims={f.claims} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
