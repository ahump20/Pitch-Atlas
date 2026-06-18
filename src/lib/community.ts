import { supabase } from './supabase'
import type {
  PlayerLevel,
  ArmSlot,
  VelocityBand,
  PitchIntent,
  ClaimedResultKind,
} from '../data/field-notes'
import type { ClaimConfidence } from '../data/types'

/*
  The Field Notes data layer. Pure functions over Supabase — React lives in the
  hook, not here. Every write rides the signed-in account (anonymous or claimed);
  the database enforces one-per-account on Tried This and Helpful, own-row edits,
  and "Sourced, not corrected" (a weak tier without a note is rejected by a
  CHECK constraint, not just the form). Nothing here fabricates a post or a count.
*/

/** Community-relevant subset of the canonical ClaimConfidence tiers. Extract
    ties each id to the canonical union, so a non-canonical tier string fails
    typecheck instead of silently forking the model. */
export type CommunitySourceTier = Extract<
  ClaimConfidence,
  | 'coach-observed'
  | 'reputable-analysis'
  | 'community-firsthand'
  | 'secondhand-attributed'
  | 'unverified'
>

/** A field note as the reader sees it, plus viewer-relative flags. */
export interface CommunityNote {
  id: string
  pitchSlug: string
  authorId: string
  displayName: string
  tweak: string
  playerLevel: PlayerLevel
  armSlot: ArmSlot
  velocityBand: VelocityBand | null
  intent: PitchIntent
  claimedResultKind: ClaimedResultKind
  claimedResultNote: string | null
  sampleSize: number | null
  evidenceUrl: string | null
  evidenceLabel: string | null
  sourceTier: CommunitySourceTier
  note: string | null
  adoptionCount: number
  helpfulCount: number
  baseRank: number
  createdAt: string
  viewerTried: boolean
  viewerHelpful: boolean
  viewerIsAuthor: boolean
}

/** What a contributor submits. Lengths mirror FIELD_NOTE_CONSTRAINTS + the DB CHECKs. */
export interface NewFieldNote {
  pitchSlug: string
  displayName: string
  tweak: string
  playerLevel: PlayerLevel
  armSlot: ArmSlot
  velocityBand: VelocityBand | null
  intent: PitchIntent
  claimedResultKind: ClaimedResultKind
  claimedResultNote: string | null
  sampleSize: number | null
  evidenceUrl: string | null
  evidenceLabel: string | null
  sourceTier: CommunitySourceTier
  note: string | null
}

/** The signed-in contributor. Anonymous until claimed; karma rides the same id. */
export interface CommunityIdentity {
  userId: string
  displayName: string | null
  isClaimed: boolean
  contributionScore: number
  notesCount: number
}

/** Labeled option lists for the submit form. */
export const INTENT_OPTIONS: { value: PitchIntent; label: string }[] = [
  { value: 'more-movement', label: 'More movement' },
  { value: 'less-movement', label: 'Less movement' },
  { value: 'firmer-feel', label: 'Firmer feel' },
  { value: 'softer-feel', label: 'Softer feel' },
  { value: 'better-command', label: 'Better command' },
  { value: 'deception', label: 'More deception' },
  { value: 'reduce-stress', label: 'Less arm stress' },
  { value: 'other', label: 'Something else' },
]

export const RESULT_OPTIONS: { value: ClaimedResultKind; label: string }[] = [
  { value: 'more-movement', label: 'More movement' },
  { value: 'better-command', label: 'Better command' },
  { value: 'firmer-result', label: 'Firmer feel' },
  { value: 'reduced-discomfort', label: 'Less discomfort' },
  { value: 'worked-in-bullpen', label: 'Worked in the bullpen' },
  { value: 'worked-in-game', label: 'Worked in a game' },
  { value: 'inconsistent', label: 'Inconsistent so far' },
  { value: 'no-noticeable-change', label: 'No noticeable change' },
]

