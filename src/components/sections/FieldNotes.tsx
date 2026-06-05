import { useState, type FormEvent, type ReactNode } from 'react'
import type { PitchAtlasEntry } from '../../data/types'
import {
  RANK_SIGNALS,
  RANK_WEIGHTS,
  FIELD_NOTE_PRIMITIVES,
  FIELD_NOTE_CONSTRAINTS,
  PLAYER_LEVELS,
  ARM_SLOTS,
  VELOCITY_BANDS,
  type PlayerLevel,
  type ArmSlot,
  type VelocityBand,
  type PitchIntent,
  type ClaimedResultKind,
} from '../../data/field-notes'
import {
  INTENT_OPTIONS,
  RESULT_OPTIONS,
  SOURCE_TIER_OPTIONS,
  type CommunityIdentity,
  type CommunityNote,
  type CommunitySourceTier,
  type NewFieldNote,
} from '../../lib/community'
import { useFieldNotes } from '../../hooks/useFieldNotes'
import { ConfidenceLabel } from '../provenance/ConfidenceLabel'

/*
  Tier 03, the living layer. The explainer on the left (how notes rank, the
  vocabulary) is the brand's quality promise and always shows. The live
  write/rank/flag loop on the right is gated behind community.enabled: while the
  layer is still a preview the surface shows an honest "opening soon" panel and
  makes no Supabase calls. No count is ever invented; live notes come from the
  database, and a flagged note auto-hides once enough distinct accounts report it.
*/

