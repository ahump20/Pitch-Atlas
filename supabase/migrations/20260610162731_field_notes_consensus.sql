-- B9 step 4: community consensus over "I tried this" reports, with structured outcomes
-- and tier-capped ranking. Mirrors the canonical ClaimConfidence ladder declared in
-- src/data/types.ts (declaration order = evidence strength).
-- NOTE: the two views created here ran with definer rights and were flagged at ERROR
-- level by the security advisor. The immediate follow-up migration
-- (20260610163045_consensus_invoker_views_and_tier_capped_rank) replaces them with
-- invoker-rights views over denormalized counts. Kept verbatim for history.

-- 4a. Structure the outcome. The column was free text, unused (0 rows), never written
-- by the client. Renamed to outcome_kind with a closed vocabulary so a verdict can be
-- aggregated honestly instead of parsed from prose.
alter table public.note_tries rename column outcome to outcome_kind;
alter table public.note_tries drop constraint note_tries_outcome_check;
alter table public.note_tries add constraint note_tries_outcome_kind_check
  check (outcome_kind is null or outcome_kind in ('worked','mixed','no-change','worse'));

-- 4b. Let a user record/revise the outcome on their own try (insert-only flow could
-- never capture "I tried it last week, here's what happened"). Same guards as the
-- sibling policies: own row, no anonymous JWTs, ownership cannot be reassigned.
create policy tries_update_own on public.note_tries
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and coalesce(((auth.jwt() ->> 'is_anonymous'))::boolean, false) = false
  )
  with check (user_id = (select auth.uid()));

-- 4c. Public consensus view (SUPERSEDED by 20260610163045 — see note above).
create view public.note_consensus
  with (security_barrier = true) as
select
  f.id as note_id,
  f.pitch_slug,
  count(t.id)::int as tried_count,
  count(t.outcome_kind)::int as reported_count,
  count(*) filter (where t.outcome_kind = 'worked')::int as worked_count,
  count(*) filter (where t.outcome_kind = 'mixed')::int as mixed_count,
  count(*) filter (where t.outcome_kind = 'no-change')::int as no_change_count,
  count(*) filter (where t.outcome_kind = 'worse')::int as worse_count,
  case
    when count(t.outcome_kind) < 3 then null
    when count(*) filter (where t.outcome_kind = 'worked')::numeric
         / count(t.outcome_kind) >= 0.65 then 'mostly-worked'
    when count(*) filter (where t.outcome_kind = 'worked')::numeric
         / count(t.outcome_kind) <= 0.35 then 'mostly-not'
    else 'mixed'
  end as consensus
from public.field_notes f
left join public.note_tries t on t.note_id = f.id
where f.visibility in ('approved','approved-youth-safe') and not f.is_hidden
group by f.id, f.pitch_slug;

comment on view public.note_consensus is
  'Aggregate-only consensus over note_tries. Definer-style on purpose: per-user try rows stay private under RLS; only counts over approved, non-hidden notes are exposed. Verdict is NULL below 3 reported outcomes.';

revoke all on public.note_consensus from public;
grant select on public.note_consensus to anon, authenticated;

-- 4d. Tier-capped ranking view (SUPERSEDED by 20260610163045, which moves the cap
-- into note_base_rank itself — the column the app already orders by).
create view public.field_note_rank
  with (security_barrier = true) as
select
  f.id as note_id,
  f.pitch_slug,
  f.source_tier,
  (case f.source_tier
     when 'coach-observed'        then 500
     when 'reputable-analysis'    then 400
     when 'secondhand-attributed' then 300
     when 'community-firsthand'   then 200
     else 100
   end
   + least(99, f.helpful_count * 2 + f.adoption_count * 3))::int as rank_score
from public.field_notes f
where f.visibility in ('approved','approved-youth-safe') and not f.is_hidden;

comment on view public.field_note_rank is
  'Tier-capped ranking: band base from the canonical evidence ladder + engagement capped at 99 so engagement never crosses an evidence band.';

revoke all on public.field_note_rank from public;
grant select on public.field_note_rank to anon, authenticated;
