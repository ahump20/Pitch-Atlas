-- Keep Field Notes inside the product's grip-and-technique boundary. Historical
-- medical-adjacent categories are quarantined, not deleted, before new writes close.
update public.field_notes
set
  visibility = 'rejected',
  is_hidden = true,
  updated_at = now()
where intent = 'reduce-stress'
   or claimed_result_kind = 'reduced-discomfort';

-- NOT VALID preserves read compatibility in any environment that already has a
-- legacy row while PostgreSQL still enforces the check on every future insert/update.
alter table public.field_notes
  add constraint field_notes_grip_technique_scope_only
  check (
    intent <> 'reduce-stress'
    and claimed_result_kind <> 'reduced-discomfort'
  ) not valid;

comment on constraint field_notes_grip_technique_scope_only on public.field_notes is
  'New Field Notes stay inside grip and technique. Legacy medical-adjacent categories remain readable but cannot be inserted or updated.';

-- A separate, narrow guard covers high-signal freeform scope violations without
-- changing or exposing the private moderation wordlist. Normalization catches case
-- and punctuation variants while the phrases stay specific enough for grip talk.
create or replace function private.enforce_field_note_grip_technique_scope()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  normalized_text text;
begin
  normalized_text := ' ' || pg_catalog.regexp_replace(
    pg_catalog.lower(
      pg_catalog.concat_ws(
        ' ',
        new.tweak,
        new.note,
        new.claimed_result_note,
        new.evidence_label
      )
    ),
    '[^a-z0-9]+',
    ' ',
    'g'
  ) || ' ';

  if normalized_text ~ ' (medical|diagnos(e|ed|es|ing|is)|treat(ment|ments|ing)|injur(y|ies|ed)|pain|soreness|discomfort|rehab|rehabilitation) '
     or normalized_text ~ ' (arm|elbow|shoulder) (stress|recovery) '
     or normalized_text ~ ' (pitch count|pitch counts|workload|work load|rest day|rest days|day rest|days rest|throwing program|throwing plan|throwing schedule|recovery program|recovery plan|recovery protocol) '
     or normalized_text ~ ' (youth|young pitcher|young pitchers|child|children|teen|teenager|high school|under [0-9]+|[0-9]+ year old|[0-9]+ years old) .{0,40} (training|program|workload|pitch count|pitch counts|rest day|rest days|throwing plan|throwing schedule|should|must|need|needs) ' then
    raise exception 'content_blocked: Field Notes are for grip and technique only, not medical, injury, workload, or youth-training prescriptions';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_field_note_grip_technique_scope() from public, anon, authenticated;

drop trigger if exists trg_field_note_grip_technique_scope on public.field_notes;
create trigger trg_field_note_grip_technique_scope
  before insert or update of tweak, note, claimed_result_note, evidence_label
  on public.field_notes
  for each row execute function private.enforce_field_note_grip_technique_scope();

comment on function private.enforce_field_note_grip_technique_scope() is
  'Blocks high-signal medical, injury, workload, and youth-prescription text from Field Notes while leaving the separate moderation wordlist untouched.';

-- Only plain approved rows belong in public reads. Authors can still inspect their
-- own quarantined history; claimed admins retain the existing review path.
drop policy if exists field_notes_read on public.field_notes;
create policy field_notes_read on public.field_notes for select
  to anon, authenticated
  using (
    private.is_admin()
    or author_id = (select auth.uid())
    or (
      is_hidden = false
      and visibility = 'approved'
      and not private.blocked_between((select auth.uid()), author_id)
    )
  );
