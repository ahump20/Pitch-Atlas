import { usePip } from './pip'
import { teachingClipForSlug, type TeachingClip } from '../../data/media/tiktok'

/*
  A teaching-clip card: the original post, credited, that opens in the floating
  PIP player so the reader keeps scrolling the chapter. Embed-or-link, never
  rehost (docs/MEDIA-LEDGER.md) — the card itself loads nothing third-party; the
  TikTok player only mounts (in the PIP) when the reader opts in, and the
  "Watch on TikTok" outbound link is always there as the link-tier fallback.
  The clip is a credited source, not a measured claim.
*/

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export function TikTokEmbed({ clip, accentColor }: { clip: TeachingClip; accentColor?: string }) {
  const pip = usePip()
  return (
    <figure className="overflow-hidden rounded-lg border border-bone/15 bg-press">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-bone/10 px-5 py-3">
        <span className="mono-label-stage" style={accentColor ? { color: accentColor } : undefined}>
          See it taught · {clip.author} on TikTok
        </span>
        <span className="mono-label-stage opacity-70">Added {fmtDate(clip.retrievedAt)}</span>
      </figcaption>

      <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-start md:gap-6">
        <div className="min-w-0 flex-1">
          <p className="font-athletic text-[clamp(20px,2.6vw,28px)] uppercase leading-[1.04] text-bone [text-wrap:balance]">
            {clip.title}
          </p>
          <p className="mt-2.5 max-w-[60ch] text-[15px] leading-relaxed text-bone-2">{clip.lede}</p>
          <p className="mt-3 max-w-[60ch] border-l border-bone/20 pl-3 text-[13px] italic leading-relaxed text-bone-2/85">
            “{clip.caption}”
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                pip.open({
                  videoId: clip.videoId,
                  title: clip.title,
                  author: clip.author,
                  authorUrl: clip.authorUrl,
                  url: clip.url,
                })
              }
              className="inline-flex items-center gap-2 rounded-sm border border-cyan/60 px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-cyan transition-colors hover:border-cyan hover:bg-cyan/10"
            >
              <span aria-hidden="true">▶</span> Watch here
            </button>
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
            Original post, credited and linked — not rehosted.
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
