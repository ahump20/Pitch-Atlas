import { useId, useRef, useState } from 'react'
import { useDiscussion } from '../../hooks/useDiscussion'
import type { DiscussionMedia, DiscussionPost } from '../../lib/discussion'
import { sniffMediaKind } from '../../lib/discussion'
import { DISCUSSION_LIMITS, MEDIA_ACCEPT, UPLOAD_TERMS } from '../../data/discussion'

/*
  Per-topic discussion: one component, many homes (a pitch page, a basic repertoire
  page, a lost-pitch page). Collapsed by default — a drop-down a visitor opens — so
  it makes no network call until opened. Open it to read the thread, post a comment,
  reply once, and attach your own photos or video. Native uploads are gated behind a
  one-time terms acceptance; everything renders the four data states (loading, error,
  empty, populated). "Sourced, not corrected" still governs: a clip is evidence, not
  a verdict, and nothing here is faked.
*/

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function MediaItem({ m }: { m: DiscussionMedia }) {
  if (!m.url) {
    return (
      <div className="rfx-panel flex aspect-video items-center justify-center border-dashed text-center">
        <span className="mono-label text-ink-3">Media under review</span>
      </div>
    )
  }
  if (m.kind === 'image') {
    return (
      <img
        src={m.url}
        loading="lazy"
        decoding="async"
        width={m.width ?? undefined}
        height={m.height ?? undefined}
        alt="Contributor upload"
        className="w-full rounded-sm border border-[rgba(255,255,255,0.12)] object-contain"
      />
    )
  }
  return (
    <video src={m.url} controls preload="metadata" className="w-full rounded-sm border border-[rgba(255,255,255,0.12)]" />
  )
}

