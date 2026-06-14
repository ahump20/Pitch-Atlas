import { lazy, Suspense, useId, useState } from 'react'
import { Skeleton } from '../ui/skeleton'

/*
  Per-topic discussion: one component, many homes (a pitch page, a basic repertoire
  page, a lost-pitch page). Collapsed by default — a drop-down a visitor opens — so
  it makes no network call until opened. The heavy interactive half (the thread,
  composer, dialogs, and every shadcn primitive they pull in) lives in
  DiscussionForum.tsx and is code-split: React.lazy below keeps it out of the
  initial page bundle entirely, so a visitor who never opens the panel never
  downloads it. The chunk fetches the first time the panel opens, behind a labelled
  skeleton fallback. The dynamic import is a browser-only event (a click), so SSG
  prerender only ever emits the collapsed shell — no browser-only code runs at
  build time.
*/

const DiscussionForum = lazy(() => import('./DiscussionForum'))

function ForumFallback() {
  // The loading state for the lazy chunk: a labelled skeleton, not a bare spinner,
  // so the four-state contract holds while the code is in flight.
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <span className="mono-label text-ink-3">Loading the discussion…</span>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  )
}

export function DiscussionPanel({
  topicKey,
  topicName,
  variant = 'full',
}: {
  topicKey: string
  topicName: string
  variant?: 'full' | 'compact'
}) {
  const [open, setOpen] = useState(false)
  const regionId = useId()

  return (
    <section aria-label="Discussion" id="discussion" className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <div className="rfx-panel">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <span className="flex items-center gap-3">
            <span className="rfx-skick text-cyan">Discussion</span>
            <span className="text-sm text-bone-2">
              {variant === 'compact' ? topicName : `Talk through the ${topicName.toLowerCase()}`}
            </span>
          </span>
          <span aria-hidden="true" className={`mono-label text-ink-3 transition-transform ${open ? 'rotate-90' : ''}`}>
            ›
          </span>
        </button>
        {open ? (
          <div id={regionId} className="border-t border-ink/15 px-5 py-6">
            <Suspense fallback={<ForumFallback />}>
              <DiscussionForum topicKey={topicKey} open={open} />
            </Suspense>
          </div>
        ) : null}
      </div>
    </section>
  )
}
