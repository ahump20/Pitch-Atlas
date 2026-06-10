-- B9 step 5 (corrective): the two consensus views from the previous migration ran with
-- definer rights and the security advisor flags that at ERROR level. This replaces the
-- approach with the project's established pattern: denormalized public counts on
-- field_notes maintained by the existing SECURITY DEFINER trigger (locked search_path),
-- and invoker-rights views that respect RLS.
-- Also fixes the real ranking flaw: note_base_rank let engagement (up to +0.50)
-- swamp tier differences (~0.035 between adjacent tiers), so a viral unverified note
-- could outrank a quiet coach-observed one. Ranking is now banded: engagement is capped
-- at 99 points, one full band below the next evidence tier.
-- Tier order follows the DATABASE's established order (coach-observed > reputable-analysis
-- > community-firsthand > secondhand-attributed > unverified), which matches the
-- weak_tier_requires_note constraint. NOTE: src/data/types.ts declares secondhand-attributed
-- above community-firsthand in its display order — surfaced as a known discrepancy; the
-- DB order is operative for field-note ranking.

-- 5a. Public outcome counts, same pattern as adoption_count / helpful_count.
alter table public.field_notes
  add column tries_worked_count    int not null default 0,
  add column tries_mixed_count     int not null default 0,
  add column tries_no_change_count int not null default 0,
  add column tries_worse_count     int not null default 0;

-- 5b. Extend the existing engagement trigger to maintain the outcome buckets.
create or replace function public.on_engagement_change()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_note uuid; v_author uuid; v_adopt int; v_help int;
  v_worked int; v_mixed int; v_nochange int; v_worse int;
begin
  v_note := coalesce(new.note_id, old.note_id);
  select author_id into v_author from public.field_notes where id = v_note;
  if v_author is null then return coalesce(new, old); end if;
  select count(*) into v_adopt from public.note_tries  where note_id = v_note;
  select count(*) into v_help  from public.note_helpful where note_id = v_note;
  select
    count(*) filter (where outcome_kind = 'worked'),
    count(*) filter (where outcome_kind = 'mixed'),
    count(*) filter (where outcome_kind = 'no-change'),
    count(*) filter (where outcome_kind = 'worse')
  into v_worked, v_mixed, v_nochange, v_worse
  from public.note_tries where note_id = v_note;
  update public.field_notes f set
    adoption_count = v_adopt,
    helpful_count  = v_help,
    tries_worked_count    = v_worked,
    tries_mixed_count     = v_mixed,
    tries_no_change_count = v_nochange,
    tries_worse_count     = v_worse,
    base_rank = public.note_base_rank(f.source_tier, f.evidence_url is not null, v_adopt, v_help, f.sample_size),
    updated_at = now()
  where f.id = v_note;
  perform public.refresh_author_rollup(v_author);
  return coalesce(new, old);
end; $function$;

-- 5c. Tier-capped ranking. Same signature, banded internals: evidence band base
-- (100-point bands) + engagement/evidence points capped at 99 so no amount of
-- engagement crosses into the next evidence band. 0 rows exist, so no live re-rank.
create or replace function public.note_base_rank(p_source_tier text, p_has_evidence boolean, p_adoption integer, p_helpful integer, p_sample integer)
 returns numeric
 language sql
 immutable
 set search_path to 'public'
as $function$
  select (
    (case p_source_tier
       when 'coach-observed'        then 500
       when 'reputable-analysis'    then 400
       when 'community-firsthand'   then 300
       when 'secondhand-attributed' then 200
       when 'unverified'            then 100
       else 250 end)
    + least(99,
        p_adoption * 3
      + p_helpful * 2
      + (case when p_has_evidence then 15 else 0 end)
      + least(coalesce(p_sample, 0) / 2, 10))
  )::numeric;
$function$;

-- 5d. Replace the definer views with invoker-rights views over field_notes only.
-- RLS on field_notes now governs what each caller sees; no privilege escalation.
drop view public.note_consensus;
drop view public.field_note_rank;

create view public.note_consensus
  with (security_invoker = true, security_barrier = true) as
select
  f.id as note_id,
  f.pitch_slug,
  f.adoption_count as tried_count,
  (f.tries_worked_count + f.tries_mixed_count + f.tries_no_change_count + f.tries_worse_count) as reported_count,
  f.tries_worked_count as worked_count,
  f.tries_mixed_count as mixed_count,
  f.tries_no_change_count as no_change_count,
  f.tries_worse_count as worse_count,
  case
    when (f.tries_worked_count + f.tries_mixed_count + f.tries_no_change_count + f.tries_worse_count) < 3 then null
    when f.tries_worked_count::numeric
         / (f.tries_worked_count + f.tries_mixed_count + f.tries_no_change_count + f.tries_worse_count) >= 0.65 then 'mostly-worked'
    when f.tries_worked_count::numeric
         / (f.tries_worked_count + f.tries_mixed_count + f.tries_no_change_count + f.tries_worse_count) <= 0.35 then 'mostly-not'
    else 'mixed'
  end as consensus
from public.field_notes f;

comment on view public.note_consensus is
  'Invoker-rights consensus over denormalized outcome counts. Verdict is NULL below 3 reported outcomes — tries without outcomes prove popularity, not results. Visibility is governed by field_notes RLS.';

revoke all on public.note_consensus from public;
grant select on public.note_consensus to anon, authenticated;
