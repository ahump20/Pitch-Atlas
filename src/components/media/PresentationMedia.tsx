import type { PresentationMediaAsset } from '../../data/media/presentation'

function SourceCredit({ asset, light = false }: { asset: PresentationMediaAsset; light?: boolean }) {
  const className = `font-mono text-[9px] uppercase tracking-[0.1em] ${light ? 'text-bone/70' : 'text-ink-2'}`
  if (!asset.credit.sourceUrl) return <span className={className}>{asset.credit.label}</span>

  return (
    <span className={className}>
      Photo{' '}
      <a className="underline decoration-current/35 underline-offset-4 hover:text-cyan" href={asset.credit.sourceUrl} target="_blank" rel="noopener noreferrer">
        {asset.credit.label}
      </a>
      {asset.credit.licenseUrl ? (
        <>
          {' / '}
          <a className="underline decoration-current/35 underline-offset-4 hover:text-cyan" href={asset.credit.licenseUrl} target="_blank" rel="noopener noreferrer">
            License
          </a>
        </>
      ) : null}
    </span>
  )
}

export function PresentationPicture({
  asset,
  className = '',
  eager = false,
}: {
  asset: PresentationMediaAsset
  className?: string
  eager?: boolean
}) {
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={asset.variants.mobile.src} />
      <img
        src={asset.variants.desktop.src}
        alt={asset.alt}
        width={asset.variants.desktop.width}
        height={asset.variants.desktop.height}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
        className={className}
        onError={(event) => {
          const image = event.currentTarget
          if (image.src.endsWith(asset.fallback)) return
          // The mobile art direction lives on a sibling <source>, which outranks
          // img.src below 768px — drop it first or the fallback never paints on a
          // phone.
          image.parentElement?.querySelectorAll('source').forEach((source) => source.remove())
          image.removeAttribute('srcset')
          image.src = asset.fallback
        }}
      />
    </picture>
  )
}

export function PresentationBackdrop({
  asset,
  className = '',
  eager = false,
}: {
  asset: PresentationMediaAsset
  className?: string
  eager?: boolean
}) {
  return (
    <div className={`presentation-backdrop pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <PresentationPicture asset={asset} className="presentation-parallax h-full w-full object-cover" eager={eager} />
    </div>
  )
}

export function PresentationCredit({ asset, className = '' }: { asset: PresentationMediaAsset; className?: string }) {
  return <div className={className}><SourceCredit asset={asset} light /></div>
}