function PostBody({
  post,
  depth,
  onReply,
  onReport,
  onDelete,
}: {
  post: DiscussionPost
  depth: number
  onReply: (postId: string) => void
  onReport: (target: { postId: string } | { mediaId: string }) => void
  onDelete: (postId: string) => void
}) {
  return (
    <article className={depth > 0 ? 'border-l-2 border-[rgba(255,255,255,0.12)] pl-4' : ''}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="rfx-athletic rfx-skew text-base text-cyan">{post.displayName}</span>
        <span className="mono-label text-ink-3">{timeAgo(post.createdAt)}</span>
        {post.viewerIsAuthor ? <span className="mono-label text-seam">you</span> : null}
      </div>
      <p className="mt-1.5 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-bone">{post.body}</p>

      {post.media.length > 0 ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {post.media.map((m) => (
            <div key={m.id} className="flex flex-col gap-1">
              <MediaItem m={m} />
              <button
                type="button"
                onClick={() => onReport({ mediaId: m.id })}
                className="self-start font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3 transition-colors hover:text-seam"
              >
                Report media
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {depth === 0 ? (
          <button
            type="button"
            onClick={() => onReply(post.id)}
            className="mono-label text-ink-3 transition-colors hover:text-seam"
          >
            Reply
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onReport({ postId: post.id })}
          className="mono-label text-ink-3 transition-colors hover:text-seam"
        >
          Report
        </button>
        {post.viewerIsAuthor ? (
          <button
            type="button"
            onClick={() => onDelete(post.id)}
            className="mono-label text-ink-3 transition-colors hover:text-seam"
          >
            Delete
          </button>
        ) : null}
      </div>
    </article>
  )
}

function Composer({
  defaultName,
  acceptedTerms,
  onAcceptTerms,
  onSubmit,
  onCancel,
  placeholder,
  compact,
}: {
  defaultName: string
  acceptedTerms: boolean
  onAcceptTerms: () => Promise<void>
  onSubmit: (input: { displayName: string; body: string; files: File[] }) => Promise<void>
  onCancel?: () => void
  placeholder: string
  compact?: boolean
}) {
  const [name, setName] = useState(defaultName)
  const [body, setBody] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fileId = useId()
  const fileRef = useRef<HTMLInputElement>(null)

  async function pickFiles(list: FileList | null) {
    if (!list) return
    const picked: File[] = []
    for (const f of Array.from(list).slice(0, DISCUSSION_LIMITS.maxFilesPerPost)) {
      const kind = await sniffMediaKind(f)
      if (!kind) {
        setErr(`${f.name} is not an allowed image or video.`)
        continue
      }
      const cap = kind === 'image' ? DISCUSSION_LIMITS.imageMaxBytes : DISCUSSION_LIMITS.videoMaxBytes
      if (f.size > cap) {
        setErr(`${f.name} is too large (${kind === 'image' ? '8 MB' : '50 MB'} max).`)
        continue
      }
      picked.push(f)
    }
    setFiles(picked)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (name.trim().length < DISCUSSION_LIMITS.displayNameMin) {
      setErr('Add a name (2+ characters) so people know who is talking.')
      return
    }
    if (body.trim().length === 0) {
      setErr('Write something first.')
      return
    }
    setBusy(true)
    try {
      await onSubmit({ displayName: name.trim(), body: body.trim(), files })
      setBody('')
      setFiles([])
      if (fileRef.current) fileRef.current.value = ''
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Could not post that.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={DISCUSSION_LIMITS.displayNameMax}
        placeholder="Your name"
        className="rfx-input text-sm"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={DISCUSSION_LIMITS.bodyMax}
        rows={compact ? 2 : 3}
        placeholder={placeholder}
        className="rfx-input text-sm leading-relaxed"
      />

      {/* Media: gated behind a one-time terms acceptance. */}
      {acceptedTerms ? (
        <div className="flex flex-col gap-2">
          <label htmlFor={fileId} className="mono-label cursor-pointer text-cyan transition-colors hover:text-bone">
            + Add photos or video
          </label>
          <input
            id={fileId}
            ref={fileRef}
            type="file"
            accept={MEDIA_ACCEPT}
            multiple
            onChange={(e) => void pickFiles(e.target.files)}
            className="sr-only"
          />
          {files.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {files.map((f) => (
                <li key={f.name} className="mono-label rfx-panel px-2 py-1 text-bone-2">
                  {f.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <details className="rfx-panel border-dashed px-3 py-2">
          <summary className="mono-label cursor-pointer text-bone-2">Want to attach photos or video?</summary>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-xs leading-snug text-bone-2">
            {UPLOAD_TERMS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => void onAcceptTerms()}
            className="mono-label mt-3 rounded-sm bg-cyan px-3 py-1.5 font-semibold text-[#06121b] transition-colors hover:bg-[color-mix(in_srgb,var(--color-cyan)_88%,#000)]"
          >
            I agree — enable uploads
          </button>
        </details>
      )}

      {err ? <p className="text-sm text-seam">{err}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-sm bg-cyan px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] font-semibold text-[#06121b] transition-colors hover:bg-[color-mix(in_srgb,var(--color-cyan)_88%,#000)] disabled:opacity-60"
        >
          {busy ? 'Posting…' : 'Post'}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="mono-label text-ink-3 transition-colors hover:text-seam">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}

function Forum({ topicKey, open }: { topicKey: string; open: boolean }) {
  const d = useDiscussion(topicKey, open)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [reporting, setReporting] = useState<{ postId: string } | { mediaId: string } | null>(null)

  async function confirmReport(reason: string) {
    if (!reporting) return
    try {
      await d.reportTarget(reporting, reason)
    } finally {
      setReporting(null)
    }
  }

  if (d.status === 'loading' || d.status === 'idle') {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <div className="h-4 w-1/3 animate-pulse rounded bg-[rgba(255,255,255,0.08)]" />
        <div className="h-16 w-full animate-pulse rounded bg-[rgba(255,255,255,0.08)]" />
        <div className="h-16 w-full animate-pulse rounded bg-[rgba(255,255,255,0.08)]" />
      </div>
    )
  }

  if (d.status === 'error') {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-bone-2">Could not load the discussion. {d.error}</p>
        <button onClick={d.refresh} className="mono-label rounded-sm border border-[rgba(255,255,255,0.12)] px-3 py-1.5 text-bone-2 hover:border-seam hover:text-seam">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <Composer
        defaultName={d.displayName}
        acceptedTerms={d.acceptedTerms}
        onAcceptTerms={d.acceptTerms}
        onSubmit={(input) => d.submit({ ...input })}
        placeholder="Share a breakdown, a grip tweak, a clip — keep it about the pitch."
      />

      <p className="border-t border-[rgba(255,255,255,0.12)] pt-3 text-xs leading-relaxed text-ink-3">
        Shared as experience and technique, not personal medical advice — nothing here replaces a coach or
        physician. Reports from a few accounts auto-hide a post or a clip for review.
      </p>

      {d.posts.length === 0 ? (
        <p className="text-sm text-bone-2">No comments yet. Start the thread.</p>
      ) : (
        <ul className="flex flex-col gap-7">
          {d.posts.map((post) => (
            <li key={post.id} className="flex flex-col gap-4">
              <PostBody
                post={post}
                depth={0}
                onReply={setReplyTo}
                onReport={setReporting}
                onDelete={d.remove}
              />
              {post.replies.length > 0 ? (
                <ul className="ml-2 flex flex-col gap-4">
                  {post.replies.map((reply) => (
                    <li key={reply.id}>
                      <PostBody
                        post={reply}
                        depth={1}
                        onReply={setReplyTo}
                        onReport={setReporting}
                        onDelete={d.remove}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
              {replyTo === post.id ? (
                <div className="ml-2 border-l-2 border-cyan/40 pl-4">
                  <Composer
                    compact
                    defaultName={d.displayName}
                    acceptedTerms={d.acceptedTerms}
                    onAcceptTerms={d.acceptTerms}
                    onSubmit={async (input) => {
                      await d.submit({ ...input, parentId: post.id })
                      setReplyTo(null)
                    }}
                    onCancel={() => setReplyTo(null)}
                    placeholder={`Reply to ${post.displayName}…`}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {reporting ? (
        <div className="rfx-panel border-seam/40 p-4">
          <p className="mono-label mb-2 text-seam">Report this?</p>
          <p className="mb-3 text-sm text-bone-2">
            Tell us briefly what is wrong (optional). A few reports hide it for review.
          </p>
          <ReportForm onConfirm={confirmReport} onCancel={() => setReporting(null)} />
        </div>
      ) : null}
    </div>
  )
}

function ReportForm({ onConfirm, onCancel }: { onConfirm: (reason: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState('')
  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={300}
        placeholder="What is wrong?"
        className="rfx-input text-sm"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onConfirm(reason.trim())}
          className="rounded-sm bg-cyan px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] font-semibold text-[#06121b] hover:bg-[color-mix(in_srgb,var(--color-cyan)_88%,#000)]"
        >
          Submit report
        </button>
        <button type="button" onClick={onCancel} className="mono-label text-ink-3 hover:text-seam">
          Cancel
        </button>
      </div>
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
          <div id={regionId} className="border-t border-[rgba(255,255,255,0.12)] px-5 py-6">
            <Forum topicKey={topicKey} open={open} />
          </div>
        ) : null}
      </div>
    </section>
  )
}