export const SOURCE_TIER_OPTIONS: {
  value: CommunitySourceTier
  label: string
  requiresNote: boolean
}[] = [
  { value: 'community-firsthand', label: 'My own report', requiresNote: false },
  { value: 'coach-observed', label: 'A coach I work with reported it', requiresNote: false },
  { value: 'secondhand-attributed', label: 'Relayed from someone else', requiresNote: true },
  { value: 'unverified', label: 'A hunch - untested', requiresNote: true },
]

/** Raw row shape returned by the field_notes select. */
interface FieldNoteRow {
  id: string
  pitch_slug: string
  author_id: string
  display_name: string
  tweak: string
  player_level: PlayerLevel
  arm_slot: ArmSlot
  velocity_band: string | null
  intent: string
  claimed_result_kind: string
  claimed_result_note: string | null
  sample_size: number | null
  evidence_url: string | null
  evidence_label: string | null
  source_tier: CommunitySourceTier
  note: string | null
  adoption_count: number
  helpful_count: number
  base_rank: number
  created_at: string
}

interface ViewerEngagementRow {
  note_id: string
  tried: boolean | null
  helpful: boolean | null
}

interface ViewerMarkRow {
  note_id: string
}

const NOTE_COLUMNS =
  'id, pitch_slug, author_id, display_name, tweak, player_level, arm_slot, velocity_band, intent, claimed_result_kind, claimed_result_note, sample_size, evidence_url, evidence_label, source_tier, note, adoption_count, helpful_count, base_rank, created_at'
const ENGAGEMENT_LOOKUP_BATCH_SIZE = 100

const paceFromDb: Record<string, VelocityBand> = {
  'under-60': 'low-effort',
  '60-69': 'developing-arm',
  '70-79': 'prep-arm',
  '80-89': 'college-arm',
  '90-plus': 'power-arm',
  'low-effort': 'low-effort',
  'developing-arm': 'developing-arm',
  'prep-arm': 'prep-arm',
  'college-arm': 'college-arm',
  'power-arm': 'power-arm',
}

const paceToDb: Record<VelocityBand, string> = {
  'low-effort': 'under-60',
  'developing-arm': '60-69',
  'prep-arm': '70-79',
  'college-arm': '80-89',
  'power-arm': '90-plus',
}

const intentFromDb: Record<string, PitchIntent> = {
  'added-velocity': 'firmer-feel',
  'reduced-velocity': 'softer-feel',
  'firmer-feel': 'firmer-feel',
  'softer-feel': 'softer-feel',
  'more-movement': 'more-movement',
  'less-movement': 'less-movement',
  'better-command': 'better-command',
  deception: 'deception',
  'reduce-stress': 'reduce-stress',
  other: 'other',
}

const intentToDb: Record<PitchIntent, string> = {
  'more-movement': 'more-movement',
  'less-movement': 'less-movement',
  'firmer-feel': 'added-velocity',
  'softer-feel': 'reduced-velocity',
  'better-command': 'better-command',
  deception: 'deception',
  'reduce-stress': 'reduce-stress',
  other: 'other',
}

const resultFromDb: Record<string, ClaimedResultKind> = {
  'velocity-gain': 'firmer-result',
  'firmer-result': 'firmer-result',
  'more-movement': 'more-movement',
  'better-command': 'better-command',
  'reduced-discomfort': 'reduced-discomfort',
  inconsistent: 'inconsistent',
  'worked-in-bullpen': 'worked-in-bullpen',
  'worked-in-game': 'worked-in-game',
  'no-noticeable-change': 'no-noticeable-change',
}

const resultToDb: Record<ClaimedResultKind, string> = {
  'more-movement': 'more-movement',
  'better-command': 'better-command',
  'firmer-result': 'velocity-gain',
  'reduced-discomfort': 'reduced-discomfort',
  inconsistent: 'inconsistent',
  'worked-in-bullpen': 'worked-in-bullpen',
  'worked-in-game': 'worked-in-game',
  'no-noticeable-change': 'no-noticeable-change',
}

