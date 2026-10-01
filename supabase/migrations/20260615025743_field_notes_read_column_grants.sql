-- Keep public Field Notes reads to the columns rendered by the app.
--
-- RLS still decides which rows are visible. This grant boundary decides which
-- fields a public client can read from those rows.

revoke select on public.field_notes from anon, authenticated;

grant select (
  id,
  pitch_slug,
  author_id,
  display_name,
  tweak,
  player_level,
  arm_slot,
  velocity_band,
  intent,
  claimed_result_kind,
  claimed_result_note,
  sample_size,
  evidence_url,
  evidence_label,
  source_tier,
  note,
  adoption_count,
  helpful_count,
  base_rank,
  created_at
) on public.field_notes to anon, authenticated;

comment on table public.field_notes is
  'Community field-note submissions. Client roles read rendered note columns only; moderation state, visibility, and internal rollup counters stay database-owned.';