function timeAgo(iso: string): string {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} mo ago`
  return `${Math.floor(months / 12)} yr ago`
}

function labelFor<T extends string>(opts: { value: T; label: string }[], v: T | null): string {
  return (v && opts.find((o) => o.value === v)?.label) || ''
}

const inputClass =
  'w-full rounded-sm border border-navy/20 bg-paper px-3 py-2 font-prose text-sm text-ink placeholder:text-ink-3 focus:border-navy focus:outline-none'
const labelClass = 'mono-label mb-1.5 block text-ink-2'

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs leading-snug text-ink-2">{hint}</span> : null}
    </label>
  )
}

// ---- the contributor identity + claim-your-handle strip ----
function IdentityStrip({
  identity,
  onClaim,
}: {
  identity: CommunityIdentity | null
  onClaim: (email: string) => Promise<void>
}) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const score = identity?.contributionScore ?? 0
  const claimed = identity?.isClaimed ?? false
  const name = identity?.displayName

  async function claim(e: FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return
    setState('sending')
    try {
      await onClaim(email)
      setState('sent')
      setMsg('Check your email. Click the link to claim this account. Your credit stays put.')
    } catch (err) {
      setState('error')
      setMsg(err instanceof Error ? err.message : 'Could not send the link. Try again.')
    }
  }

  return (
    <div className="rounded-sm border border-navy/15 bg-paper-2/60 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="mono-label text-navy">Your bullpen card</p>
        <span className="font-mono text-xs tabular-nums text-ink-2">{score} pts</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">
        Posting as <span className="text-ink">{name ? name : 'an unclaimed contributor'}</span>
        {claimed ? ' · claimed ✓' : ' · anonymous'}.
      </p>

      {claimed ? (
        <p className="mt-3 text-xs leading-relaxed text-ink-2">
          Your account is claimed. Your notes and credit follow you on any device you sign in on.
        </p>
      ) : state === 'sent' ? (
        <p className="mt-3 rounded-sm border border-navy/15 bg-paper px-3 py-2 text-xs leading-relaxed text-ink-2">{msg}</p>
      ) : (
        <form onSubmit={claim} className="mt-3">
          <p className="mb-2 text-xs leading-relaxed text-ink-2">
            You can take part with no account. Add an email to keep your {score > 0 ? `${score} ` : ''}points and
            notes if you switch devices, never required.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-label="Email to claim your contributor account"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={state === 'sending' || !email.includes('@')}
              className="shrink-0 rounded-sm border border-navy bg-navy px-4 py-2 font-mono text-xs tracking-wide text-bone transition-colors hover:bg-navy-2 disabled:opacity-50"
            >
              {state === 'sending' ? 'Sending…' : 'Claim'}
            </button>
          </div>
          {state === 'error' ? <p className="mt-2 text-xs text-seam">{msg}</p> : null}
        </form>
      )}
    </div>
  )
}

// ---- one field note ----
const REPORT_REASONS: { value: string; label: string }[] = [
  { value: 'abusive-unsafe', label: 'Abusive / unsafe' },
  { value: 'off-topic', label: 'Off-topic' },
  { value: 'spam', label: 'Spam' },
]

function NoteCard({
  note,
  onTried,
  onHelpful,
  onReport,
}: {
  note: CommunityNote
  onTried: (id: string) => void
  onHelpful: (id: string) => void
  onReport: (id: string, reason: string) => Promise<void> | void
}) {
  const [reportState, setReportState] = useState<'idle' | 'choosing' | 'sending' | 'done' | 'failed'>('idle')

  async function flag(reason: string) {
    setReportState('sending')
    try {
      await onReport(note.id, reason)
      setReportState('done')
    } catch {
      setReportState('failed')
    }
  }

  const context = [
    labelFor(PLAYER_LEVELS, note.playerLevel),
    labelFor(ARM_SLOTS, note.armSlot),
    labelFor(VELOCITY_BANDS, note.velocityBand),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className="rounded-sm border border-navy/15 border-l-2 border-l-navy bg-paper p-5 md:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="display text-base text-navy md:text-lg">{note.displayName}</span>
          {context ? <span className="text-xs text-ink-3">{context}</span> : null}
        </div>
        <div className="flex items-center gap-3">
          <ConfidenceLabel confidence={note.sourceTier} />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">{timeAgo(note.createdAt)}</span>
        </div>
      </div>

      <p className="text-[15px] leading-relaxed text-ink">{note.tweak}</p>

      <p className="mt-3 text-sm leading-relaxed text-ink-2">
        <span className="text-ink-3">Going for</span> {labelFor(INTENT_OPTIONS, note.intent)}
        <span className="text-ink-3"> · result</span> {labelFor(RESULT_OPTIONS, note.claimedResultKind)}
        {note.sampleSize ? <span className="text-ink-3"> · {note.sampleSize} reps</span> : null}
      </p>

      {note.claimedResultNote ? <p className="mt-2 text-sm leading-relaxed text-ink-2">{note.claimedResultNote}</p> : null}

      {note.note ? <p className="mt-2 border-l border-seam/40 pl-3 text-sm leading-relaxed text-ink-2">{note.note}</p> : null}

      {note.evidenceUrl ? (
        <a
          href={note.evidenceUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-seam underline-offset-2 hover:underline"
        >
          {note.evidenceLabel || 'Evidence'} ↗
        </a>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-navy/10 pt-4">
        {note.viewerIsAuthor ? (
          <span className="mono-label text-ink-3">Your note</span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onTried(note.id)}
              aria-pressed={note.viewerTried}
              className={`rounded-sm border px-3 py-1.5 font-mono text-xs tracking-wide transition-colors ${
                note.viewerTried ? 'border-seam bg-seam/10 text-seam' : 'border-navy/25 text-ink-2 hover:border-navy'
              }`}
            >
              {note.viewerTried ? '✓ Tried this' : 'Tried this'} · {note.adoptionCount}
            </button>
            <button
              type="button"
              onClick={() => onHelpful(note.id)}
              aria-pressed={note.viewerHelpful}
              className={`rounded-sm border px-3 py-1.5 font-mono text-xs tracking-wide transition-colors ${
                note.viewerHelpful ? 'border-seam bg-seam/10 text-seam' : 'border-navy/25 text-ink-2 hover:border-navy'
              }`}
            >
              {note.viewerHelpful ? '✓ Helpful' : 'Helpful'} · {note.helpfulCount}
            </button>
          </>
        )}
        {reportState === 'idle' ? (
          <button
            type="button"
            onClick={() => setReportState('choosing')}
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 hover:text-seam"
          >
            Report
          </button>
        ) : reportState === 'sending' ? (
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Flagging…</span>
        ) : reportState === 'done' ? (
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Flagged for review. Thank you.</span>
        ) : reportState === 'failed' ? (
          <button
            type="button"
            onClick={() => setReportState('choosing')}
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-seam hover:text-ink"
          >
            Couldn't send. Tap to retry.
          </button>
        ) : (
          <span className="ml-auto flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Flag as</span>
            {REPORT_REASONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => flag(r.value)}
                className="rounded-sm border border-navy/25 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2 hover:border-seam hover:text-seam"
              >
                {r.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setReportState('idle')}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 hover:text-ink"
            >
              Cancel
            </button>
          </span>
        )}
      </div>
    </article>
  )
}

// ---- the submit form ----
interface FormState {
  displayName: string
  tweak: string
  playerLevel: PlayerLevel
  armSlot: ArmSlot
  velocityBand: '' | VelocityBand
  intent: PitchIntent
  claimedResultKind: ClaimedResultKind
  claimedResultNote: string
  sampleSize: string
  sourceTier: CommunitySourceTier
  note: string
  evidenceUrl: string
  evidenceLabel: string
}

const EMPTY_FORM: FormState = {
  displayName: '',
  tweak: '',
  playerLevel: 'high-school',
  armSlot: 'three-quarter',
  velocityBand: '',
  intent: 'more-movement',
  claimedResultKind: 'worked-in-bullpen',
  claimedResultNote: '',
  sampleSize: '',
  sourceTier: 'community-firsthand',
  note: '',
  evidenceUrl: '',
  evidenceLabel: '',
}

function SubmitForm({
  pitchSlug,
  pitchName,
  defaultName,
  onSubmit,
}: {
  pitchSlug: string
  pitchName: string
  defaultName: string | null
  onSubmit: (input: NewFieldNote) => Promise<CommunityNote>
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, displayName: defaultName ?? '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const tierMeta = SOURCE_TIER_OPTIONS.find((o) => o.value === form.sourceTier)
  const noteRequired = tierMeta?.requiresNote ?? false
  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  const valid =
    form.displayName.trim().length >= FIELD_NOTE_CONSTRAINTS.displayName.min &&
    form.tweak.trim().length > 0 &&
    (!noteRequired || form.note.trim().length > 0)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!valid || busy) return
    setBusy(true)
    setError(null)
    try {
      await onSubmit({
        pitchSlug,
        displayName: form.displayName.trim(),
        tweak: form.tweak.trim(),
        playerLevel: form.playerLevel,
        armSlot: form.armSlot,
        velocityBand: form.velocityBand === '' ? null : form.velocityBand,
        intent: form.intent,
        claimedResultKind: form.claimedResultKind,
        claimedResultNote: form.claimedResultNote.trim() || null,
        sampleSize: form.sampleSize === '' ? null : Math.max(0, parseInt(form.sampleSize, 10) || 0),
        evidenceUrl: form.evidenceUrl.trim() || null,
        evidenceLabel: form.evidenceLabel.trim() || null,
        sourceTier: form.sourceTier,
        note: form.note.trim() || null,
      })
      setForm({ ...EMPTY_FORM, displayName: form.displayName })
      setDone(true)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post the note. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <div className="rounded-sm border border-navy/15 bg-paper p-5">
        <h3 className="display text-xl text-ink">Log a field note</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Throw the {pitchName.toLowerCase()} with a wrinkle of your own? Add it. Label where it comes from:
          your own report, a coach, or a hunch. Sourced, not corrected.
        </p>
        {done ? (
          <p className="mt-3 rounded-sm border border-navy/15 bg-paper-2/60 px-3 py-2 text-xs leading-relaxed text-ink-2">
            Posted. It is live below. Thank you for shaping the bar.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setOpen(true)
            setDone(false)
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-sm border border-navy bg-navy px-5 py-3 font-mono text-sm tracking-wide text-bone transition-colors hover:bg-navy-2 active:translate-y-px"
        >
          Write a note <span aria-hidden="true">→</span>
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-sm border-2 border-navy bg-paper p-1.5 shadow-[0_2px_0_0_var(--color-navy-line)]">
      <div className="rounded-[2px] border border-seam/30 p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy">New field note · {pitchName}</span>
          <button type="button" onClick={() => setOpen(false)} className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 hover:text-seam">
            Cancel
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="Submitted by" hint="A handle, 2–40 characters. No real name needed.">
            <input className={inputClass} value={form.displayName} maxLength={FIELD_NOTE_CONSTRAINTS.displayName.max} onChange={(e) => set('displayName', e.target.value)} placeholder="e.g. RHP_threequarter" />
          </Field>

          <Field label="The tweak" hint={`The change from the standard grip. ${form.tweak.length}/${FIELD_NOTE_CONSTRAINTS.tweakDescription.max}`}>
            <textarea className={`${inputClass} min-h-[72px] resize-y`} value={form.tweak} maxLength={FIELD_NOTE_CONSTRAINTS.tweakDescription.max} onChange={(e) => set('tweak', e.target.value)} placeholder="Thumb tucked deeper under the leather, ring finger off the seam…" />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Level">
              <select className={inputClass} value={form.playerLevel} onChange={(e) => set('playerLevel', e.target.value as PlayerLevel)}>
                {PLAYER_LEVELS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Arm slot">
              <select className={inputClass} value={form.armSlot} onChange={(e) => set('armSlot', e.target.value as ArmSlot)}>
                {ARM_SLOTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Velocity">
              <select className={inputClass} value={form.velocityBand} onChange={(e) => set('velocityBand', e.target.value as '' | VelocityBand)}>
                <option value="">-</option>
                {VELOCITY_BANDS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Going for">
              <select className={inputClass} value={form.intent} onChange={(e) => set('intent', e.target.value as PitchIntent)}>
                {INTENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="What happened">
              <select className={inputClass} value={form.claimedResultKind} onChange={(e) => set('claimedResultKind', e.target.value as ClaimedResultKind)}>
                {RESULT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Source" hint={noteRequired ? 'A relayed or untested claim must say where it comes from.' : 'Where this comes from. Sets how the note ranks.'}>
            <select className={inputClass} value={form.sourceTier} onChange={(e) => set('sourceTier', e.target.value as CommunitySourceTier)}>
              {SOURCE_TIER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          {noteRequired || form.note ? (
            <Field label={noteRequired ? 'Context (required)' : 'Context'} hint={`Why it is worth logging. ${form.note.length}/${FIELD_NOTE_CONSTRAINTS.cueNote.max}`}>
              <input className={inputClass} value={form.note} maxLength={FIELD_NOTE_CONSTRAINTS.cueNote.max} onChange={(e) => set('note', e.target.value)} placeholder="Where you heard it, or what you saw…" />
            </Field>
          ) : null}

          <details className="text-sm">
            <summary className="mono-label cursor-pointer text-ink-2">Optional · reps + evidence link</summary>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Reps">
                <input className={inputClass} type="number" min={0} value={form.sampleSize} onChange={(e) => set('sampleSize', e.target.value)} placeholder="e.g. 40" />
              </Field>
              <Field label="Evidence label">
                <input className={inputClass} value={form.evidenceLabel} maxLength={FIELD_NOTE_CONSTRAINTS.evidenceLabel.max} onChange={(e) => set('evidenceLabel', e.target.value)} placeholder="Bullpen clip" />
              </Field>
              <Field label="Evidence URL">
                <input className={inputClass} type="url" value={form.evidenceUrl} maxLength={FIELD_NOTE_CONSTRAINTS.evidenceUrl.max} onChange={(e) => set('evidenceUrl', e.target.value)} placeholder="https://…" />
              </Field>
            </div>
          </details>

          {error ? <p className="text-sm text-seam">{error}</p> : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!valid || busy}
              className="inline-flex items-center gap-2 rounded-sm border border-navy bg-navy px-5 py-3 font-mono text-sm tracking-wide text-bone transition-colors hover:bg-navy-2 active:translate-y-px disabled:opacity-50"
            >
              {busy ? 'Posting…' : 'Post field note'} <span aria-hidden="true">→</span>
            </button>
            <span className="text-xs leading-snug text-ink-2">Posts under your handle. You can take part anonymously.</span>
          </div>
        </div>
      </div>
    </form>
  )
}

export function FieldNotes({ entry }: { entry: PitchAtlasEntry }) {
  const { community, canonical, display } = entry
  const slug = display.slug
  const live = community.enabled
  const { status, error, notes, identity, refresh, submit, toggleTried, toggleHelpful, report, claim } =
    useFieldNotes(slug, live)

  // Let failures surface. NoteCard awaits this and shows a retry state if the
  // report did not land; a safety report must never claim success it didn't earn.
  async function handleReport(id: string, reason: string) {
    await report(id, reason)
  }

  return (
    <section id="field-notes" className="scroll-mt-24">
      <div className="relative overflow-hidden bg-stage">
        <img src="/brand/workbench.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(13,13,9,0.92) 0%, rgba(13,13,9,0.62) 52%, rgba(13,13,9,0.30) 100%)' }} />
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <p className="mono-label-stage">Tier 03 / Field Notes</p>
          <h2 className="display mt-4 max-w-[16ch] text-[2.4rem] leading-[1.02] text-bone md:text-5xl">Field notes from the bullpen.</h2>
          <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-bone-2">
            Every pitcher fiddles. A thumb creeps lower, a seam catches more leather, a cue from a coach
            suddenly makes the pitch move. Pitch Atlas keeps those experiments visible, labeled, and debated,
            so the small discoveries stop disappearing into group chats and comment sections.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <div className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-12">
          {/* left: how notes rank + vocabulary (kept — the brand's quality promise) */}
          <div className="flex flex-col gap-8 md:col-span-6">
            <div>
              <p className="mono-label text-navy">How notes rank</p>
              <h3 className="display mt-3 text-2xl leading-snug text-ink md:text-3xl">Evidence and context, never who shouts loudest.</h3>
              <p className="mt-4 max-w-[58ch] leading-relaxed text-ink-2">
                There is no single correct way to throw a pitch, but there are better and worse claims. A funny
                line should never outrank a tested grip. So notes do not rise on raw votes. They rise on weighted
                signals — provenance and adoption first.
              </p>
            </div>

            <ul className="flex flex-col">
              {RANK_SIGNALS.map((signal) => {
                const pct = Math.round(RANK_WEIGHTS[signal.key] * 100)
                return (
                  <li key={signal.key} className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 border-t border-navy/12 py-4">
                    <div className="flex w-28 flex-col gap-1.5 sm:w-32">
                      <span className="font-mono text-sm tabular-nums text-navy">{pct}%</span>
                      <span aria-hidden="true" className="h-1 rounded-full bg-navy/10">
                        <span className="block h-1 rounded-full bg-navy" style={{ width: `${pct}%` }} />
                      </span>
                    </div>
                    <div>
                      <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink">{signal.label}</span>
                      <p className="mt-1 max-w-[52ch] text-sm leading-relaxed text-ink-2">{signal.blurb}</p>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div>
              <p className="mono-label text-navy">The vocabulary</p>
              <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {FIELD_NOTE_PRIMITIVES.map((p) => (
                  <div key={p.term} className="flex flex-col gap-0.5 border-t border-navy/10 pt-2.5">
                    <dt className="font-mono text-xs uppercase tracking-[0.1em] text-ink">{p.term}</dt>
                    <dd className="text-sm leading-snug text-ink-2">{p.gloss}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* right: the live loop when open; an honest preview until then */}
          <div className="flex flex-col gap-6 md:col-span-6">
            {live ? (
              <>
                <IdentityStrip identity={identity} onClaim={claim} />
                <SubmitForm pitchSlug={slug} pitchName={canonical.name} defaultName={identity?.displayName ?? null} onSubmit={submit} />
              </>
            ) : (
              <div className="rounded-sm border border-navy/15 bg-paper-2/60 p-6">
                <p className="mono-label text-navy">The living layer</p>
                <h3 className="display mt-3 text-xl text-ink md:text-2xl">Field notes open soon.</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">
                  Soon you will log your own grip tweak, mark the ones you have tried, and flag anything off,
                  anonymously or under a handle you keep. {community.safetyNote}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* the ranked notes for this pitch, four states, only when the layer is open */}
        {live ? (
          <div className="mt-16">
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-navy/12 pb-4">
              <h3 className="display text-2xl text-ink md:text-3xl">Field notes for the {canonical.name.toLowerCase()}</h3>
              <span className="mono-label text-ink-3">{status === 'ready' ? `${notes.length} live` : ''}</span>
            </div>

            {status === 'loading' ? (
              <div className="flex flex-col gap-4" aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-sm border border-navy/10 bg-paper-2/50" />
                ))}
              </div>
            ) : status === 'error' ? (
              <div className="flex flex-col items-center gap-4 rounded-sm border border-dashed border-seam/40 px-6 py-14 text-center">
                <p className="max-w-[48ch] leading-relaxed text-ink-2">
                  Couldn't load the field notes just now: {error}. This is usually a passing hiccup.
                </p>
                <button type="button" onClick={refresh} className="rounded-sm border border-navy px-4 py-2 font-mono text-xs tracking-wide text-ink hover:bg-paper-2">
                  Try again
                </button>
              </div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-sm border border-dashed border-navy/25 px-6 py-16 text-center">
                <img src="/brand/seal-128.webp" alt="" width={56} height={56} loading="lazy" decoding="async" className="opacity-80" aria-hidden="true" />
                <p className="max-w-[46ch] leading-relaxed text-ink-2">
                  No field notes yet for this pitch. The first one shapes the bar. Add how you throw it above.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} onTried={toggleTried} onHelpful={toggleHelpful} onReport={handleReport} />
                ))}
              </div>
            )}

            {/* community guidelines + the flagging mechanism, the UGC floor in plain sight */}
            <div className="mt-6 max-w-[78ch] rounded-sm border border-navy/15 bg-paper-2/50 p-5">
              <p className="mono-label text-navy">Keeping the bullpen honest</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                Keep notes about pitching. No abuse, no personal attacks, no off-topic spam, nothing aimed at minors.
                Field notes are community-submitted: they are not vetted before they post, and any note can be hidden
                after review. See a problem with a note? Use <span className="text-ink">Report</span> on it; a note
                flagged by enough people is hidden automatically until it is checked.
              </p>
            </div>
          </div>
        ) : null}

        {/* honest in both modes: how the layer sources its notes */}
        <p className="mt-12 max-w-[78ch] border-t border-navy/12 pt-6 text-sm leading-relaxed text-ink-2">
          {community.provenanceNote}
        </p>
      </div>
    </section>
  )
}
