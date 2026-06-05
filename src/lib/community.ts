import { supabase } from './supabase'
import type {
  PlayerLevel,
  ArmSlot,
  VelocityBand,
  PitchIntent,
  ClaimedResultKind,
} from '../data/field-notes'

/*
  The Field Notes data layer. Pure functions over Supabase — React lives in the
  hook, not here. Every write rides the signed-in account (anonymous or claimed);
  the database enforces one-per-account on Tried This and Helpful, own-row edits,
  and "Sourced, not corrected" (a weak tier without a note is rejected by a
  CHECK constraint, not just the form). Nothing here fabricates a post or a count.
*/

/** Community-relevant subset of the app's ClaimConfidence tiers. */
export type CommunitySourceTier =
  | 'coach-observed'
  | 'reputable-analysis'
  | 'community-firsthand'
  | 'secondhand-attributed'
  | 'unverified'

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
  { value: 'added-velocity', label: 'Added velocity' },
  { value: 'reduced-velocity', label: 'Reduced velocity' },
  { value: 'better-command', label: 'Better command' },
  { value: 'deception', label: 'More deception' },
  { value: 'reduce-stress', label: 'Less arm stress' },
  { value: 'other', label: 'Something else' },
]

export const RESULT_OPTIONS: { value: ClaimedResultKind; label: string }[] = [
  { value: 'more-movement', label: 'More movement' },
  { value: 'better-command', label: 'Better command' },
  { value: 'velocity-gain', label: 'Velocity gain' },
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
  { value: 'unverified', label: 'A hunch — untested', requiresNote: true },
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
  velocity_band: VelocityBand | null
  intent: PitchIntent
  claimed_result_kind: ClaimedResultKind
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

const NOTE_COLUMNS =
  'id, pitch_slug, author_id, display_name, tweak, player_level, arm_slot, velocity_band, intent, claimed_result_kind, claimed_result_note, sample_size, evidence_url, evidence_label, source_tier, note, adoption_count, helpful_count, base_rank, created_at'

function mapRow(row: FieldNoteRow, viewerId: string, tried: Set<string>, helpful: Set<string>): CommunityNote {
  return {
    id: row.id,
    pitchSlug: row.pitch_slug,
    authorId: row.author_id,
    displayName: row.display_name,
    tweak: row.tweak,
    playerLevel: row.player_level,
    armSlot: row.arm_slot,
    velocityBand: row.velocity_band,
    intent: row.intent,
    claimedResultKind: row.claimed_result_kind,
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
    viewerIsAuthor: row.author_id === viewerId,
  }
}

/** Sign in anonymously if there is no session yet, and return the user id. */
export async function ensureSession(): Promise<string> {
  const { data: existing } = await supabase.auth.getSession()
  if (existing.session?.user) return existing.session.user.id

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  if (!data.user) throw new Error('Anonymous sign-in returned no user.')
  return data.user.id
}

/** Read the current contributor's profile (handle, contribution score, claimed state). */
export async function getIdentity(): Promise<CommunityIdentity | null> {
  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData.session?.user
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, is_claimed, contribution_score, notes_count')
    .eq('id', user.id)
    .maybeSingle()
  if (error) throw error

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
  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData.session?.user
  if (!user) throw new Error('Not signed in.')
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: name })
    .eq('id', user.id)
  if (error) throw error
}

/** Ranked, visible field notes for one pitch, marked with the viewer's own actions. */
export async function listNotes(pitchSlug: string): Promise<CommunityNote[]> {
  const viewerId = await ensureSession()

  const { data: rows, error } = await supabase
    .from('field_notes')
    .select(NOTE_COLUMNS)
    .eq('pitch_slug', pitchSlug)
    .order('base_rank', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error

  // RLS scopes these to the viewer's own rows, so a plain select is the viewer's set.
  const [{ data: triedRows }, { data: helpfulRows }] = await Promise.all([
    supabase.from('note_tries').select('note_id'),
    supabase.from('note_helpful').select('note_id'),
  ])
  const tried = new Set((triedRows ?? []).map((r) => r.note_id as string))
  const helpful = new Set((helpfulRows ?? []).map((r) => r.note_id as string))

  return (rows ?? []).map((row) => mapRow(row as FieldNoteRow, viewerId, tried, helpful))
}

/** Submit a field note. Saves the display name to the profile, returns the stored note. */
export async function submitNote(input: NewFieldNote): Promise<CommunityNote> {
  const viewerId = await ensureSession()

  // Keep the handle for next time; ignore a failure here (the note still matters).
  await supabase.from('profiles').update({ display_name: input.displayName }).eq('id', viewerId)

  const { data, error } = await supabase
    .from('field_notes')
    .insert({
      pitch_slug: input.pitchSlug,
      display_name: input.displayName,
      tweak: input.tweak,
      player_level: input.playerLevel,
      arm_slot: input.armSlot,
      velocity_band: input.velocityBand,
      intent: input.intent,
      claimed_result_kind: input.claimedResultKind,
      claimed_result_note: input.claimedResultNote,
      sample_size: input.sampleSize,
      evidence_url: input.evidenceUrl,
      evidence_label: input.evidenceLabel,
      source_tier: input.sourceTier,
      note: input.note,
    })
    .select(NOTE_COLUMNS)
    .single()
  if (error) throw error

  return mapRow(data as FieldNoteRow, viewerId, new Set(), new Set())
}

/** Toggle "Tried This" (adoption). One row per account is enforced by the DB. */
export async function setTried(noteId: string, on: boolean): Promise<void> {
  const viewerId = await ensureSession()
  if (on) {
    const { error } = await supabase.from('note_tries').insert({ note_id: noteId })
    // 23505 = the one-per-account unique violation; treat as already-on.
    if (error && error.code !== '23505') throw error
  } else {
    const { error } = await supabase
      .from('note_tries')
      .delete()
      .eq('note_id', noteId)
      .eq('user_id', viewerId)
    if (error) throw error
  }
}

/** Toggle "Helpful". One row per account is enforced by the DB. */
export async function setHelpful(noteId: string, on: boolean): Promise<void> {
  const viewerId = await ensureSession()
  if (on) {
    const { error } = await supabase.from('note_helpful').insert({ note_id: noteId })
    if (error && error.code !== '23505') throw error
  } else {
    const { error } = await supabase
      .from('note_helpful')
      .delete()
      .eq('note_id', noteId)
      .eq('user_id', viewerId)
    if (error) throw error
  }
}

/** Flag a note for review. Writes to the moderation queue; admins triage it. */
export async function reportNote(noteId: string, reason: string): Promise<void> {
  await ensureSession()
  const { error } = await supabase.from('note_reports').insert({ note_id: noteId, reason })
  if (error) throw error
}

/**
 * Claim the anonymous account by attaching an email. The user id never changes,
 * so every note and point survives and now follows them across devices. Supabase
 * emails a confirmation link; is_claimed flips when it is confirmed.
 */
export async function claimWithEmail(email: string): Promise<void> {
  await ensureSession()
  const { error } = await supabase.auth.updateUser({ email })
  if (error) throw error
}
