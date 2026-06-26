import { Link } from 'react-router-dom'
import type { Craftsman } from '../../data/types'
import {
  craftsmanMediaForSlug,
  featuredCraftsmanMedia,
  type CraftsmanMediaItem,
} from '../../data/media/craftsmen'
import { StageTierMarker } from '../layout/StageTierMarker'
import { TikTokEmbed } from '../embeds/TikTokEmbed'
import { RiveraTeachingLead } from '../embeds/RiveraTeachingLead'

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

function MediaFrame({ item }: { item: CraftsmanMediaItem }) {
  return (
    <div className="relative overflow-hidden rounded-sm border border-bone/15 bg-[#070605] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="mono-label text-cyan">{item.kind === 'tiktok' ? 'TikTok embed' : 'X embed'}</span>
        <span className="mono-label text-bone-2/70">{fmtDate(item.retrievedAt)}</span>
      </div>
      <div className="mt-4 grid aspect-video place-items-center overflow-hidden rounded-sm border border-bone/10 bg-[radial-gradient(circle_at_50%_40%,rgba(48,211,241,0.14),transparent_45%),#0d0c0b]">
        <img
          src="/brand/seal-128.webp"
          alt=""
          width={54}
          height={54}
          loading="lazy"
          decoding="async"
          className="opacity-75"
        />
      </div>
    </div>
  )
}

export function CraftsmenMediaShelf() {
  const items = featuredCraftsmanMedia()
  if (items.length === 0) return null

  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-4 pt-14 md:px-8 md:pt-20">
      <div className="pa-atmo pa-atmo-seam opacity-[0.05]" aria-hidden="true" />
      <div className="relative">
        <StageTierMarker index="F" label="Film filed" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <h2 className="display max-w-[11ch] text-4xl leading-none text-ink md:text-5xl">
              The clip belongs under the arm.
            </h2>
            <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-ink-2">
              Teaching footage now files beside the craftsman when the rights posture is embed-only
              and the source is credited. The media stays at the source; the atlas gives it a shelf.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {items.map((item) => (
              <Link
                key={`${item.kind}-${item.id}-${item.craftsmanSlug}`}
                to={`/craftsmen/${item.craftsmanSlug}`}
                className="group rounded-sm border border-ink/15 bg-press p-4 transition-colors hover:border-cyan/50"
              >
                <MediaFrame item={item} />
                <p className="font-athletic mt-4 text-[22px] uppercase leading-tight text-bone">
                  {item.craftsmanName}
                </p>
                <p className="mt-1 mono-label text-cyan">{item.title}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-bone-2">{item.lede}</p>
                <p className="mt-4 mono-label text-bone-2 transition-colors group-hover:text-bone">
                  Open the file <span aria-hidden="true">→</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function CraftsmanMediaSection({ craftsman }: { craftsman: Craftsman }) {
  const items = craftsmanMediaForSlug(craftsman.slug)
  if (items.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
      <StageTierMarker index="02b" label="The lesson, on film" />
      <div className="flex flex-col gap-8">
        {items.map((item) =>
          item.kind === 'tiktok' ? (
            <TikTokEmbed key={`${item.kind}-${item.id}`} clip={item.clip} />
          ) : (
            <div
              key={`${item.kind}-${item.id}`}
              className="grid grid-cols-1 items-start gap-10 md:grid-cols-12"
            >
              <div className="md:col-span-6">
                <p className="max-w-[52ch] text-lg leading-relaxed text-ink">{item.lede}</p>
                <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-ink-2">
                  Shared by Rob Friedman ({item.author}). Embedded with credit, never rehosted.
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-sm border border-seam/60 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-seam transition-colors hover:bg-seam/10"
                >
                  Watch at source <span aria-hidden="true">↗</span>
                </a>
              </div>
              <div className="md:col-span-6 lg:col-span-5 lg:col-start-8">
                <RiveraTeachingLead />
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  )
}
