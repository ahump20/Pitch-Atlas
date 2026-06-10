import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { SectionHero } from '../components/layout/SectionHero'

const FIELD_ROWS = [
  {
    label: 'Measurement dashboards',
    examples: [
      { label: 'Baseball Savant', href: 'https://baseballsavant.mlb.com/leaderboard/pitch-movement' },
      { label: 'PitchComp', href: 'https://pitchcomp.app/' },
    ],
    answer: 'What did the ball do after release?',
    gap: 'They are built around measured movement, pitch identity, and outcome. The hand on the ball is usually outside the frame.',
  },
  {
    label: 'Smart balls and lab tools',
    examples: [
      { label: 'pitchLogic', href: 'https://pitchlogic.com/baseball' },
      { label: 'CleanFuego', href: 'https://www.cleanfuego.com/' },
    ],
    answer: 'What feedback can a pitcher get from a rep?',
    gap: 'They connect feel to data or visual feedback. They do not try to preserve a public archive of sourced grip variants.',
  },
  {
    label: 'Coaching and pitch design',
    examples: [
      { label: 'Driveline', href: 'https://www.drivelinebaseball.com/remote-pitch-design/' },
      { label: 'Pitching Coach U', href: 'https://www.pitchingcoachu.com/gripdatabase' },
      { label: 'Mustard', href: 'https://apps.apple.com/us/app/mustard-pitching/id1526812408' },
    ],
    answer: 'What should this athlete try next?',
    gap: 'That is coaching. Pitch Atlas is reference first: it records the grip, the read, the source, and the limit of the claim.',
  },
  {
    label: 'Grip pages and clips',
    examples: [{ label: 'Driveline grip notes', href: 'https://help.drivelinebaseball.com/portal/en/kb/driveline-help/about-my-training/general-training-advice/pitch-grips' }],
    answer: 'Show me one way to hold it.',
    gap: 'The usual format is a page, clip, PDF, or post. Useful, but scattered. Hard to compare. Easy to lose.',
  },
]

const VALUE_ROWS = [
  {
    stamp: '1',
    label: 'The grip leads',
    text: 'A pitch starts as something a hand can actually hold. Shape, physics, and biography come after that, not before it.',
  },
  {
    stamp: '2',
    label: 'The source is visible',
    text: 'A claim does not get smoothed into authority. Official data, pitcher words, coach observation, analysis, secondhand record, and community notes all wear different labels.',
  },
  {
    stamp: '3',
    label: 'Variants are allowed to disagree',
    text: 'The atlas does not crown one correct grip. It lets credible versions sit side by side, because pitchers do not all have the same hand, release, or feel cue.',
  },
  {
    stamp: '4',
    label: 'Missingness stays visible',
    text: 'If the grip record is thin, the page says so. A blank file with honest edges is better than a full card padded with fake certainty.',
  },
]

const TRUTH_ROWS = [
  {
    label: 'Known',
    text: 'Pitch Atlas is a static, sourced field manual for grips, pitch variants, craftsmen, lost pitches, and shape language. Its live pages carry source and confidence labels.',
  },
  {
    label: 'Unknown',
    text: 'A still grip photo does not prove velocity, spin, command, injury risk, or final movement. That takes tracking data, video context, or a direct source.',
  },
  {
    label: 'Open',
    text: 'The archive gets stronger as more clean grip photos, pitcher-owned notes, and measured first-party tests can be filed without breaking the source model.',
  },
]

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-cyan transition-colors hover:text-bone">
      {children}
    </a>
  )
}

