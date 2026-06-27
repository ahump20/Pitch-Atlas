import { useEgg } from './EggProvider'
import { EggDialog } from './EggDialog'

/*
  The reveal an easter egg opens: one real, sourced tidbit, presented as a found
  artifact. Rendered once in the root layout; shows only when a tidbit is active.
  The fact wears its source like everything else in the atlas.
*/
export function TidbitReveal() {
  const { active, dismiss, count, total, openIndex } = useEgg()
  if (!active) return null

  return (
    <EggDialog onClose={dismiss} labelledBy="tidbit-reveal-title">
      <p className="mono-label-stage text-cyan">Archive note found</p>
      <h2 id="tidbit-reveal-title" className="font-display mt-2 text-2xl leading-snug text-bone">
        {active.title}
      </h2>
      <p className="mt-3 leading-relaxed text-bone-2">{active.claim.value}</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-bone/10 pt-4">
        <div className="flex flex-col gap-1">
          {active.claim.source ? (
            <a
              href={active.claim.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mono-label-stage text-bone-2 underline decoration-bone-2/40 underline-offset-2 transition-colors hover:text-bone hover:decoration-cyan"
            >
              {active.claim.source.label}
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => {
              dismiss()
              openIndex()
            }}
            className="mono-label-stage w-fit text-bone-2/70 underline decoration-bone-2/30 underline-offset-2 transition-colors hover:text-bone"
          >
            Filed: {count} of {total} found
          </button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-sm border border-bone/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-bone transition-colors hover:border-cyan/70 hover:bg-bone/[0.05]"
        >
          Close
        </button>
      </div>
    </EggDialog>
  )
}
