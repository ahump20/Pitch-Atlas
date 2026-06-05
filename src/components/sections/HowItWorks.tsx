import { scrollToId } from '../../lib/scroll'

/*
  The product premise, stated once and recurring as a motif: Foundation, Masters,
  Field Notes. Three layers of the same record, each labeled by where it came
  from and ranked by evidence, never declared right or wrong. Not three identical
  cards: the Foundation reads as textbook, the Masters as a navy archive plate
  (the trust hook), the Field Notes as a parchment note not yet open.
*/

const LAYERS = [
  {
    no: '01',
    label: 'Foundation',
    tier: 'Textbook',
    body: 'The canonical grip, release, and physics. Diagram-first, plain language, the part everyone agrees on.',
    target: 'grip-lab',
    cta: 'Open the Grip Lab',
  },
  {
    no: '02',
    label: 'Masters',
    tier: 'Verified, attributed',
    body: 'How named arms actually throw it. Every figure season-stamped, confidence-labeled, and one click from its source.',
    target: 'masters',
    cta: 'Read the Master Files',
  },
  {
    no: '03',
    label: 'Field Notes',
    tier: 'Community, sourced',
    body: 'The variants pitchers discover by hand, ranked by evidence and context, not by who shouts loudest. Opening soon.',
    target: 'field-notes',
    cta: 'See how it works',
  },
] as const

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-navy/12 bg-paper-2/40">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="mono-label text-navy">How the Atlas works</p>
            <h2 className="display mt-4 text-3xl leading-tight text-ink md:text-[2.75rem]">
              One pitch, three layers of the record.
            </h2>
          </div>
          <p className="max-w-[60ch] self-end text-lg leading-relaxed text-ink-2 md:col-span-7">
            A four-seam can be thrown a dozen credible ways. The Atlas does not pick the right one. It
            records what is known, attributes it, and labels how confident the source is. The reader
            judges. The Atlas only sources.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {LAYERS.map((layer, i) => {
            const isMasters = layer.label === 'Masters'
            const isSoon = layer.label === 'Field Notes'
            return (
              <div
                key={layer.label}
                className={`relative flex flex-col gap-4 rounded-sm p-6 ${
                  isMasters
                    ? 'border-l-2 border-navy bg-paper shadow-[0_1px_0_0_var(--color-navy-line)]'
                    : isSoon
                      ? 'border border-dashed border-navy/25 bg-paper-2/60'
                      : 'border-t-2 border-navy/30 bg-paper'
                }`}
              >
                {isMasters ? (
                  <>
                    <span aria-hidden="true" className="absolute left-3 top-3 h-3 w-3 border-l border-t border-navy/40" />
                    <span aria-hidden="true" className="absolute right-3 top-3 h-3 w-3 border-r border-t border-navy/40" />
                  </>
                ) : null}
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-sm tabular-nums text-navy">{layer.no}</span>
                  <span className={`mono-label ${isMasters ? 'text-teal' : ''}`}>{layer.tier}</span>
                </div>
                <h3 className="display text-2xl text-ink">{layer.label}</h3>
                <p className="text-[0.9375rem] leading-relaxed text-ink-2">{layer.body}</p>
                <a
                  href={`#${layer.target}`}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToId(layer.target)
                  }}
                  className={`mt-auto inline-flex items-center gap-1.5 pt-2 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
                    isMasters ? 'text-navy hover:text-seam' : 'text-ink-2 hover:text-seam'
                  }`}
                >
                  {layer.cta}
                  <span aria-hidden="true">{i === 0 ? '↓' : '→'}</span>
                </a>
              </div>
            )
          })}
        </div>

        <p className="mt-8 max-w-[78ch] border-t border-navy/12 pt-6 text-sm leading-relaxed text-ink-2">
          And in the margins, a fourth layer: Community Notes, where corrections, nuance, and honest
          disagreement stay visible and controlled, the way a good coach writes in the margin of a
          page rather than tearing it out.
        </p>
      </div>
    </section>
  )
}
