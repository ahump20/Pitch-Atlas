import { Link } from 'react-router-dom'
import type { ArchiveImage } from '../../data/media/archive-images'
import { LOST_PITCH_ARCHIVE_IMAGES } from '../../data/media/archive-images'
import { StageTierMarker } from '../layout/StageTierMarker'
import { RefractorSource } from '../provenance/RefractorClaim'

function ArchiveImageCard({ image, variant = 'grid' }: { image: ArchiveImage; variant?: 'grid' | 'detail' }) {
  const isDetail = variant === 'detail'

  return (
    <article
      className={`rounded-sm border border-bone/10 bg-press p-4 ${
        isDetail ? 'grid gap-5 md:grid-cols-[1.18fr_0.82fr] md:p-5' : ''
      }`}
    >
      <div className="relative overflow-hidden rounded-sm border border-bone/15 bg-[#090807]">
        <img
          src={image.imageSrc}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
          sizes={isDetail ? '(min-width: 768px) 58vw, 100vw' : '(min-width: 1280px) 31vw, (min-width: 640px) 46vw, 100vw'}
          className="aspect-[4/3] w-full object-cover grayscale"
        />
      </div>
      <div className={isDetail ? 'flex min-w-0 flex-col justify-center' : 'mt-4'}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="mono-label text-bone-2">{image.label}</span>
          <span className="mono-label text-cyan">{image.plateKind.replace('-', ' ')}</span>
        </div>
        <p className="font-athletic text-2xl uppercase leading-none text-bone">{image.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-bone-2">{image.caption}</p>
        <p className="mt-3 text-xs leading-relaxed text-ink-2">{image.qualityNote}</p>
        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="mono-label text-cyan">{image.rights}</span>
          {image.source ? (
            <>
              <span aria-hidden="true" className="text-ink-3">/</span>
              <RefractorSource source={image.source} />
            </>
          ) : null}
        </div>
        <Link
          to={`/lost-pitches/${image.relatedSlug}`}
          className="mt-4 inline-flex mono-label text-bone-2 transition-colors hover:text-bone"
        >
          Open {image.relatedLabel} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}

export function LostPitchArchiveRail() {
  const publicDomainCount = LOST_PITCH_ARCHIVE_IMAGES.filter((image) => image.rights === 'public-domain').length
  const originalCount = LOST_PITCH_ARCHIVE_IMAGES.filter((image) => image.rights === 'original').length

  return (
    <section className="relative border-y border-bone/10 bg-[#070605]">
      <div className="pa-atmo pa-atmo-leather opacity-[0.06]" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <StageTierMarker index="I" label="Image record" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <h2 className="display max-w-[10ch] text-4xl leading-none text-bone md:text-5xl">
              Give the record a filed image.
            </h2>
            <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-bone-2">
              The lost-pitches wing can carry historical material without pretending the grip survived. Each entry now
              gets a public-domain plate or a first-party study, and the card says which one it is.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-sm border border-bone/10 bg-void/50 p-3">
            <div>
              <p className="font-athletic text-3xl leading-none text-bone">{LOST_PITCH_ARCHIVE_IMAGES.length}</p>
              <p className="mono-label mt-1 text-ink-2">plates filed</p>
            </div>
            <div>
              <p className="font-athletic text-3xl leading-none text-bone">{publicDomainCount}</p>
              <p className="mono-label mt-1 text-ink-2">public domain</p>
            </div>
            <div>
              <p className="font-athletic text-3xl leading-none text-bone">{originalCount}</p>
              <p className="mono-label mt-1 text-ink-2">original</p>
            </div>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {LOST_PITCH_ARCHIVE_IMAGES.map((image) => (
            <ArchiveImageCard key={image.id} image={image} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function LostPitchArchivePlate({ image }: { image: ArchiveImage }) {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <ArchiveImageCard image={image} variant="detail" />
    </section>
  )
}
