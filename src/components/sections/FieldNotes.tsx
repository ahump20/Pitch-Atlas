import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { FlagIcon, RefreshCwIcon, TrophyIcon } from 'lucide-react'
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
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty'
import { Field as UiField, FieldDescription, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { InputGroup, InputGroupInput, InputGroupTextarea } from '../ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Separator } from '../ui/separator'
import { Skeleton } from '../ui/skeleton'

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
    <div className="rfx-panel p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="rfx-skick text-cyan">Your bullpen card</p>
        <span className="font-mono text-xs tabular-nums text-bone-2">{score} pts</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-bone-2">
        Filing as <span className="text-bone">{name ? name : 'an unclaimed contributor'}</span>
        {claimed ? ' · claimed ✓' : ' · anonymous'}.
      </p>

      {claimed ? (
        <p className="mt-3 text-xs leading-relaxed text-bone-2">
          Your account is claimed. Your notes and credit follow you on any device you sign in on.
        </p>
      ) : state === 'sent' ? (
        <p role="status" className="quiet-status rfx-panel mt-3 px-3 py-2 text-xs leading-relaxed text-bone-2">{msg}</p>
      ) : (
        <form onSubmit={claim} className="mt-3">
          <p className="mb-2 text-xs leading-relaxed text-bone-2">
            You can take part with no account. Add an email to keep your {score > 0 ? `${score} ` : ''}points and
            notes if you switch devices, never required.
          </p>
          <div className="flex gap-2">
            <InputGroup className="h-10 bg-card">
              <InputGroupInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                aria-label="Email to claim your contributor account"
              />
            </InputGroup>
            <Button
              type="submit"
              disabled={state === 'sending' || !email.includes('@')}
              className={`shrink-0 font-mono text-xs tracking-wide${state === 'sending' ? ' is-busy' : ''}`}
            >
              {state === 'sending' ? 'Sending…' : 'Claim'}
            </Button>
          </div>
          {state === 'error' ? (
            <FieldError key={msg} className="mt-2 shake-in">
              {msg}
            </FieldError>
          ) : null}
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
    <article className="rfx-plate p-5 md:p-6" style={{ '--gc': 'var(--color-cyan)' } as CSSProperties}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="rfx-athletic rfx-skew text-base text-cyan md:text-lg">{note.displayName}</span>
          {context ? <span className="text-xs text-ink-3">{context}</span> : null}
        </div>
        <div className="flex items-center gap-3">
          <ConfidenceLabel confidence={note.sourceTier} />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">{timeAgo(note.createdAt)}</span>
        </div>
      </div>

      <p className="text-[15px] leading-relaxed text-bone">{note.tweak}</p>

      <p className="mt-3 text-sm leading-relaxed text-bone-2">
        <span className="text-ink-3">Going for</span> {labelFor(INTENT_OPTIONS, note.intent)}
        <span className="text-ink-3"> · result</span> {labelFor(RESULT_OPTIONS, note.claimedResultKind)}
        {note.sampleSize ? <span className="text-ink-3"> · {note.sampleSize} reps</span> : null}
      </p>

      {note.claimedResultNote ? <p className="mt-2 text-sm leading-relaxed text-bone-2">{note.claimedResultNote}</p> : null}

      {note.note ? <p className="mt-2 border-l border-seam/40 pl-3 text-sm leading-relaxed text-bone-2">{note.note}</p> : null}

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

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink/15 pt-4">
        {note.viewerIsAuthor ? (
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Your note</Badge>
        ) : (
          <>
            <Button
              type="button"
              onClick={() => onTried(note.id)}
              aria-pressed={note.viewerTried}
              variant={note.viewerTried ? 'destructive' : 'outline'}
              size="sm"
              className="font-mono text-xs tracking-wide"
            >
              {note.viewerTried ? '✓ Tried this' : 'Tried this'} · {note.adoptionCount}
            </Button>
            <Button
              type="button"
              onClick={() => onHelpful(note.id)}
              aria-pressed={note.viewerHelpful}
              variant={note.viewerHelpful ? 'destructive' : 'outline'}
              size="sm"
              className="font-mono text-xs tracking-wide"
            >
              {note.viewerHelpful ? '✓ Helpful' : 'Helpful'} · {note.helpfulCount}
            </Button>
          </>
        )}
        {reportState === 'idle' ? (
          <Button
            type="button"
            onClick={() => setReportState('choosing')}
            variant="ghost"
            size="sm"
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 hover:text-seam"
          >
            <FlagIcon data-icon="inline-start" />
            Report
          </Button>
        ) : reportState === 'sending' ? (
          <span role="status" className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Flagging…</span>
        ) : reportState === 'done' ? (
          <span role="status" className="quiet-status ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Flagged for review. Thank you.</span>
        ) : reportState === 'failed' ? (
          <Button
            type="button"
            onClick={() => setReportState('choosing')}
            variant="ghost"
            size="sm"
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-seam hover:text-bone"
          >
            Couldn't send. Tap to retry.
          </Button>
        ) : (
          <span className="ml-auto flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Flag as</span>
            {REPORT_REASONS.map((r) => (
              <Button
                key={r.value}
                type="button"
                onClick={() => flag(r.value)}
                variant="outline"
                size="sm"
                className="h-7 font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2 hover:text-seam"
              >
                {r.label}
              </Button>
            ))}
            <Button
              type="button"
              onClick={() => setReportState('idle')}
              variant="ghost"
              size="sm"
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 hover:text-bone"
            >
              Cancel
            </Button>
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

function SelectField<T extends string>({
  label,
  hint,
  value,
  options,
  noneLabel,
  onChange,
}: {
  label: string
  hint?: string
  value: T | ''
  options: { value: T; label: string }[]
  noneLabel?: string
  onChange: (value: T | '') => void
}) {
  const id = useId()
  const noneValue = '__none'

  return (
    <UiField>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        value={value || noneValue}
        onValueChange={(next) => onChange(next === noneValue ? '' : (next as T))}
      >
        <SelectTrigger id={id} aria-label={label} className="h-10 w-full bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {noneLabel ? <SelectItem value={noneValue}>{noneLabel}</SelectItem> : null}
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {hint ? <FieldDescription>{hint}</FieldDescription> : null}
    </UiField>
  )
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
  // the brief 'Filed ✓' confirmation; settles back on its own
  const [done, setDone] = useState(false)
  const doneTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(doneTimer.current), [])

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
      window.clearTimeout(doneTimer.current)
      doneTimer.current = window.setTimeout(() => setDone(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not file the note. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <div className="rfx-panel p-5">
        <h3 className="rfx-athletic rfx-skew text-xl text-bone">Log a field note</h3>
        <p className="mt-2 text-sm leading-relaxed text-bone-2">
          Throw the {pitchName.toLowerCase()} with a wrinkle of your own? Add it. Label where it comes from:
          your own report, a coach, or a hunch. Sourced, not corrected.
        </p>
        {done ? (
          <p role="status" className="quiet-status rfx-panel mt-3 px-3 py-2 text-xs leading-relaxed text-bone-2">
            Filed ✓ · your note is live below.
          </p>
        ) : null}
        <Button
          type="button"
          onClick={() => {
            setOpen(true)
            setDone(false)
          }}
          className="mt-4 font-mono text-sm tracking-wide"
        >
          Write a note <span aria-hidden="true">→</span>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rfx-panel p-1.5">
      <div className="rounded-[2px] border border-ink/15 p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan">New field note · {pitchName}</span>
          <Button type="button" onClick={() => setOpen(false)} variant="ghost" size="sm" className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 hover:text-seam">
            Cancel
          </Button>
        </div>

        <FieldGroup>
          <UiField data-invalid={!form.displayName.trim() && Boolean(error)}>
            <FieldLabel htmlFor="field-note-display-name">Submitted by</FieldLabel>
            <InputGroup className="h-10 bg-card">
              <InputGroupInput
                id="field-note-display-name"
                value={form.displayName}
                maxLength={FIELD_NOTE_CONSTRAINTS.displayName.max}
                onChange={(e) => set('displayName', e.target.value)}
                placeholder="e.g. RHP_threequarter"
                aria-invalid={!form.displayName.trim() && Boolean(error)}
              />
            </InputGroup>
            <FieldDescription>A handle, 2-40 characters. No real name needed.</FieldDescription>
          </UiField>

          <UiField data-invalid={!form.tweak.trim() && Boolean(error)}>
            <FieldLabel htmlFor="field-note-tweak">The tweak</FieldLabel>
            <InputGroup className="h-auto bg-card">
              <InputGroupTextarea
                id="field-note-tweak"
                value={form.tweak}
                maxLength={FIELD_NOTE_CONSTRAINTS.tweakDescription.max}
                onChange={(e) => set('tweak', e.target.value)}
                placeholder="Thumb tucked deeper under the leather, ring finger off the seam…"
                aria-invalid={!form.tweak.trim() && Boolean(error)}
                className="min-h-[72px] resize-y"
              />
            </InputGroup>
            <FieldDescription>
              The change from the standard grip. {form.tweak.length}/{FIELD_NOTE_CONSTRAINTS.tweakDescription.max}
            </FieldDescription>
          </UiField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SelectField label="Level" value={form.playerLevel} options={PLAYER_LEVELS} onChange={(v) => set('playerLevel', v as PlayerLevel)} />
            <SelectField label="Arm slot" value={form.armSlot} options={ARM_SLOTS} onChange={(v) => set('armSlot', v as ArmSlot)} />
            <SelectField label="Pace context" value={form.velocityBand} options={VELOCITY_BANDS} noneLabel="-" onChange={(v) => set('velocityBand', v as '' | VelocityBand)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField label="Going for" value={form.intent} options={INTENT_OPTIONS} onChange={(v) => set('intent', v as PitchIntent)} />
            <SelectField label="What happened" value={form.claimedResultKind} options={RESULT_OPTIONS} onChange={(v) => set('claimedResultKind', v as ClaimedResultKind)} />
          </div>

          <SelectField
            label="Source"
            hint={noteRequired ? 'A relayed or untested claim must say where it comes from.' : 'Where this comes from. Sets how the note ranks.'}
            value={form.sourceTier}
            options={SOURCE_TIER_OPTIONS}
            onChange={(v) => set('sourceTier', v as CommunitySourceTier)}
          />

          {noteRequired || form.note ? (
            <UiField data-invalid={noteRequired && !form.note.trim() && Boolean(error)}>
              <FieldLabel htmlFor="field-note-context">{noteRequired ? 'Context (required)' : 'Context'}</FieldLabel>
              <InputGroup className="h-10 bg-card">
                <InputGroupInput
                  id="field-note-context"
                  value={form.note}
                  maxLength={FIELD_NOTE_CONSTRAINTS.cueNote.max}
                  onChange={(e) => set('note', e.target.value)}
                  placeholder="Where you heard it, or what you saw…"
                  aria-invalid={noteRequired && !form.note.trim() && Boolean(error)}
                />
              </InputGroup>
              <FieldDescription>Why it is worth logging. {form.note.length}/{FIELD_NOTE_CONSTRAINTS.cueNote.max}</FieldDescription>
            </UiField>
          ) : null}

          <details className="group text-sm">
            <summary className="disclosure-row mono-label flex cursor-pointer list-none items-center gap-2 text-bone-2 transition-colors hover:text-bone">
              <span aria-hidden="true" className="transition-transform group-open:rotate-90">›</span>
              Optional · reps + evidence link
            </summary>
            <div className="disclose-body mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <UiField>
                <FieldLabel htmlFor="field-note-reps">Reps</FieldLabel>
                <InputGroup className="h-10 bg-card">
                  <InputGroupInput id="field-note-reps" type="number" min={0} value={form.sampleSize} onChange={(e) => set('sampleSize', e.target.value)} placeholder="e.g. 40" />
                </InputGroup>
              </UiField>
              <UiField>
                <FieldLabel htmlFor="field-note-evidence-label">Evidence label</FieldLabel>
                <InputGroup className="h-10 bg-card">
                  <InputGroupInput id="field-note-evidence-label" value={form.evidenceLabel} maxLength={FIELD_NOTE_CONSTRAINTS.evidenceLabel.max} onChange={(e) => set('evidenceLabel', e.target.value)} placeholder="Bullpen clip" />
                </InputGroup>
              </UiField>
              <UiField>
                <FieldLabel htmlFor="field-note-evidence-url">Evidence URL</FieldLabel>
                <InputGroup className="h-10 bg-card">
                  <InputGroupInput id="field-note-evidence-url" type="url" value={form.evidenceUrl} maxLength={FIELD_NOTE_CONSTRAINTS.evidenceUrl.max} onChange={(e) => set('evidenceUrl', e.target.value)} placeholder="https://…" />
                </InputGroup>
              </UiField>
            </div>
          </details>

          {error ? (
            <FieldError key={error} className="shake-in">
              {error}
            </FieldError>
          ) : null}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={!valid || busy}
              className={`font-mono text-sm tracking-wide${busy ? ' is-busy' : ''}`}
            >
              {busy ? 'Filing…' : 'File field note'} <span aria-hidden="true">→</span>
            </Button>
            <span className="text-xs leading-snug text-bone-2">Filed under your handle. You can take part anonymously.</span>
          </div>
        </FieldGroup>
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
        <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(11,11,13,0.92) 0%, rgba(11,11,13,0.62) 52%, rgba(11,11,13,0.30) 100%)' }} />
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <p className="rfx-skick text-cyan">Tier 03 / Field Notes</p>
          <h2 className="rfx-athletic rfx-skew mt-4 max-w-[16ch] text-[2.4rem] leading-[1.02] text-bone md:text-5xl">Field notes from the bullpen.</h2>
          {/* bone, not bone-2: this line sits on the workbench footage behind the scrim */}
          <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-bone">
            Every pitcher fiddles. A thumb creeps lower, a seam catches more leather, a cue from a coach
            suddenly makes the pitch move. Pitch Atlas files those experiments as specimens with context,
            so the small discoveries stop disappearing into group chats and comment sections.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <div className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-12">
          {/* left: how notes rank + vocabulary (kept — the brand's quality promise) */}
          <div className="flex flex-col gap-8 md:col-span-6">
            <div>
              <p className="rfx-skick text-cyan">How notes rank</p>
              <h3 className="rfx-athletic rfx-skew mt-3 text-2xl leading-snug text-bone md:text-3xl">Evidence and context, never who shouts loudest.</h3>
              <p className="mt-4 max-w-[58ch] leading-relaxed text-bone-2">
                There is no single correct way to throw a pitch, but there are better and worse claims. A funny
                line should never outrank a tested grip. So notes do not rise on raw votes. They rise on weighted
                signals - provenance and adoption first.
              </p>
            </div>

            <ul className="flex flex-col">
              {RANK_SIGNALS.map((signal) => {
                const pct = Math.round(RANK_WEIGHTS[signal.key] * 100)
                return (
                  <li key={signal.key} className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 border-t border-ink/15 py-4">
                    <div className="flex w-28 flex-col gap-1.5 sm:w-32">
                      <span className="font-mono text-sm tabular-nums text-cyan">{pct}%</span>
                      <span aria-hidden="true" className="h-1 rounded-full bg-cyan/15">
                        <span className="block h-1 rounded-full bg-cyan" style={{ width: `${pct}%` }} />
                      </span>
                    </div>
                    <div>
                      <span className="font-mono text-xs uppercase tracking-[0.12em] text-bone">{signal.label}</span>
                      <p className="mt-1 max-w-[52ch] text-sm leading-relaxed text-bone-2">{signal.blurb}</p>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div>
              <p className="rfx-skick text-cyan">The vocabulary</p>
              <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {FIELD_NOTE_PRIMITIVES.map((p) => (
                  <div key={p.term} className="flex flex-col gap-0.5 border-t border-ink/15 pt-2.5">
                    <dt className="font-mono text-xs uppercase tracking-[0.1em] text-bone">{p.term}</dt>
                    <dd className="text-sm leading-snug text-bone-2">{p.gloss}</dd>
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
              <div className="rfx-panel p-6">
                <p className="rfx-skick text-cyan">The living layer</p>
                <h3 className="rfx-athletic rfx-skew mt-3 text-xl text-bone md:text-2xl">Field notes open soon.</h3>
                <p className="mt-3 text-sm leading-relaxed text-bone-2">
                  Soon you will file your own grip tweak, mark the ones you have tried, and flag anything
                  off, anonymously or under a handle you keep. {community.safetyNote}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* the ranked notes for this pitch, four states, only when the layer is open */}
        {live ? (
          <div className="mt-16">
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-ink/15 pb-4">
              <h3 className="rfx-athletic rfx-skew text-2xl text-bone md:text-3xl">Field notes for the {canonical.name.toLowerCase()}</h3>
              <span className="mono-label text-ink-3">{status === 'ready' ? `${notes.length} note${notes.length === 1 ? '' : 's'}` : ''}</span>
            </div>

            {status === 'loading' ? (
              <div className="flex flex-col gap-4" aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-sm bg-muted" />
                ))}
              </div>
            ) : status === 'error' ? (
              <Alert variant="destructive" className="bg-card">
                <AlertTitle>Couldn't load the field notes.</AlertTitle>
                <AlertDescription>
                  Couldn't load the field notes just now: {error}. This is usually a passing hiccup.
                </AlertDescription>
                <Button type="button" onClick={refresh} variant="outline" size="sm" className="mt-3 w-fit font-mono text-xs tracking-wide">
                  <RefreshCwIcon data-icon="inline-start" />
                  Try again
                </Button>
              </Alert>
            ) : notes.length === 0 ? (
              <Empty className="border border-dashed border-white/12 bg-card/70 px-6 py-16">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-primary/12 text-primary">
                    <TrophyIcon aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle className="rfx-athletic rfx-skew text-2xl text-bone-2">No field notes filed yet</EmptyTitle>
                  <EmptyDescription>
                    No field notes filed yet for this pitch. The first one starts the drawer. Add how you throw it above.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="flex flex-col gap-4">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} onTried={toggleTried} onHelpful={toggleHelpful} onReport={handleReport} />
                ))}
              </div>
            )}

            {/* community guidelines + the flagging mechanism, the UGC floor in plain sight */}
            <div className="rfx-panel mt-6 max-w-[78ch] p-5">
              <p className="rfx-skick text-cyan">Keeping the bullpen honest</p>
              <Separator className="my-3" />
              <p className="mt-2 text-sm leading-relaxed text-bone-2">
                Keep notes about pitching. No abuse, no personal attacks, no off-topic spam, nothing aimed at minors.
                Field notes are community-submitted: they are not vetted before they post, and any note can be hidden
                after review. See a problem with a note? Use <span className="text-bone">Report</span> on it; a note
                flagged by enough people is hidden automatically until it is checked.
              </p>
            </div>
          </div>
        ) : null}

        {/* how the layer sources its notes — present tense once open, the preview copy until then */}
        <p className="mt-12 max-w-[78ch] border-t border-ink/15 pt-6 text-sm leading-relaxed text-bone-2">
          {live
            ? 'Every community variant carries the same source and confidence labels as the records above. Nothing appears here unsourced, and no count is shown until it is real.'
            : community.provenanceNote}
        </p>
      </div>
    </section>
  )
}
