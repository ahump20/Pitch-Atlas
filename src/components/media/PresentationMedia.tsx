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
          image.src = asset.fallback
          image.removeAttribute('srcset')
        }}
      />
    </picture>
  )
}

export function HeritageTransition({ asset }: { asset: PresentationMediaAsset }) {
  return (
    <section className="presentation-heritage relative isolate overflow-hidden border-y border-bone/10" aria-labelledby={`${asset.id}-title`}>
      <PresentationPicture asset={asset} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,5,9,.94),rgba(7,5,9,.56)_48%,rgba(7,5,9,.82)),linear-gradient(0deg,rgba(7,5,9,.9),transparent_65%)]" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-[270px] max-w-[1240px] flex-col justify-end px-5 py-10 md:min-h-[360px] md:px-8 md:py-14">
        <p className="rfx-skick text-cyan">Heritage lives under every new pitch</p>
        <h2 id={`${asset.id}-title`} className="rfx-stitle mt-3 max-w-[15ch] text-[clamp(30px,5vw,58px)] text-bone">
          The craft begins where the game has been worn in.
        </h2>
        <div className="mt-5"><SourceCredit asset={asset} light /></div>
      </div>
    </section>
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
