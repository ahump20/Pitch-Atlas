import { useEffect, useId, useRef, useState } from 'react'
import { FlagIcon, ImagePlusIcon, MessageCircleIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { useDiscussion } from '../../hooks/useDiscussion'
import type { DiscussionMedia, DiscussionPost } from '../../lib/discussion'
import { sniffMediaKind } from '../../lib/discussion'
import { DISCUSSION_LIMITS, MEDIA_ACCEPT, UPLOAD_TERMS } from '../../data/discussion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { InputGroup, InputGroupInput, InputGroupTextarea } from '../ui/input-group'
import { Separator } from '../ui/separator'
import { Skeleton } from '../ui/skeleton'

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
      <Empty className="aspect-video border border-dashed border-white/12 bg-card/70">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-muted text-muted-foreground">
            <ImagePlusIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle className="mono-label text-ink-3">Media under review</EmptyTitle>
        </EmptyHeader>
      </Empty>
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
        className="w-full rounded-sm border border-ink/15 object-contain"
      />
    )
  }
  return (
    <video src={m.url} controls preload="metadata" className="w-full rounded-sm border border-ink/15" />
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
    <article className={depth > 0 ? 'border-l-2 border-ink/15 pl-4' : ''}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="rfx-athletic rfx-skew text-base text-cyan">{post.displayName}</span>
        <span className="mono-label text-ink-3">{timeAgo(post.createdAt)}</span>
        {post.viewerIsAuthor ? (
          <Badge variant="destructive" className="h-auto px-1.5 py-0 font-mono text-[9px] uppercase tracking-[0.12em]">
            you
          </Badge>
        ) : null}
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
          <Button
            type="button"
            onClick={() => onReply(post.id)}
            variant="ghost"
            size="sm"
            className="h-auto px-0 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3 hover:text-seam"
          >
            Reply
          </Button>
        ) : null}
        <Button
          type="button"
          onClick={() => onReport({ postId: post.id })}
          variant="ghost"
          size="sm"
          className="h-auto px-0 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3 hover:text-seam"
        >
          <FlagIcon data-icon="inline-start" />
          Report
        </Button>
        {post.viewerIsAuthor ? (
          <Button
            type="button"
            onClick={() => onDelete(post.id)}
            variant="ghost"
            size="sm"
            className="h-auto px-0 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3 hover:text-seam"
          >
            <Trash2Icon data-icon="inline-start" />
            Delete
          </Button>
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
  // the brief 'Filed ✓' confirmation; settles back on its own
  const [sent, setSent] = useState(false)
  const sentTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(sentTimer.current), [])
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
      setSent(true)
      window.clearTimeout(sentTimer.current)
      sentTimer.current = window.setTimeout(() => setSent(false), 2000)
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Could not post that.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={err?.includes('name') ? true : undefined}>
          <FieldLabel htmlFor={`${fileId}-name`}>Your name</FieldLabel>
          <InputGroup className="h-10 bg-card">
            <InputGroupInput
              id={`${fileId}-name`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={DISCUSSION_LIMITS.displayNameMax}
              placeholder="Your name"
              aria-invalid={err?.includes('name') ? true : undefined}
            />
          </InputGroup>
          <FieldDescription>A handle is enough. No real name required.</FieldDescription>
        </Field>

        <Field data-invalid={err === 'Write something first.' ? true : undefined}>
          <FieldLabel htmlFor={`${fileId}-body`}>Comment</FieldLabel>
          <InputGroup className="h-auto bg-card">
            <InputGroupTextarea
              id={`${fileId}-body`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={DISCUSSION_LIMITS.bodyMax}
              rows={compact ? 2 : 3}
              placeholder={placeholder}
              aria-invalid={err === 'Write something first.' ? true : undefined}
              className="leading-relaxed"
            />
          </InputGroup>
          <FieldDescription>{body.length}/{DISCUSSION_LIMITS.bodyMax}</FieldDescription>
        </Field>

      {/* Media: gated behind a one-time terms acceptance. */}
      {acceptedTerms ? (
        <Field>
          <FieldLabel htmlFor={fileId}>Photos or video</FieldLabel>
          <input
            id={fileId}
            ref={fileRef}
            type="file"
            accept={MEDIA_ACCEPT}
            multiple
            onChange={(e) => void pickFiles(e.target.files)}
            className="sr-only"
          />
          <Button type="button" variant="outline" size="sm" asChild className="w-fit">
            <label htmlFor={fileId} className="cursor-pointer">
              <ImagePlusIcon data-icon="inline-start" />
              Add media
            </label>
          </Button>
          {files.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {files.map((f) => (
                <li key={f.name}>
                  <Badge variant="outline" className="max-w-[18rem] truncate font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2">
                    {f.name}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : null}
        </Field>
      ) : (
        <Alert className="border-dashed border-white/15 bg-card">
          <ImagePlusIcon aria-hidden="true" />
          <AlertTitle className="mono-label text-bone-2">Want to attach photos or video?</AlertTitle>
          <AlertDescription>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-xs leading-snug text-bone-2">
            {UPLOAD_TERMS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <Button
            type="button"
            onClick={() => void onAcceptTerms()}
            size="sm"
            className="mt-3"
          >
            I agree, enable uploads
          </Button>
          </AlertDescription>
        </Alert>
      )}

      {err ? (
        <FieldError key={err} className="shake-in">
          {err}
        </FieldError>
      ) : null}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={busy}
          className={`font-mono text-xs uppercase tracking-[0.1em]${busy ? ' is-busy' : ''}`}
        >
          {busy ? 'Posting…' : 'Post'}
        </Button>
        {sent ? (
          <span role="status" className="quiet-status font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
            Filed ✓
          </span>
        ) : null}
        {onCancel ? (
          <Button type="button" onClick={onCancel} variant="ghost" size="sm" className="font-mono text-xs uppercase tracking-[0.12em] text-ink-3 hover:text-seam">
            Cancel
          </Button>
        ) : null}
      </div>
      </FieldGroup>
    </form>
  )
}

function Forum({ topicKey, open }: { topicKey: string; open: boolean }) {
  const d = useDiscussion(topicKey, open)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [reporting, setReporting] = useState<{ postId: string } | { mediaId: string } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function confirmReport(reason: string) {
    if (!reporting) return
    try {
      await d.reportTarget(reporting, reason)
      toast.success('Report sent')
    } catch {
      // a safety report must never claim success it didn't earn
      toast.error("Report didn't send. Try again.")
    } finally {
      setReporting(null)
    }
  }

  if (d.status === 'loading' || d.status === 'idle') {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (d.status === 'error') {
    return (
      <Alert variant="destructive" className="bg-card">
        <AlertTitle>Could not load the discussion.</AlertTitle>
        <AlertDescription>{d.error}</AlertDescription>
        <Button onClick={d.refresh} variant="outline" size="sm" className="mt-3 w-fit">
          <RefreshCwIcon data-icon="inline-start" />
          Try again
        </Button>
      </Alert>
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

      <Separator />
      <p className="text-xs leading-relaxed text-ink-3">
        Shared as experience and technique, not personal medical advice — nothing here replaces a coach or
        physician. Reports from a few accounts auto-hide a post or a clip for review.
      </p>

      {d.posts.length === 0 ? (
        <Empty className="border border-dashed border-white/12 bg-card/70 py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-primary/12 text-primary">
              <MessageCircleIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="rfx-athletic rfx-skew text-2xl text-bone-2">No comments yet</EmptyTitle>
            <EmptyDescription>Start the thread with a grip cue, a clip, or a breakdown.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-7">
          {d.posts.map((post) => (
            <li key={post.id} className="flex flex-col gap-4">
              <PostBody
                post={post}
                depth={0}
                onReply={setReplyTo}
                onReport={setReporting}
                onDelete={setDeleting}
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
                        onDelete={setDeleting}
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

      <Dialog open={Boolean(reporting)} onOpenChange={(next) => !next && setReporting(null)}>
        <DialogContent className="bg-popover">
          <DialogHeader>
            <DialogTitle>Report this?</DialogTitle>
            <DialogDescription>
              Tell us briefly what is wrong. A few reports hide it for review.
            </DialogDescription>
          </DialogHeader>
          <ReportForm onConfirm={confirmReport} onCancel={() => setReporting(null)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(next) => !next && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="text-destructive">
              <Trash2Icon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes your post from the thread. Media attached to it stops showing with the post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (!deleting) return
                void d.remove(deleting)
                setDeleting(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ReportForm({ onConfirm, onCancel }: { onConfirm: (reason: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState('')
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="discussion-report-reason">Reason</FieldLabel>
        <InputGroup className="h-10 bg-card">
          <InputGroupInput
            id="discussion-report-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={300}
            placeholder="What is wrong?"
          />
        </InputGroup>
        <FieldDescription>Optional. Keep it short.</FieldDescription>
      </Field>
      <DialogFooter className="mt-1">
        <Button
          type="button"
          onClick={() => onConfirm(reason.trim())}
          className="font-mono text-xs uppercase tracking-[0.1em]"
        >
          Submit report
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="font-mono text-xs uppercase tracking-[0.1em]">
          Cancel
        </Button>
      </DialogFooter>
    </FieldGroup>
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
            <Forum topicKey={topicKey} open={open} />
          </div>
        ) : null}
      </div>
    </section>
  )
}
