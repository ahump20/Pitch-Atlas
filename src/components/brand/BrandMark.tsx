/* A generated decorative badge; real wordmark text supplies its accessible name.
   This brand illustration never substitutes for the authoritative seam schematic. */
type Size = 'sm' | 'md' | 'lg'

const MARK_PX: Record<Size, number> = { sm: 38, md: 48, lg: 64 }
const WORDMARK_SIZE: Record<Size, string> = {
  sm: '20px',
  md: '30px',
  lg: 'clamp(30px, 5.2vw, 58px)',
}

export function BrandMark({
  size = 'md',
  wordmark = true,
  className,
}: {
  size?: Size
  wordmark?: boolean
  className?: string
}) {
  const px = MARK_PX[size]

  return (
    <span className={`brand-lockup inline-flex items-center gap-3 ${className ?? ''}`}>
      <img src="/brand/atlas-emblem-v2.png" width={px} height={px} alt="" aria-hidden="true" className="brand-emblem shrink-0" />
      {wordmark ? (
        <span className="brand-wordmark rfx-athletic rfx-skew leading-none text-bone" style={{ fontSize: WORDMARK_SIZE[size] }}>
          Pitch <span className="rfx-holo" data-brand-material="rainbow-foil">Atlas</span>
        </span>
      ) : null}
    </span>
  )
}