const SESSION_START_ERROR = 'Could not start your community session just now. Try again.'
const CLAIM_EMAIL_ERROR = 'Could not send the claim email just now. Try again.'

/**
 * Turn a Postgres/PostgREST error into a sentence a contributor can act on. The
 * safety triggers raise prefixed messages ("content_blocked: ...", "rate_limit: ...");
 * the "Sourced, not corrected" CHECK surfaces by constraint name. Anything else
 * stays generic so raw database text does not leak to the browser.
 */
export function friendlyDbError(error: { message?: string } | null): string {
  const raw = error?.message ?? ''
  if (raw.includes('content_blocked:'))
    return raw.split('content_blocked:')[1]?.trim() || 'That note contains language we do not allow here.'
  if (raw.includes('rate_limit:'))
    return raw.split('rate_limit:')[1]?.trim() || 'Too many notes in a short time - please slow down.'
  if (raw.includes('weak_tier_requires_note'))
    return 'A relayed or untested claim needs a short source note - say where it came from.'
  return 'Could not save that just now. Try again.'
}

/** Reads use their own fallback copy so load failures do not sound like failed writes. */
export function friendlyReadError(error: { message?: string } | null): string {
  const raw = error?.message ?? ''
  if (raw.includes('content_blocked:'))
    return raw.split('content_blocked:')[1]?.trim() || 'That note contains language we do not allow here.'
  return 'Could not load community notes just now. Try again.'
}

async function getSessionUserForRead() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) return null
    return data.session?.user ?? null
  } catch {
    return null
  }
}

async function getSessionUserForWrite() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session?.user ?? null
  } catch {
    throw new Error(SESSION_START_ERROR)
  }
}

function mapRow(row: FieldNoteRow, viewerId: string | null, tried: Set<string>, helpful: Set<string>): CommunityNote {
  return {
    id: row.id,
    pitchSlug: row.pitch_slug,
    authorId: row.author_id,
    displayName: row.display_name,
    tweak: row.tweak,
    playerLevel: row.player_level,
    armSlot: row.arm_slot,
    velocityBand: row.velocity_band ? paceFromDb[row.velocity_band] ?? null : null,
    intent: intentFromDb[row.intent] ?? 'other',
    claimedResultKind: resultFromDb[row.claimed_result_kind] ?? 'inconsistent',
    claimedResultNote: row.claimed_result_note,
    sampleSize: row.sample_size,
    evidenceUrl: row.evidence_url,
    evidenceLabel: row.evidence_label,
    sourceTier: row.source_tier,
    note: row.note,
    adoptionCount: row.adoption_count,
    helpfulCount: row.helpful_count,
    baseRank: row.base_rank,
    createdAt: row.created_at,
    viewerTried: tried.has(row.id),
    viewerHelpful: helpful.has(row.id),
    viewerIsAuthor: viewerId !== null && row.author_id === viewerId,
  }
}

function batchesOf<T>(items: T[], size: number): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size))
  return batches
}

function mergeViewerMarks(noteIds: string[], tried: Set<string>, helpful: Set<string>): ViewerEngagementRow[] {
  return noteIds
    .filter((noteId) => tried.has(noteId) || helpful.has(noteId))
    .map((noteId) => ({
      note_id: noteId,
      tried: tried.has(noteId),
      helpful: helpful.has(noteId),
    }))
}

async function fallbackViewerEngagement(noteIds: string[]): Promise<ViewerEngagementRow[]> {
  const visibleNotes = new Set(noteIds)
  const { data, error } = await supabase.rpc('viewer_note_engagement')
  if (error) throw new Error(friendlyReadError(error))
  return ((data ?? []) as ViewerEngagementRow[]).filter((row) => visibleNotes.has(row.note_id))
}

