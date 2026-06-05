import { useRef, useState } from 'react'
import { EmbedFallback } from './EmbedFallback'

/*
  A lazy click-to-load video facade. Until the visitor clicks, this is a local
  poster with a play affordance and a real link out: zero third-party bytes, no
  iframe, no tracking on first paint. On intent it injects the Streamable player.
  An 8s load timeout or an iframe error degrades to the credited fallback, so the
  slot is never a blank box. Keeps the page "simple, fast" while honoring the ask
  to embed the real footage.
*/

type State = 'idle' | 'loading' | 'ready' | 'error'

export function StreamableFacade({
  embedSrc,
  watchHref,
  poster,
  title,
  credit,
  aspect = '16 / 9',
}: {
  /** The Streamable iframe src (the share embed URL). */
  embedSrc: string
  /** The public watch page, used for the fallback link. */
  watchHref: string
  /** Local poster image path, or omit for a typographic slate. */
  poster?: string
  title: string
  credit: string
  aspect?: string
}) {
  const [state, setState] = useState<State>('idle')
  const [posterOk, setPosterOk] = useState(Boolean(poster))
  const timer = useRef<number | undefined>(undefined)

  if (!embedSrc) {
    return <EmbedFallback title={title} credit={credit} href={watchHref} ctaLabel="Watch on Streamable" aspect={aspect} />
  }

  if (state === 'error') {
    return <EmbedFallback title={title} credit={credit} href={watchHref} ctaLabel="Watch on Streamable" aspect={aspect} />
  }

  const start = () => {
    setState('loading')
    timer.current = window.setTimeout(() => setState((s) => (s === 'ready' ? s : 'error')), 8000)
  }

  const src = embedSrc + (embedSrc.includes('?') ? '&' : '?') + 'autoplay=1'

  return (
    <figure
      className="relative m-0 overflow-hidden rounded-sm border border-bone/15 bg-press"
      style={{ aspectRatio: aspect }}
    >
      {state === 'idle' ? (
        <button
          type="button"
          onClick={start}
          aria-label={`Play: ${title}`}
          className="group absolute inset-0 flex h-full w-full flex-col items-center justify-center"
        >
          {poster && posterOk ? (
            <img
              src={poster}
              alt=""
              aria-hidden="true"
              onError={() => setPosterOk(false)}
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-95"
            />
          ) : (
            <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(108,172,228,0.12),transparent_60%)]" />
          )}
          <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-seam bg-stage/70 transition-transform group-hover:scale-105 group-active:scale-95">
            <span aria-hidden="true" className="ml-1 block h-0 w-0 border-y-[9px] border-l-[15px] border-y-transparent border-l-bone" />
          </span>
          <span className="relative z-10 mt-3 rounded-sm bg-stage/75 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-bone-2">
            {credit}
          </span>
        </button>
      ) : (
        <>
          {state === 'loading' ? (
            <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-press" />
          ) : null}
          <iframe
            src={src}
            title={title}
            loading="lazy"
            allow="autoplay; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => {
              window.clearTimeout(timer.current)
              setState('ready')
            }}
            onError={() => {
              window.clearTimeout(timer.current)
              setState('error')
            }}
            className="absolute inset-0 h-full w-full border-0"
          />
        </>
      )}
    </figure>
  )
}
