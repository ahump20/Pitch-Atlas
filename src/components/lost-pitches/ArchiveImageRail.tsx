import { Link } from 'react-router-dom'
import type { ArchiveImage } from '../../data/media/archive-images'
import { LOST_PITCH_ARCHIVE_IMAGES } from '../../data/media/archive-images'
import { StageTierMarker } from '../layout/StageTierMarker'
import { RefractorSource } from '../provenance/RefractorClaim'

function ArchiveImageCard({ image, compact = false }: { image: ArchiveImage; compact?: boolean }) {
  return (
    <article className="rounded-sm border border-bone/10 bg-press p-4">
      <div className="relative overflow-hidden rounded-sm border border-bone/15 bg-[#090807]">
        <img
          src={image.imageSrc}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          className={`w-full object-cover grayscale ${compact ? 'aspect-[5/3]' : 'aspect-[4/3]'}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(5,4,3,0.82))]" />
        <span className="absolute bottom-3 left-3 mono-label text-bone">{image.label}</span>
      </div>
      <div className="mt-4">
        <p className="font-athletic text-[24px] uppercase leading-none text-bone">{image.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-bone-2">{image.caption}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="mono-label text-cyan">{image.rights}</span>
          {image.source ? (
            <>
              <span aria-hidden="true" className="text-ink-3">/</span>
              <RefractorSource source={image.source} />
            </>
          ) : null}
        </div>
      </div>
      {image.relatedSlug ? (
        <Link
          to={`/lost-pitches/${image.relatedSlug}`}
          className="mt-4 inline-flex mono-label text-bone-2 transition-colors hover:text-bone"
        >
          Open {image.relatedLabel ?? 'the file'} <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </article>
  )
}

export function LostPitchArchiveRail() {
  return (
    <section className="relative border-y border-bone/10 bg-[#070605]">
      <div className="pa-atmo pa-atmo-leather opacity-[0.06]" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <StageTierMarker index="I" label="Image record" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-end">
          <div>
            <h2 className="display max-w-[10ch] text-4xl leading-none text-bone md:text-5xl">
              Give the record a face.
            </h2>
            <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-bone-2">
              The lost-pitches wing can carry historical material without pretending the grip survived.
              These are public-domain plates, cropped and credited. The technical claims stay in the
              sourced record.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {LOST_PITCH_ARCHIVE_IMAGES.map((image) => (
              <ArchiveImageCard key={image.id} image={image} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function LostPitchArchivePlate({ image }: { image: ArchiveImage }) {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <ArchiveImageCard image={image} compact />
    </section>
  )
}
