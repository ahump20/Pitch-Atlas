import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { ChapterMark } from './ChapterMark'
import { Descent } from '../motion/Descent'

const VALUES = [
  {
    label: 'The grip is the artifact',
    text: 'Thumb pressure, seam contact, finger spread, and feel cues are the object in the drawer, not decoration around it.',
  },
  {
    label: 'The pitch is the culture',
    text: 'A grip matters because it carries the pitcher, the era, the hitter problem, and the reason the shape survived.',
  },
  {
    label: 'The unknown stays visible',
    text: 'A clean gap is better than padded certainty. Every claim gets a source, a confidence label, or a visible unknown.',
  },
]

const GOALS = [
  'Preserve the pitches baseball almost forgot.',
  'Progress the craft for the pitchers still searching.',
  'Catalog the lineage without trapping the art in boxes.',
]

const PROGRESSION = [
  {
    label: 'Discover',
    text: 'Find the pitch in the catalog and see where it sits beside its family and aliases.',
  },
  {
    label: 'Study',
    text: 'Read the grip, shape, cue, and source before copying the movement.',
  },
  {
    label: 'Throw',
    text: 'Take the idea to the bullpen or catch session and make it physical.',
  },
  {
    label: 'Document',
    text: 'Add the clip, image, grip tweak, or note with rights and context attached.',
  },
  {
    label: 'Preserve',
    text: 'Leave a one-of-one specimen in the record so the next pitcher is not starting from rumor.',
  },
]

/* the chapter's accent: published to the far stratum and worn by the chapter tick */
const SCENE_TINT = '#6CACE4'

export function MissionCase() {
  return (
    <section
      id="mission"
      data-scene-tint={SCENE_TINT}
      className="v2-stage v2-tooth relative border-t border-bone/10"
    >
      <Descent />
      <div className="relative z-[1] mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-5 py-20 md:grid-cols-12 md:gap-12 md:px-8 md:py-28">
        <div className="md:col-span-7">
          <ChapterMark n="01" name="The Mission" accent={SCENE_TINT} />
          <h2 className="rfx-athletic v2-display mt-5 max-w-[14ch] text-[clamp(34px,6vw,68px)] leading-[0.98] [text-wrap:balance] md:leading-[0.92]">
            Preserve and progress the art of the pitch.
          </h2>

          {/* the thesis, lifted out of body copy into the founder's serif register —
              the most distinctive sentence on the page, finally staged like one. */}
          <p className="v2-lede mt-7 max-w-[40ch]">
            The goal is not nostalgia. It is continuity.
          </p>

          <p className="mt-7 max-w-[60ch] text-[15.5px] leading-relaxed text-bone-2 md:text-[16.5px]">
            Pitch Atlas exists to canonize, catalog, and contextualize baseball&apos;s craft
            knowledge: the grips, variants, feel cues, forgotten experiments, master examples,
            and field notes that disappear when a player ages out, a coach retires, or a pitch
            falls out of fashion.
          </p>

          <p className="mt-5 max-w-[60ch] text-[15.5px] leading-relaxed text-bone-2 md:text-[16.5px]">
            Every pitch is treated as a specimen with history. Every grip is preserved as
            evidence. Every upload can become part of a living archive, filed without turning
            lived feel into fake certainty.
          </p>

          {/* the values, struck as filed index cards. one seam tick per section lives
              on the chapter mark; these carry the plain index number so the accent
              reads as signal, not repeated ornament. */}
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {VALUES.map((value, i) => (
              <div key={value.label} className="border-t border-bone/15 pt-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] tabular-nums text-bone-2/70">
                  V·{String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="rfx-athletic mt-2.5 text-[clamp(19px,2.7vw,28px)] leading-none text-bone">
                  {value.label}
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-bone-2">{value.text}</p>
              </div>
            ))}
          </div>

          <div className="v2-progression mt-10" aria-label="Archival progression">
            <ol className="mt-4 grid gap-3 sm:grid-cols-5">
              {PROGRESSION.map((step, i) => (
                <li key={step.label} className="v2-progress-step" style={{ '--i': i } as CSSProperties}>
                  <span className="v2-progress-no">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="rfx-athletic mt-3 text-[20px] leading-none text-bone">{step.label}</h3>
                  <p className="mt-2 text-[12.5px] leading-snug text-bone-2">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="md:col-span-5">
          <div className="md:sticky md:top-24">
            {/* the founding note — the human voice filed as its own specimen, staged
                with the care the wall gives a pitch: card stock, a seam filing rule,
                the Clemens line enlarged under an oversized hanging quote mark. The
                "personal memory, not endorsement" guard reads at the card's baseline
                weight, never below the boast it qualifies — sourced, not corrected. */}
            <figure className="v2-note">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em]">
                <span className="text-bone-2/55">Founding note</span>{' '}
                <span className="text-cyan">·</span>{' '}
                <span className="text-bone-2">personal memory, not endorsement</span>
              </p>
              <span className="v2-quote-mark mt-4" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote className="v2-quote -mt-1">
                <span className="md:block">The Express… he was a Thrower.</span>{' '}
                <span className="md:block">The Rocket… you&rsquo;re a Pitcher.</span>
              </blockquote>
              <figcaption className="mt-5 border-t border-bone/12 pt-4">
                <span className="block font-mono text-[9.5px] uppercase tracking-[0.12em] text-bone-2/70">
                  To Roger Clemens · Parents&rsquo; Weekend · Austin, TX
                </span>
                <span className="display mt-2 block text-[17px] text-bone/90">Austin Humphrey</span>
              </figcaption>

              <p className="mt-5 text-[13.5px] leading-relaxed text-bone-2">
                At Rio, a bar on West 6th during Parents&rsquo; Weekend, I told Roger Clemens I&rsquo;d
                modeled my game after him and Nolan Ryan — mechanics to mentality. He asked the
                difference. I gave him the line above.
              </p>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-bone-2">
                We bumped fists. He bought my mother and me a round. The weekend moved on; the
                distinction stuck — force is only one ingredient. The grip, the approach, and command
                of the moment have to survive too.
              </p>
              <p className="mt-5">
                <Link
                  to="/about"
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan transition-colors hover:text-bone focus-visible:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
                >
                  Read the full story <span aria-hidden="true">→</span>
                </Link>
              </p>
            </figure>

            {/* the goals, filed as a numbered ledger — plain index, no repeated tick */}
            <ol className="mt-8 space-y-3.5">
              {GOALS.map((goal, i) => (
                <li key={goal} className="flex gap-3 border-t border-bone/10 pt-3.5">
                  <span className="flex-none font-mono text-[10px] uppercase tracking-[0.12em] tabular-nums text-bone-2/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[13.5px] leading-relaxed text-bone">{goal}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </section>
  )
}
