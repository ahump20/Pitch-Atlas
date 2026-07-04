import { useReveal } from './Reveal'

/*
  The descent. RefractionBridge's one-off boundary mark, generalized: the
  thread dropping from one filed chapter to the next — a hairline, three
  stitch ticks, and the open seam-point it lands on. Drawn in by a CSS clip
  wipe on a view() timeline where supported, a one-shot IO class where not,
  and simply present under reduced motion. Decorative by construction: every
  section reads complete without it.
*/
export function Descent({ className = '' }: { className?: string }) {
  const { ref, shown } = useReveal<HTMLDivElement>('0px 0px -4% 0px')
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`descent pointer-events-none absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center ${shown ? 'is-landed' : ''} ${className}`}
    >
      <span className="descent-line block h-9 w-px bg-gradient-to-b from-transparent via-bone/15 to-bone/30" />
      <svg className="descent-ticks" viewBox="0 0 16 34" width="16" height="34" focusable="false">
        {[5, 16, 27].map((y, i) => (
          <path
            key={y}
            d={i % 2 === 0 ? `M4 ${y - 3.5} L12 ${y + 3.5}` : `M12 ${y - 3.5} L4 ${y + 3.5}`}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </svg>
      <span className="descent-point mt-0.5 block h-1.5 w-1.5 rotate-45 rounded-[1px] border border-bone/30" />
    </div>
  )
}
