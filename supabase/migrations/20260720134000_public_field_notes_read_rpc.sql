-- Public Field Notes need to filter on moderation state without granting client
-- roles direct SELECT access to visibility or is_hidden. PostgREST requires
-- column privilege for a client-side filter, so the old `.eq('visibility',
-- 'approved')` query failed the whole read with 42501.
--
-- Keep those database-owned columns private. This function performs the public
-- gate under a pinned SECURITY DEFINER context and returns only the same rendered
-- columns already covered by the column-scoped table grant.

create or replace function public.list_public_field_notes(p_pitch_slug text)
returns table (
  id uuid,
  pitch_slug text,
  author_id uuid,
  display_name text,
  tweak text,
  player_level text,
  arm_slot text,
  velocity_band text,
  intent text,
  claimed_result_kind text,
  claimed_result_note text,
  sample_size integer,
  evidence_url text,
  evidence_label text,
  source_tier text,
  note text,
  adoption_count integer,
  helpful_count integer,
  base_rank numeric,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  -- This is intentionally SECURITY DEFINER: public roles cannot inspect the
  -- moderation columns used below. Keep the return list explicit and read-only.
  select
    f.id,
    f.pitch_slug,
    f.author_id,
    f.display_name,
    f.tweak,
    f.player_level,
    f.arm_slot,
    f.velocity_band,
    f.intent,
    f.claimed_result_kind,
    f.claimed_result_note,
    f.sample_size,
    f.evidence_url,
    f.evidence_label,
    f.source_tier,
    f.note,
    f.adoption_count,
    f.helpful_count,
    f.base_rank,
    f.created_at
  from public.field_notes f
  where f.pitch_slug = p_pitch_slug
    and f.visibility = 'approved'
    and f.is_hidden = false
    and not private.blocked_between((select auth.uid()), f.author_id)
  order by f.base_rank desc, f.created_at desc;
$$;

revoke all on function public.list_public_field_notes(text) from public, anon, authenticated;
grant execute on function public.list_public_field_notes(text) to anon, authenticated;

comment on function public.list_public_field_notes(text) is
  'Public Field Notes for one pitch. Returns rendered columns only after the approved, visible, and viewer-block gates.';
