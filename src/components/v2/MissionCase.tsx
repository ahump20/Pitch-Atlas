import { Link } from 'react-router-dom'
import { ChapterMark } from './ChapterMark'

const VALUES = [
  {
    label: 'The grip is the artifact',
    text: 'Thumb pressure, seam contact, finger spread, and feel cues get filed before they vanish into memory.',
  },
  {
    label: 'The mind has weight',
    text: 'Approach and self-belief matter, but they do not replace evidence. They sit beside the grip as firsthand account, quote, or coaching note.',
  },
  {
    label: 'Evidence beats polish',
    text: 'A clean unknown is better than padded certainty. Every claim gets a source, a confidence label, or a visible gap.',
  },
]

const GOALS = [
  'Build the public field manual for pitch craft.',
  'Preserve oral technique without flattening it into one correct answer.',
  'Give the next pitcher a sourced place to start, not a fake number to trust.',
]

export function MissionCase() {
  return (
    <section id="mission" className="v2-stage v2-tooth relative border-t border-bone/10">
      <div className="relative z-[1] mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-5 py-20 md:grid-cols-12 md:gap-12 md:px-8 md:py-28">
        <div className="md:col-span-7">
          <ChapterMark n="01" name="The Mission" />
          <h2 className="rfx-athletic v2-display mt-5 max-w-[14ch] text-[clamp(34px,6vw,68px)] leading-[0.92]">
            Preserve the art before it disappears.
          </h2>

          {/* the thesis, lifted out of body copy into the founder's serif register —
              the most distinctive sentence on the page, finally staged like one. */}
          <p className="v2-lede mt-7 max-w-[40ch]">
            Behind the Art of Pitching lies a crossroad of subtle nuance, obsessive perfectionism, a
            possessed psychosis of self-belief, and, most crucially, the mastery of the mind.
          </p>

          <p className="mt-7 max-w-[60ch] text-[15.5px] leading-relaxed text-bone-2 md:text-[16.5px]">
            Pitch Atlas is built on a simple idea: the collective progression, careful documentation,
            and perpetual preservation of how pitchers grip and approach the artistry of the game —
            keeping the oral techniques and traditions of our forefathers free and accessible for the
            generations to come. It is Austin Humphrey&apos;s flagship archive of that craft, made
            public without turning it into fake certainty.
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
                <span className="display mt-2 block text-[17px] text-bone/90">&mdash; Austin Humphrey</span>
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