async function readViewerEngagement(noteIds: string[]): Promise<ViewerEngagementRow[]> {
  const uniqueNoteIds = [...new Set(noteIds.filter(Boolean))]
  if (uniqueNoteIds.length === 0) return []

  const tried = new Set<string>()
  const helpful = new Set<string>()

  for (const batch of batchesOf(uniqueNoteIds, ENGAGEMENT_LOOKUP_BATCH_SIZE)) {
    const [triedResult, helpfulResult] = await Promise.all([
      supabase.from('note_tries').select('note_id').in('note_id', batch),
      supabase.from('note_helpful').select('note_id').in('note_id', batch),
    ])

    if (triedResult.error || helpfulResult.error) {
      return fallbackViewerEngagement(uniqueNoteIds)
    }

    for (const row of (triedResult.data ?? []) as ViewerMarkRow[]) {
      if (row.note_id) tried.add(row.note_id)
    }
    for (const row of (helpfulResult.data ?? []) as ViewerMarkRow[]) {
      if (row.note_id) helpful.add(row.note_id)
    }
  }

  return mergeViewerMarks(uniqueNoteIds, tried, helpful)
}

/**
 * Sign in anonymously if there is no session yet, and return the user id.
 * Write-intent only — posting, reacting, reporting, accepting terms, claiming.
 * Reads use getSessionUserId() instead: the anon role already holds the SELECT
 * grants, so a visitor who only ever reads never mints an account.
 */
export async function ensureSession(): Promise<string> {
  const existing = await getSessionUserForWrite()
  if (existing) return existing.id

  try {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    if (!data.user) throw new Error('Anonymous sign-in returned no user.')
    return data.user.id
  } catch {
    throw new Error(SESSION_START_ERROR)
  }
}

/** The current session's user id, or null. Never creates a session. */
export async function getSessionUserId(): Promise<string | null> {
  const user = await getSessionUserForRead()
  return user?.id ?? null
}

/** Read the current contributor's profile (handle, contribution score, claimed state). */
export async function getIdentity(): Promise<CommunityIdentity | null> {
  const user = await getSessionUserForRead()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, is_claimed, contribution_score, notes_count')
    .eq('id', user.id)
    .maybeSingle()
  if (error) throw new Error(friendlyReadError(error))

  return {
    userId: user.id,
    displayName: data?.display_name ?? null,
    // The is_anonymous JWT claim only refreshes with the token, so trust the
    // profile row (kept in sync by a trigger) as the source of truth.
    isClaimed: data?.is_claimed ?? user.is_anonymous === false,
    contributionScore: data?.contribution_score ?? 0,
    notesCount: data?.notes_count ?? 0,
  }
}

/** Persist the contributor's display name for next time. */
export async function setDisplayName(name: string): Promise<void> {
  const user = await getSessionUserForWrite()
  if (!user) throw new Error('Not signed in.')
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: name })
    .eq('id', user.id)
  if (error) throw new Error(friendlyDbError(error))
}

/**
 * Ranked, visible field notes for one pitch, marked with the viewer's own actions.
 * Sorts on `base_rank` — the live ranking, computed by a DB trigger via
 * `note_base_rank()`. The richer model in lib/field-notes-rank.ts is the future
 * convergence target (needs view instrumentation); see its header for the plan.
 * RLS already drops hidden / unapproved notes, so what comes back is the public set.
 */
