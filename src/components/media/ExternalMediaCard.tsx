import { useEffect, useRef, useState } from 'react'
import type { ExternalContentItem } from '../../data/media/external'
import { officialEmbedUrl, platformLabel } from '../../data/media/external'
import { usePip } from '../embeds/pipContext'

type LoadState = 'waiting' | 'loading' | 'ready' | 'error'

interface DataSavingNavigator extends Navigator {
  connection?: { saveData?: boolean }
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function trustLabel(item: ExternalContentItem): string {
  if (item.trustLane === 'trusted-mind') return 'Trusted mind'
  if (item.trustLane === 'heritage') return 'Heritage file'
  return 'Community find'
}

function useNearViewportEmbed() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [saveData] = useState(
    () => typeof navigator !== 'undefined' && Boolean((navigator as DataSavingNavigator).connection?.saveData),
  )
  // The `document` guard keeps this false during the build-time prerender (plain
  // Node, no DOM): without it every card baked a live provider iframe into the
  // static HTML, so X and TikTok were fetched on first paint for every reader,
  // whatever their scroll position or data-saver setting. In a real browser that
  // lacks IntersectionObserver the old eager fallback still applies.
  const [near, setNear] = useState(
    () => typeof document !== 'undefined' && typeof IntersectionObserver === 'undefined' && !saveData,
  )
  const [manual, setManual] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, shouldLoad: manual || (near && !saveData), saveData, load: () => setManual(true) }
}

export function ExternalMediaCard({ item }: { item: ExternalContentItem }) {
  const provider = platformLabel(item.platform)
  const embedUrl = officialEmbedUrl(item)
  const pip = usePip()
  const [popped, setPopped] = useState(false)
  const [loadState, setLoadState] = useState<LoadState>('waiting')
  const { ref, shouldLoad, saveData, load } = useNearViewportEmbed()
  const portrait = item.platform === 'tiktok' || item.platform === 'instagram'
  const inDock = popped || (
    pip.active?.platform === item.platform && pip.active.externalId === item.externalId
  )

  const visibleLoadState = shouldLoad && embedUrl && !inDock && loadState === 'waiting' ? 'loading' : loadState
  // A pulled-down post has nothing to load, so its placeholder must not pretend to
  // be a button: tapping it would do nothing at all.
  const canLoad = Boolean(embedUrl) && item.availability !== 'removed'
  const placeholderFace = (
    <span>
      <img
        src="/brand/seal-128.webp"
        alt=""
        width={48}
        height={48}
        loading="lazy"
        decoding="async"
        className="mx-auto opacity-70"
      />
      <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.13em] text-bone-2">
        {item.availability === 'removed'
          ? 'Original post unavailable'
          : saveData
            ? `Data saver · load ${provider}`
            : `Load from ${provider}`}
      </span>
    </span>
  )

  useEffect(() => {
    if (visibleLoadState !== 'loading') return
    const timeout = window.setTimeout(() => {
      setLoadState((current) => (current === 'waiting' ? 'error' : current))
    }, 12_000)
    return () => window.clearTimeout(timeout)
  }, [visibleLoadState])

  const popOut = () => {
    setPopped(true)
    pip.open(
      {
        platform: item.platform,
        externalId: item.externalId,
        title: item.title,
        author: item.sourceHandle,
        authorUrl: item.sourceUrl,
        url: item.canonicalUrl,
      },
      () => setPopped(false),
    )
  }

  return (
    <article
      ref={ref}
      className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-bone/14 bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(8,7,6,0.96)_42%)] shadow-[0_24px_60px_-38px_rgba(0,0,0,0.95)]"
      data-external-provider={item.platform}
    >
      <header className="flex items-center justify-between gap-3 border-b border-bone/10 px-4 py-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-cyan">
          {trustLabel(item)} · {provider}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-bone-2/65">
          {formatDate(item.publishedAt)}
        </span>
      </header>

      <div
        className="relative overflow-hidden border-b border-bone/10 bg-[radial-gradient(circle_at_50%_30%,rgba(55,214,255,0.14),transparent_48%),#050505]"
        style={{ aspectRatio: portrait ? '9 / 13' : '16 / 10' }}
      >
        {inDock ? (
          <button
            type="button"
            onClick={() => {
              setPopped(false)
              pip.close()
            }}
            className="absolute inset-0 grid place-items-center px-5 text-center"
          >
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.13em] text-bone-2">
                Playing in the Watch Dock
              </span>
              <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.13em] text-cyan">
                Return it to this card
              </span>
            </span>
          </button>
        ) : shouldLoad && embedUrl && item.availability !== 'removed' ? (
          <>
            {visibleLoadState === 'loading' ? (
              <div role="status" className="absolute inset-0 grid place-items-center text-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-bone-2">
                  Loading from {provider}…
                </span>
              </div>
            ) : null}
            {visibleLoadState !== 'error' ? (
              <iframe
                src={embedUrl}
                title={`${item.title} — ${provider} embed`}
                loading="lazy"
                className={`absolute inset-0 h-full w-full transition-opacity ${visibleLoadState === 'ready' ? 'opacity-100' : 'opacity-0'}`}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => setLoadState('ready')}
                onError={() => setLoadState('error')}
              />
            ) : null}
          </>
        ) : canLoad ? (
          <button
            type="button"
            onClick={load}
            className="absolute inset-0 grid place-items-center px-6 text-center"
          >
            {placeholderFace}
          </button>
        ) : (
          <div className="absolute inset-0 grid place-items-center px-6 text-center">
            {placeholderFace}
          </div>
        )}

        {visibleLoadState === 'error' ? (
          <div role="status" className="absolute inset-0 grid place-items-center px-6 text-center">
            <span className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-bone-2">
              The {provider} player did not load. The credited source link still works below.
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-5 py-5">
        <p className="rfx-athletic text-[clamp(21px,2.6vw,29px)] uppercase leading-[1.02] text-bone">
          {item.title}
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-bone-2">{item.lede}</p>
        {item.sourceCaption ? (
          <p className="mt-3 line-clamp-3 border-l border-bone/20 pl-3 text-[12px] italic leading-relaxed text-bone-2/75">
            “{item.sourceCaption}”
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {embedUrl && item.availability !== 'removed' ? (
            <button
              type="button"
              onClick={popOut}
              className="rounded-sm border border-cyan/35 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.11em] text-cyan transition-colors hover:border-cyan hover:text-bone"
            >
              Watch Dock ↘
            </button>
          ) : null}
          <a
            href={item.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-bone/18 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.11em] text-bone-2 transition-colors hover:border-bone/40 hover:text-bone"
          >
            Original post ↗
          </a>
        </div>
        <p className="mt-3 font-mono text-[9px] uppercase leading-relaxed tracking-[0.08em] text-bone-2/55">
          Embedded from {provider}; credited and never rehosted.
        </p>
      </div>
    </article>
  )
}
