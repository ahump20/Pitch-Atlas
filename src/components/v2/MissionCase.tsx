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
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-seam">Mission</p>
          <h2 className="rfx-athletic v2-display mt-4 max-w-[14ch] text-[clamp(34px,6vw,68px)] leading-[0.92]">
            Preserve the art before it disappears.
          </h2>
          <p className="mt-6 max-w-[64ch] text-[16px] leading-relaxed text-bone-2 md:text-[17px]">
            Behind the art of pitching sits a harder intersection: feel, repeatable craft,
            unreasonable self-belief, and the mind under pressure. Pitch Atlas makes that tradition
            public without turning it into fake certainty.
          </p>
          <p className="mt-4 max-w-[64ch] text-[16px] leading-relaxed text-bone-2 md:text-[17px]">
            It is Austin Humphrey&apos;s flagship baseball archive: a grip-first field manual where
            pitchers, coaches, and curious builders can see how a pitch is held, how it is
            described, and where the claim came from.
          </p>

          <div className="mt-9 grid gap-5 sm:grid-cols-3">
            {VALUES.map((value) => (
              <div key={value.label} className="border-t border-bone/15 pt-4">
                <h3 className="rfx-athletic text-[clamp(20px,2.8vw,30px)] leading-none text-bone">
                  {value.label}
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-bone-2">{value.text}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="md:col-span-5">
          <div className="border-y border-bone/15 py-6 md:sticky md:top-24">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-seam">
              Founding note: personal memory, not endorsement
            </p>
            <p className="display mt-5 text-[clamp(25px,3.1vw,38px)] italic leading-snug text-bone">
              Ryan was a thrower. Clemens was a pitcher.
            </p>
            <p className="mt-5 text-[14.5px] leading-relaxed text-bone-2">
              At a Parents&apos; Weekend night at Rio on West 6th in Austin, Austin remembers telling
              Roger Clemens he had modeled his game after Clemens and Nolan Ryan. Clemens asked the
              difference. Austin answered with the line above.
            </p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-bone-2">
              They bumped fists. Clemens bought Austin and his mother a round. The weekend moved
              on, but the distinction stuck: force is only one ingredient. Grip, approach, and
              command of the moment have to survive too.
            </p>
            <ol className="mt-6 space-y-3">
              {GOALS.map((goal, i) => (
                <li key={goal} className="flex gap-3 border-t border-bone/10 pt-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone-2/70">
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
