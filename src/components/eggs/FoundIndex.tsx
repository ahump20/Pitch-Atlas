import { useEgg } from './EggProvider'
import { EggDialog } from './EggDialog'
import { TIDBITS } from '../../data/tidbits'

/*
  The found-index: the collected tidbits, in the spirit of a specimen catalog. A
  discovered note shows in full with its source; an undiscovered one stays a locked
  slot that names only where it is filed, so the hunt has a map without giving the
  answers away. Rendered once in the root layout; shows when opened.
*/
export function FoundIndex() {
  const { indexOpen, closeIndex, has, count, total } = useEgg()
  if (!indexOpen) return null

  return (
    <EggDialog onClose={closeIndex} labelledBy="found-index-title" className="max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mono-label-stage text-cyan">Hidden archive notes</p>
          <h2 id="found-index-title" className="font-display mt-2 text-2xl leading-snug text-bone">
            {count} of {total} found
          </h2>
        </div>
        <button
          type="button"
          onClick={closeIndex}
          className="rounded-sm border border-bone/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-bone transition-colors hover:border-cyan/70 hover:bg-bone/[0.05]"
        >
          Close
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-bone-2/80">
        Ten real, sourced tidbits are hidden across the historical files. Find one and it gets filed
        here. Locked slots name only where they are filed.
      </p>

      <ul className="mt-5 max-h-[55vh] space-y-3 overflow-y-auto pr-1">
        {TIDBITS.map((t) => {
          const found = has(t.id)
          return (
            <li
              key={t.id}
              className={`rounded-sm border p-4 ${
                found ? 'border-bone/15 bg-bone/[0.03]' : 'border-bone/8 bg-transparent'
              }`}
            >
              {found ? (
                <>
                  <h3 className="font-display text-lg leading-snug text-bone">{t.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-bone-2">{t.claim.value}</p>
                  {t.claim.source ? (
                    <a
                      href={t.claim.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono-label-stage mt-2 inline-block text-bone-2/70 underline decoration-bone-2/30 underline-offset-2 transition-colors hover:text-bone hover:decoration-cyan"
                    >
                      {t.claim.source.label}
                    </a>
                  ) : null}
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="text-bone-2/40">
                    &middot;
                  </span>
                  <p className="mono-label-stage text-bone-2/55">
                    Not yet found &middot; filed from {t.eggLocation}
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </EggDialog>
  )
}
