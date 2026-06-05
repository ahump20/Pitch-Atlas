import type { PitchAtlasEntry } from '../../data/types'
import { RANK_SIGNALS, RANK_WEIGHTS, FIELD_NOTE_PRIMITIVES } from '../../data/field-notes'

/*
  Tier 03. The living layer, kept honest. No posts are live yet, so nothing here
  is a real submission and no count is invented. What is real: the structure
  every note will take, the model that ranks evidence over noise, and a waitlist
  that opens posting only after moderation and youth-safety review exist. The
  workbench sets the room; the parchment below holds the shape.
*/

const WAITLIST_MAILTO =
  'mailto:humphrey.austin20@gmail.com' +
  '?subject=' +
  encodeURIComponent('Pitch Atlas Field Notes early access') +
  '&body=' +
  encodeURIComponent(
    "I want in when Field Notes opens. My level / arm slot / a grip I'd log:\n\n",
  )

/** The illustrative shape of a note. Stamped TEMPLATE; never presented as real. */
const TEMPLATE_ROWS: { field: string; value: string }[] = [
  { field: 'Pitch', value: 'set from the current specimen' },
  { field: 'Variant', value: 'Thumb tucked deeper under the leather' },
  { field: 'Submitted by', value: 'HS RHP, three-quarter slot' },
  { field: 'Context', value: 'Smaller hands, fastball arm speed' },
  { field: 'Claimed result', value: 'More fade, less velocity separation' },
  { field: 'Evidence', value: 'Video link, pending review' },
  { field: 'Source tier', value: 'Community, firsthand' },
  { field: 'Status', value: 'Opens after moderation and safety review' },
]

export function FieldNotes({ entry }: { entry: PitchAtlasEntry }) {
  const { community, canonical } = entry

  return (
    <section id="field-notes" className="scroll-mt-24">
      <div className="relative overflow-hidden bg-stage">
        <img
          src="/brand/workbench.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(13,13,9,0.92) 0%, rgba(13,13,9,0.62) 52%, rgba(13,13,9,0.30) 100%)' }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <p className="mono-label-stage">Tier 03 / Field Notes</p>
          <h2 className="display mt-4 max-w-[16ch] text-[2.4rem] leading-[1.02] text-bone md:text-5xl">
            Field notes from the bullpen.
          </h2>
          <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-bone-2">
            Every pitcher fiddles. A thumb creeps lower, a seam catches more leather, a cue from a coach
            suddenly makes the pitch move. Pitch Atlas keeps those experiments visible, labeled, and
            debated, so the small discoveries stop disappearing into group chats and comment sections.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <div className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-12">
          <div className="flex flex-col gap-8 md:col-span-7">
            <div>
              <p className="mono-label text-navy">How notes rank</p>
              <h3 className="display mt-3 text-2xl leading-snug text-ink md:text-3xl">
                Evidence and context, never who shouts loudest.
              </h3>
              <p className="mt-4 max-w-[58ch] leading-relaxed text-ink-2">
                There is no single correct way to throw a pitch, but there are better and worse claims.
                A funny comment should never outrank a tested grip. So notes do not rise on votes. They
                rise on five signals, weighted.
              </p>
            </div>

            <ul className="flex flex-col">
              {RANK_SIGNALS.map((signal) => {
                const pct = Math.round(RANK_WEIGHTS[signal.key] * 100)
                return (
                  <li key={signal.key} className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 border-t border-navy/12 py-4">
                    <div className="flex w-28 flex-col gap-1.5 sm:w-32">
                      <span className="font-mono text-sm tabular-nums text-navy">{pct}%</span>
                      <span aria-hidden="true" className="h-1 rounded-full bg-navy/10">
                        <span className="block h-1 rounded-full bg-navy" style={{ width: `${pct}%` }} />
                      </span>
                    </div>
                    <div>
                      <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink">{signal.label}</span>
                      <p className="mt-1 max-w-[52ch] text-sm leading-relaxed text-ink-2">{signal.blurb}</p>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div>
              <p className="mono-label text-navy">The vocabulary</p>
              <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {FIELD_NOTE_PRIMITIVES.map((p) => (
                  <div key={p.term} className="flex flex-col gap-0.5 border-t border-navy/10 pt-2.5">
                    <dt className="font-mono text-xs uppercase tracking-[0.1em] text-ink">{p.term}</dt>
                    <dd className="text-sm leading-snug text-ink-2">{p.gloss}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="flex flex-col gap-8 md:col-span-5">
            <div>
              <p className="mono-label text-navy">The shape of a note</p>
              <article className="mt-4 rounded-sm border-2 border-navy bg-paper p-1.5 shadow-[0_2px_0_0_var(--color-navy-line)]">
                <div className="rounded-[2px] border border-seam/40 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy">Field note</span>
                    <span
                      className="rounded-[2px] border border-seam/50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-seam"
                      style={{ transform: 'rotate(2deg)' }}
                    >
                      Template
                    </span>
                  </div>
                  <dl className="flex flex-col">
                    {TEMPLATE_ROWS.map((row) => (
                      <div key={row.field} className="grid grid-cols-[7.5rem_1fr] gap-3 border-t border-navy/10 py-2.5">
                        <dt className="mono-label">{row.field}</dt>
                        <dd className={`text-sm leading-snug ${row.field === 'Variant' ? 'text-ink' : 'text-ink-2'}`}>
                          {row.field === 'Pitch' ? canonical.name : row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
              <p className="mt-3 text-xs leading-relaxed text-ink-2">
                The shape every note will take. Nothing above is a real submission. No field note is live yet.
              </p>
            </div>

            <div className="rounded-sm border border-navy/15 bg-paper-2/50 p-6">
              <div className="mb-4 flex items-center gap-3">
                <img src="/brand/seal-128.webp" alt="" width={36} height={36} loading="lazy" decoding="async" aria-hidden="true" className="opacity-80" />
                <h3 className="display text-xl text-ink">Not open yet, on purpose.</h3>
              </div>

              <div className="mb-5 overflow-hidden rounded-sm border border-navy/15">
                <div className="grid grid-cols-[2.5rem_1fr_5.5rem_6rem] gap-2 border-b border-navy/15 bg-paper-2/70 px-3 py-2">
                  {community.columns.map((c) => (
                    <span key={c} className="mono-label">{c}</span>
                  ))}
                </div>
                <p className="px-4 py-8 text-center text-sm leading-relaxed text-ink-2">
                  No field notes yet. The first one shapes the bar.
                </p>
              </div>

              <p className="text-sm leading-relaxed text-ink-2">{community.safetyNote}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{community.provenanceNote}</p>

              <a
                href={WAITLIST_MAILTO}
                className="mt-6 inline-flex items-center gap-2 rounded-sm border border-navy bg-navy px-5 py-3 font-mono text-sm tracking-wide text-bone transition-colors hover:bg-navy-2 active:translate-y-px"
              >
                Join the waitlist
                <span aria-hidden="true">→</span>
              </a>
              <p className="mt-3 text-xs leading-relaxed text-ink-2">
                Posting opens after moderation and youth-safety review are live. Coach and parent
                verification are part of the launch. No signup count is shown until it is real.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