export function AboutPage() {
  useSeoMeta({
    title: `About ${SITE.siteName}: Why the Grip Comes First`,
    description:
      'Pitch Atlas is a sourced field manual for pitching grips: grip-first, provenance-labeled, and honest about what each source can prove.',
    ogTitle: `About ${SITE.siteName}: why the grip comes first`,
    ogDescription: 'The grip-first field manual for pitch craft. Sourced, not corrected.',
    ogUrl: `${SITE.canonicalDomain}/about`,
    twitterCard: 'summary_large_image',
  })

  return (
    <>
      <SectionHero
        eyebrow="About Pitch Atlas"
        title={
          <>
            The pitch, in your <span className="rfx-chrome-text">hand</span>.
          </>
        }
        sub={
          <p>
            Pitch Atlas is a sourced field manual for pitch craft. It starts with the grip, then files
            the shape, the person, and the source label that tells you how much weight the claim can
            carry.
          </p>
        }
        breadcrumb={<Breadcrumb trail={[{ label: 'Pitch Atlas', to: '/' }, { label: 'About' }]} />}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/repertoire"
            className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-mono text-sm font-bold uppercase tracking-wide text-[#06121b] transition-transform active:translate-y-px"
            style={{ background: 'var(--color-cyan)', boxShadow: '0 6px 24px -8px var(--color-cyan)' }}
          >
            Open the Pitch Index <span aria-hidden="true">→</span>
          </Link>
          <Link
            to="/sources"
            className="inline-flex items-center gap-2 rounded-md border border-bone/30 px-5 py-3 font-mono text-sm uppercase tracking-wide text-bone transition-colors hover:border-bone"
          >
            Read the source model <span aria-hidden="true">→</span>
          </Link>
        </div>
      </SectionHero>

      <section className="border-t border-bone/10">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-8 md:py-20">
          <div className="md:col-span-5">
            <p className="rfx-skick">What it is</p>
            <h2 className="rfx-stitle mt-3 max-w-[15ch] text-[clamp(28px,5vw,56px)]">
              The part a chart cannot hold.
            </h2>
            <p className="mt-4 max-w-[50ch] text-[15px] leading-relaxed text-bone-2">
              A dashboard can tell you what the ball did. It cannot always tell you where the thumb
              sat, which seam caught the pad, or why one pitcher swears by a hold another pitcher
              cannot make work.
            </p>
            <p className="mt-4 max-w-[50ch] text-[15px] leading-relaxed text-bone-2">
              That is the gap. Pitch Atlas treats the grip as the specimen and the source label as
              part of the interface.
            </p>
          </div>

          <div className="md:col-span-7">
            <div className="border-t border-bone/10">
              {VALUE_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className="grid gap-4 border-b border-bone/10 py-5 sm:grid-cols-[4.25rem_1fr]"
                >
                  <span
                    className="h-fit w-fit rounded border border-cyan/50 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-cyan"
                    style={{ transform: `rotate(${i % 2 ? -2 : 2}deg)` }}
                  >
                    {row.stamp}
                  </span>
                  <div>
                    <h3 className="rfx-athletic rfx-skew text-bone" style={{ fontSize: 'clamp(20px,3vw,30px)' }}>
                      {row.label}
                    </h3>
                    <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-bone-2">{row.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-bone/10">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-8 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-8 md:py-20">
          <div className="md:col-span-5">
            <p className="rfx-skick">Where it came from</p>
            <h2 className="rfx-stitle mt-3 max-w-[14ch] text-[clamp(28px,5vw,52px)]">
              It started as one hand on one ball.
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="max-w-[64ch] text-[16px] leading-relaxed text-bone-2">
              The first grips filed here are photographs of the builder&apos;s own hand. Austin H.
              worked a four-pitch mix in games: four-seam, two-seam, a three-finger changeup, and a
              12-6 curve, with a splitter that rode along for certain spots. There is no circle
              change in the set. His hands were too small to form one, so the file says that
              instead of faking a textbook page.
            </p>
            <p className="mt-4 max-w-[64ch] text-[16px] leading-relaxed text-bone-2">
              That account seeded the whole source model. It is filed as a pitcher&apos;s own words,
              not tracked data, because that is what it is. And it surfaced the gap the atlas now
              works: where the pads sat, which seam the fingers rode, why one pitch stayed in the
              pocket and another never fit. That knowledge lived in exactly one place, the hand
              that learned it, and nobody was writing it down.
            </p>
            <p className="mt-6">
              <Link
                to="/grips"
                className="font-mono text-sm uppercase tracking-wide text-cyan transition-colors hover:text-bone"
              >
                See the grip library <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-bone/10">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <p className="rfx-skick">The nearby field</p>
          <h2 className="rfx-stitle mt-3 max-w-[16ch] text-[clamp(28px,5vw,52px)]">
            There are competitors. They answer different questions.
          </h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-bone/15 bg-[#0b0910]">
            {FIELD_ROWS.map((row) => (
              <div key={row.label} className="grid gap-4 border-b border-bone/10 p-5 last:border-b-0 md:grid-cols-[1.1fr_1fr_1.4fr] md:p-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">Category</p>
                  <h3 className="rfx-athletic rfx-skew mt-2 text-bone" style={{ fontSize: 'clamp(20px,3vw,28px)' }}>
                    {row.label}
                  </h3>
                  <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2">
                    {row.examples.map((example) => (
                      <ExternalLink key={example.href} href={example.href}>
                        {example.label}
                      </ExternalLink>
                    ))}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">Best question</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-bone">{row.answer}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">Where Pitch Atlas fits</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-bone-2">{row.gap}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-bone/10">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-8 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-8 md:py-20">
          <div className="md:col-span-5">
            <p className="rfx-skick">Useful imperfection</p>
            <h2 className="rfx-stitle mt-3 max-w-[15ch] text-[clamp(28px,5vw,52px)]">
              The rough edge is not a style trick.
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="max-w-[64ch] text-[16px] leading-relaxed text-bone-2">
              Pitch Atlas has a wabi-sabi streak when it leaves the record imperfect on purpose:
              a missing grip stays missing, a community note stays a field note, and a schematic
              does not call itself measured if the constants are not pinned.
            </p>
            <p className="mt-4 max-w-[64ch] text-[16px] leading-relaxed text-bone-2">
              That is good only when it protects trust. The useful roughness is source honesty,
              hand texture, and visible limits. Fake patina would be worse than a plain page.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-bone/10">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-8 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-8 md:py-20">
          <div className="md:col-span-5">
            <p className="rfx-skick">Why it exists</p>
            <h2 className="rfx-stitle mt-3 max-w-[13ch] text-[clamp(28px,5vw,52px)]">
              A grip dies with the arm.
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="max-w-[64ch] text-[16px] leading-relaxed text-bone-2">
              A grip is oral tradition. A coach reshapes a kid&apos;s fingers in a bullpen. A
              teammate shows a seam trick between starts. A pitcher feels his way to a hold nobody
              taught him. Almost none of it gets written down with a name attached, and the
              measurement era did not fix that. Cameras and radar now record what the ball does
              after release down to the inch. The hand before release stayed where it always was:
              in dugouts, in scattered clips, in memory.
            </p>
            <p className="mt-4 max-w-[64ch] text-[16px] leading-relaxed text-bone-2">
              The lost-pitches wing shows the price. Holds that won real games survive as
              fragments because nobody filed them while the arm was still around to ask. Pitch
              Atlas exists to file the hold while it can still be asked about. Sourced, because
              memory earns trust through provenance. Uncorrected, because the variant a textbook
              would flag is sometimes the one that fit a real hand.
            </p>
            <p className="mt-4 max-w-[64ch] text-[16px] leading-relaxed text-bone-2">
              Nobody built this before because nobody had to own it. Coaching sells the next
              adjustment. Media sells what the ball just did. Trackers sell the measurement. An
              archive of sourced grips pays off years later, when someone wants to know how a
              pitch was actually held. Preservation is the job nobody claims until the thing is
              already gone.
            </p>
            <p className="mt-6">
              <Link
                to="/lost-pitches"
                className="font-mono text-sm uppercase tracking-wide text-cyan transition-colors hover:text-bone"
              >
                Walk the lost-pitches wing <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-bone/10">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <p className="rfx-skick">Known, unknown, open</p>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {TRUTH_ROWS.map((row, i) => (
              <div
                key={row.label}
                className="rounded-xl border border-bone/12 bg-[#0e0c14] p-5"
                style={{ borderColor: i === 1 ? 'color-mix(in srgb, var(--color-seam-bright) 28%, transparent)' : undefined }}
              >
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: i === 1 ? 'var(--color-seam-bright)' : 'var(--color-cyan)' }}
                >
                  {row.label}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-bone-2">{row.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
