import { useState } from 'react'
import { usePip } from './pip'
import { teachingClipForSlug, type TeachingClip } from '../../data/media/tiktok'

/*
  A teaching-clip card: the original post, embedded inline as TikTok's own player,
  credited, with the creator's caption and an outbound link kept alongside. The
  reader can pop the player out into the floating window (usePip) to keep scrolling
  the chapter while it plays; popping out unmounts the inline frame so the clip is
  never playing in two places. Embed-or-link, never rehost (docs/MEDIA-LEDGER.md) —
  TikTok serves the media from its own player, fully credited; no file is ever
  downloaded into the repo. The clip is a credited source, not a measured claim.
*/

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export function TikTokEmbed({ clip, accentColor }: { clip: TeachingClip; accentColor?: string }) {
  const pip = usePip()
  const [popped, setPopped] = useState(false)

  const popOut = () => {
    setPopped(true)
    pip.open(
      {
        videoId: clip.videoId,
        title: clip.title,
        author: clip.author,
        authorUrl: clip.authorUrl,
        url: clip.url,
      },
      () => setPopped(false),
    )
  }

  const bringBack = () => {
    setPopped(false)
    pip.close()
  }

  return (
    <figure className="overflow-hidden rounded-lg border border-bone/15 bg-press">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-bone/10 px-5 py-3">
        <span className="mono-label-stage" style={accentColor ? { color: accentColor } : undefined}>
          See it taught · {clip.author} on TikTok
        </span>
        <span className="mono-label-stage opacity-70">Added {fmtDate(clip.retrievedAt)}</span>
      </figcaption>

      <div className="flex flex-col gap-5 px-5 py-5 md:flex-row md:items-start md:gap-7">
        {/* The actual video — TikTok's own player, embedded inline at full size. */}
        <div className="mx-auto w-full max-w-[300px] flex-none md:mx-0">
          <div
            className="relative w-full overflow-hidden rounded-md border border-bone/15 bg-black"
            style={{ aspectRatio: '9 / 16' }}
          >
            {popped ? (
              <button
                type="button"
                onClick={bringBack}
                className="absolute inset-0 grid place-items-center gap-2 px-4 text-center transition-colors hover:bg-bone/[0.03]"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-bone-2">
                  Playing in the corner ↘
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-cyan">
                  Bring it back here
                </span>
              </button>
            ) : (
              <iframe
                src={`https://www.tiktok.com/player/v1/${clip.videoId}?rel=0&description=0&music_info=0`}
                title={clip.title}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
              />
            )}
          </div>
          {!popped && (
            <button
              type="button"
              onClick={popOut}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-bone/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-bone-2 transition-colors hover:border-cyan/60 hover:text-bone"
            >
              <span aria-hidden="true">⤢</span> Pop out &amp; keep scrolling
            </button>
          )}
        </div>

        {/* Context — credit, the plain-language pointer, the creator's caption, outbound link. */}
        <div className="min-w-0 flex-1">
          <p className="font-athletic text-[clamp(20px,2.6vw,28px)] uppercase leading-[1.04] text-bone [text-wrap:balance]">
            {clip.title}
          </p>
          <p className="mt-2.5 max-w-[60ch] text-[15px] leading-relaxed text-bone-2">{clip.lede}</p>
          <p className="mt-3 max-w-[60ch] border-l border-bone/20 pl-3 text-[13px] italic leading-relaxed text-bone-2/85">
            “{clip.caption}”
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <a
              href={clip.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-bone/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-bone-2 transition-colors hover:border-bone/45 hover:text-bone"
            >
              Watch on TikTok <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2/55">
            Original post, embedded from TikTok and credited — not rehosted.
          </p>
        </div>
      </div>
    </figure>
  )
}

/*
  Section wrapper for the filed-specimen chapters: renders the clip filed against
  this pitch's slug, or nothing. Kept out of the canonical pitch records (and the
  iOS generator) on purpose — this is a web-only embed surface.
*/
export function TeachingClipSection({ slug, accentColor }: { slug: string; accentColor?: string }) {
  const clip = teachingClipForSlug(slug)
  if (!clip) return null
  return (
    <section className="border-t border-bone/8 py-[clamp(34px,5vw,64px)]">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <TikTokEmbed clip={clip} accentColor={accentColor} />
      </div>
    </section>
  )
}