export async function listNotes(pitchSlug: string): Promise<CommunityNote[]> {
  // Reading is anonymous: no session is created here. The anon role holds the
  // field_notes SELECT grant, so the public set loads for a signed-out visitor.
  const viewerId = await getSessionUserId()

  const { data: rows, error } = await supabase
    .from('field_notes')
    .select(NOTE_COLUMNS)
    .eq('pitch_slug', pitchSlug)
    .order('base_rank', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw new Error(friendlyReadError(error))

  let tried = new Set<string>()
  let helpful = new Set<string>()
  if (viewerId && (rows ?? []).length > 0) {
    // RLS and column grants expose only this viewer's note ids. Scope the read to
    // the notes on this page; fall back to the legacy RPC if a deployment still
    // has older engagement grants.
    const engagementRows = await readViewerEngagement((rows ?? []).map((row) => (row as FieldNoteRow).id))
    tried = new Set(engagementRows.filter((r) => r.tried).map((r) => r.note_id))
    helpful = new Set(engagementRows.filter((r) => r.helpful).map((r) => r.note_id))
  }

  return (rows ?? []).map((row) => mapRow(row as FieldNoteRow, viewerId, tried, helpful))
}

/** Submit a field note. Saves the display name to the profile, returns the stored note. */
export async function submitNote(input: NewFieldNote): Promise<CommunityNote> {
  const viewerId = await ensureSession()

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ display_name: input.displayName })
    .eq('id', viewerId)
  if (profileError) throw new Error(friendlyDbError(profileError))

  const { data, error } = await supabase
    .from('field_notes')
    .insert({
      pitch_slug: input.pitchSlug,
      display_name: input.displayName,
      tweak: input.tweak,
      player_level: input.playerLevel,
      arm_slot: input.armSlot,
      velocity_band: input.velocityBand ? paceToDb[input.velocityBand] : null,
      intent: intentToDb[input.intent],
      claimed_result_kind: resultToDb[input.claimedResultKind],
      claimed_result_note: input.claimedResultNote,
      sample_size: input.sampleSize,
      evidence_url: input.evidenceUrl,
      evidence_label: input.evidenceLabel,
      source_tier: input.sourceTier,
      note: input.note,
    })
    .select(NOTE_COLUMNS)
    .single()
  if (error) throw new Error(friendlyDbError(error))

  return mapRow(data as FieldNoteRow, viewerId, new Set(), new Set())
}

/** Toggle "Tried This" (adoption). One row per account is enforced by the DB. */
export async function setTried(noteId: string, on: boolean): Promise<void> {
  const viewerId = await ensureSession()
  if (on) {
    const { error } = await supabase.from('note_tries').insert({ note_id: noteId })
    // 23505 = the one-per-account unique violation; treat as already-on.
    if (error && error.code !== '23505') throw new Error(friendlyDbError(error))
  } else {
    const { error } = await supabase
      .from('note_tries')
      .delete()
      .eq('note_id', noteId)
      .eq('user_id', viewerId)
    if (error) throw new Error(friendlyDbError(error))
  }
}

/** Toggle "Helpful". One row per account is enforced by the DB. */
export async function setHelpful(noteId: string, on: boolean): Promise<void> {
  const viewerId = await ensureSession()
  if (on) {
    const { error } = await supabase.from('note_helpful').insert({ note_id: noteId })
    if (error && error.code !== '23505') throw new Error(friendlyDbError(error))
  } else {
    const { error } = await supabase
      .from('note_helpful')
      .delete()
      .eq('note_id', noteId)
      .eq('user_id', viewerId)
    if (error) throw new Error(friendlyDbError(error))
  }
}

/**
 * Flag a note for review. Writes to the moderation queue; admins triage it, and
 * once enough distinct accounts flag a note the database auto-hides it pending
 * review. One report per account per note is enforced by a unique index — a
 * repeat flag from the same account (23505) is treated as already-reported.
 */
export async function reportNote(noteId: string, reason: string): Promise<void> {
  await ensureSession()
  const { error } = await supabase.from('note_reports').insert({ note_id: noteId, reason })
  if (error && error.code !== '23505') throw new Error(friendlyDbError(error))
}

/**
 * Claim the anonymous account by attaching an email. The user id never changes,
 * so every note and point survives and now follows them across devices. Supabase
 * emails a confirmation link; is_claimed flips when it is confirmed.
 */
export async function claimWithEmail(email: string): Promise<void> {
  await ensureSession()
  try {
    const { error } = await supabase.auth.updateUser({ email })
    if (error) throw error
  } catch {
    throw new Error(CLAIM_EMAIL_ERROR)
  }
}
