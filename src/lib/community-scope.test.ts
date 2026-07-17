import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  PLAYER_LEVELS,
  type ClaimedResultKind,
  type PitchIntent,
} from '../data/field-notes'
import { PITCHES } from '../data/pitches'
import {
  INTENT_OPTIONS,
  RESULT_OPTIONS,
  fieldNoteIntentLabel,
  fieldNoteResultLabel,
  type NewFieldNote,
} from './community'

const migration = readFileSync(
  resolve(
    process.cwd(),
    'supabase/migrations/20260717043000_field_notes_grip_technique_scope.sql',
  ),
  'utf8',
)
const moderationMigration = readFileSync(
  resolve(
    process.cwd(),
    'supabase/migrations/20260717051047_moderate_field_notes_before_publication.sql',
  ),
  'utf8',
)

describe('Field Notes grip-and-technique scope', () => {
  it('does not offer medical-adjacent intent or result prompts', () => {
    expect(INTENT_OPTIONS.map((option) => option.value)).not.toContain('reduce-stress')
    expect(RESULT_OPTIONS.map((option) => option.value)).not.toContain('reduced-discomfort')
    expect(INTENT_OPTIONS.map((option) => option.label).join(' ')).not.toMatch(/arm stress/i)
    expect(RESULT_OPTIONS.map((option) => option.label).join(' ')).not.toMatch(/discomfort/i)

    expectTypeOf<Extract<NewFieldNote['intent'], 'reduce-stress'>>().toEqualTypeOf<never>()
    expectTypeOf<
      Extract<NewFieldNote['claimedResultKind'], 'reduced-discomfort'>
    >().toEqualTypeOf<never>()
  })

  it('keeps legacy database categories readable behind neutral labels', () => {
    expectTypeOf<'reduce-stress'>().toMatchTypeOf<PitchIntent>()
    expectTypeOf<'reduced-discomfort'>().toMatchTypeOf<ClaimedResultKind>()
    expect(fieldNoteIntentLabel('reduce-stress')).toBe('Legacy category (closed)')
    expect(fieldNoteResultLabel('reduced-discomfort')).toBe('Legacy category (closed)')
  })

  it('keeps stored player-level values while using context-only labels', () => {
    expect(PLAYER_LEVELS).toEqual([
      { value: 'youth', label: 'Developing competition' },
      { value: 'high-school', label: 'School competition' },
      { value: 'college-plus', label: 'College and adult competition' },
    ])
    expect(PLAYER_LEVELS.map((level) => level.label).join(' ')).not.toMatch(
      /under.?14|14.?18|youth|high.?school|should|must|recommended|safe|training plan/i,
    )
  })

  it('keeps every filed pitch on truthful live safety and provenance copy', () => {
    for (const pitch of PITCHES) {
      expect(pitch.community.safetyNote, pitch.display.slug).toContain('Field Notes are live')
      expect(pitch.community.safetyNote, pitch.display.slug).toContain('grip and technique only')
      expect(pitch.community.safetyNote, pitch.display.slug).toContain(
        'No medical, injury, workload, or youth-training prescriptions.',
      )
      expect(pitch.community.safetyNote, pitch.display.slug).not.toMatch(
        /when the community layer opens/i,
      )
      expect(pitch.community.provenanceNote, pitch.display.slug).toContain(
        'Every community variant carries',
      )
      expect(pitch.community.provenanceNote, pitch.display.slug).not.toMatch(/when they open/i)
    }
  })

  it('quarantines legacy categories without deletion and blocks them on future writes', () => {
    expect(migration).toContain('constraint field_notes_grip_technique_scope_only')
    expect(migration).toContain("intent <> 'reduce-stress'")
    expect(migration).toContain("claimed_result_kind <> 'reduced-discomfort'")
    expect(migration).toMatch(/\)\s+not valid;/i)

    const executableSql = migration
      .split('\n')
      .map((line) => line.replace(/--.*$/, ''))
      .join('\n')
    expect(executableSql).not.toMatch(/\bdelete\s+from\s+public\.field_notes\b/i)
    expect(executableSql).toMatch(
      /update\s+public\.field_notes\s+set[\s\S]*visibility\s*=\s*'rejected'[\s\S]*is_hidden\s*=\s*true/i,
    )
  })

  it('blocks high-signal freeform safety claims in every contributor text field', () => {
    expect(migration).toContain('function private.enforce_field_note_grip_technique_scope()')
    expect(migration).toContain('new.tweak')
    expect(migration).toContain('new.note')
    expect(migration).toContain('new.claimed_result_note')
    expect(migration).toContain('new.evidence_label')
    expect(migration).toContain('content_blocked: Field Notes are for grip and technique only')
    expect(migration).toMatch(
      /before insert or update of tweak, note, claimed_result_note, evidence_label/i,
    )
    expect(migration).not.toMatch(/\b(public\.)?banned_terms\b/i)
    expect(moderationMigration).toMatch(/hurt\|hurts\|hurting/)
    expect(moderationMigration).toContain('[0-9]{1,2}u')
  })

  it('queues new notes for review and limits public reads to approved rows', () => {
    expect(moderationMigration).toMatch(
      /alter\s+column\s+visibility\s+set\s+default\s+'pending'/i,
    )
    expect(moderationMigration).not.toMatch(
      /alter\s+column\s+visibility\s+set\s+default\s+'approved'/i,
    )
    expect(migration).toContain('drop policy if exists field_notes_read on public.field_notes')
    expect(migration).toContain("visibility = 'approved'")
    expect(migration).not.toContain("'approved-youth-safe'")
    expect(migration).toContain('private.is_admin()')
    expect(migration).toContain('author_id = (select auth.uid())')
  })
})
