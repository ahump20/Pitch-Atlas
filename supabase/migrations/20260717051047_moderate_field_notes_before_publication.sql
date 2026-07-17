-- Field Notes are structured claims, so they enter a private review state instead
-- of publishing on insert. The live table had zero rows when this migration ran;
-- the update keeps other environments safe without deleting contributor work.
alter table public.field_notes
  alter column visibility set default 'pending';

update public.field_notes
set
  visibility = 'pending',
  updated_at = pg_catalog.now()
where visibility = 'approved'
  and is_hidden = false;

-- Close obvious wording gaps before the review queue. Review is still the final
-- public gate because a word filter cannot prove that a claim is in scope.
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

  if normalized_text ~ ' (medical|diagnos(e|ed|es|ing|is)|treat(ment|ments|ing)|injur(y|ies|ed)|pain|soreness|discomfort|hurt|hurts|hurting|ache|aches|aching|rehab|rehabilitation) '
     or normalized_text ~ ' (arm|elbow|shoulder) (stress|recovery) '
     or normalized_text ~ ' (pitch count|pitch counts|workload|work load|rest day|rest days|day rest|days rest|throwing program|throwing plan|throwing schedule|recovery program|recovery plan|recovery protocol) '
     or normalized_text ~ ' (youth|young pitcher|young pitchers|child|children|teen|teenager|high school|[0-9]{1,2}u|under [0-9]+|[0-9]+ year old|[0-9]+ years old) ' then
    raise exception 'content_blocked: Field Notes are for grip and technique only, not medical, injury, workload, or youth-training prescriptions';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_field_note_grip_technique_scope()
  from public, anon, authenticated;

comment on function private.enforce_field_note_grip_technique_scope() is
  'Blocks high-signal medical, injury, workload, and youth-specific text from Field Notes before every new row enters review.';
