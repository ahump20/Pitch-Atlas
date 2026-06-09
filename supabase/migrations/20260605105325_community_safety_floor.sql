-- Pitch Atlas — community safety floor (2026-06-05)
-- ----------------------------------------------------------------------------
-- Self-protecting UGC floor for the Field Notes surface: a public, youth-accessible,
-- text-only community layer. Everything here is additive and reversible; no existing
-- rows are modified. The base schema (profiles / pitches / field_notes / note_tries /
-- note_helpful / note_reports + RLS + rank triggers) was applied earlier via MCP.
--
-- This file is the CONSOLIDATED final state (applied live in four steps:
-- community_safety_floor, _hardening, _spaced_match_fix, _lock_banned_terms). A
-- from-scratch apply of this one file reproduces the live database.
--
-- Defence in depth, none of it depending on an admin watching a queue:
--   1. one report per account per note   (de-dupe + anti-grief on the count)
--   2. report-driven auto-hide            (distinct flags hide a note pending review)
--   3. per-account submission throttle    (a single account cannot flood a pitch)
--   4. banned-term content guard          (DB-managed list; leetspeak/zero-width/
--                                          spaced-letter resistant; Scunthorpe-safe)
-- The per-account controls are real but priced in accounts, which anonymous sign-in
-- makes cheap; bot protection (Turnstile) and a moderator account are the next steps
-- before the layer is opened to the public (it ships gated, community.enabled=false).
-- ----------------------------------------------------------------------------

-- 1) One report per account per note.
create unique index if not exists note_reports_one_per_reporter
  on public.note_reports (note_id, reporter_id);

-- 2) Report-driven auto-hide. Hiding (not deleting) is reversible: an admin clears
--    is_hidden to restore. The author still sees their own note via RLS.
create or replace function public.on_note_report_autohide()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public'
as $$
declare
  v_distinct int;
  v_author uuid;
  v_threshold constant int := 3;  -- distinct reporters before auto-hide
begin
  select count(distinct reporter_id) into v_distinct
  from public.note_reports
  where note_id = new.note_id and status = 'open';

  if v_distinct >= v_threshold then
    update public.field_notes
      set is_hidden = true, updated_at = now()
      where id = new.note_id and is_hidden = false
      returning author_id into v_author;
    if v_author is not null then
      perform public.refresh_author_rollup(v_author);
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_note_report_autohide on public.note_reports;
create trigger trg_note_report_autohide
  after insert on public.note_reports
  for each row execute function public.on_note_report_autohide();

-- 3) Submission throttle (rolling hour, per account). Stays INSERT-only on purpose:
--    an edit creates no new visible row, so it must not burn the hourly cap.
create or replace function public.enforce_field_note_rate_limit()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public'
as $$
declare
  v_recent int;
  v_max_per_hour constant int := 10;
begin
  select count(*) into v_recent
  from public.field_notes
  where author_id = new.author_id
    and created_at > now() - interval '1 hour';

  if v_recent >= v_max_per_hour then
    raise exception 'rate_limit: too many notes in a short time — please slow down and try again later';
  end if;
  return new;
end; $$;

drop trigger if exists trg_field_note_rate_limit on public.field_notes;
create trigger trg_field_note_rate_limit
  before insert on public.field_notes
  for each row execute function public.enforce_field_note_rate_limit();

-- 4) Content safety guard. Admin-managed term list (seeded out-of-band; the words
--    are never committed to source). The matcher is whole-word and case/punctuation
--    insensitive, folds common leetspeak, strips control + zero-width characters,
--    and catches deliberately spaced-out letters ("f a g") by substring-matching
--    ONLY within spaced single-character runs — real words never enter a run, so the
--    Scunthorpe problem stays solved and there is no regex-injection surface.
create table if not exists public.banned_terms (
  term       text primary key,
  created_at timestamptz not null default now()
);
alter table public.banned_terms enable row level security;

-- banned_terms is read only by the SECURITY DEFINER matcher (as owner) and managed
-- out-of-band via SQL/service-role. It must never be reachable through PostgREST or
-- discoverable in the GraphQL schema: revoke every role grant and create no policy.
-- RLS stays enabled (default-deny) as defense in depth.
revoke all on public.banned_terms from anon, authenticated;

create or replace function public.text_has_banned_term(p_text text)
  returns boolean
  language plpgsql
  stable
  security definer
  set search_path to 'public'
as $$
declare
  v_clean   text;
  v_norm    text;
  v_tokens  text[];
  v_runs    text := '';
  v_run     text := '';
  tok       text;
begin
  if p_text is null or length(trim(p_text)) = 0 then
    return false;
  end if;

  -- strip control + common zero-width characters
  v_clean := regexp_replace(p_text, '[[:cntrl:]]', '', 'g');
  v_clean := replace(replace(replace(replace(replace(v_clean,
               chr(8203), ''), chr(8204), ''), chr(8205), ''), chr(8288), ''), chr(65279), '');

  -- lowercase + fold common leetspeak (f0ck / n1gger / $pic survive as letters)
  v_clean := lower(v_clean);
  v_clean := translate(v_clean, '0134578@$!', 'oieastbasi');

  -- normalize to space-delimited tokens; whole-word / multi-word match
  v_norm := ' ' || regexp_replace(v_clean, '[^a-z0-9]+', ' ', 'g') || ' ';
  if exists (
    select 1 from public.banned_terms b
    where position(' ' || lower(trim(b.term)) || ' ' in v_norm) > 0
  ) then
    return true;
  end if;

  -- isolate maximal runs of >=2 consecutive single-character tokens (deliberate
  -- letter-spacing) and substring-match within those runs only — a real word is a
  -- multi-char token and never enters a run, so this cannot reintroduce Scunthorpe.
  v_tokens := regexp_split_to_array(trim(v_norm), '\s+');
  foreach tok in array v_tokens loop
    if length(tok) = 1 then
      v_run := v_run || tok;
    else
      if length(v_run) >= 2 then v_runs := v_runs || ' ' || v_run; end if;
      v_run := '';
    end if;
  end loop;
  if length(v_run) >= 2 then v_runs := v_runs || ' ' || v_run; end if;

  if length(trim(v_runs)) = 0 then
    return false;
  end if;
  v_runs := ' ' || trim(v_runs) || ' ';
  return exists (
    select 1 from public.banned_terms b
    where position(lower(trim(b.term)) in v_runs) > 0
  );
end; $$;

-- Content check fires on INSERT and on edits to any text-bearing column, so an
-- author cannot post a clean note and then edit a slur in. Scoped with UPDATE OF so
-- the auto-hide flip (is_hidden/updated_at only) never re-triggers it.
create or replace function public.enforce_field_note_content_safety()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public'
as $$
begin
  if public.text_has_banned_term(new.display_name)
     or public.text_has_banned_term(new.tweak)
     or public.text_has_banned_term(new.note)
     or public.text_has_banned_term(new.claimed_result_note)
     or public.text_has_banned_term(new.evidence_label) then
    raise exception 'content_blocked: that note contains language we do not allow here';
  end if;
  return new;
end; $$;

drop trigger if exists trg_field_note_content_safety on public.field_notes;
create trigger trg_field_note_content_safety
  before insert or update of display_name, tweak, note, claimed_result_note, evidence_label
  on public.field_notes
  for each row execute function public.enforce_field_note_content_safety();

-- the public handle is shown on every note, so guard it on both write paths
create or replace function public.enforce_profile_content_safety()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public'
as $$
begin
  if public.text_has_banned_term(new.display_name) then
    raise exception 'content_blocked: that display name contains language we do not allow here';
  end if;
  return new;
end; $$;

drop trigger if exists trg_profile_content_safety on public.profiles;
create trigger trg_profile_content_safety
  before insert or update of display_name on public.profiles
  for each row execute function public.enforce_profile_content_safety();

-- These functions are reached only through triggers, never called directly by a
-- client. Revoke EXECUTE from the public roles so the surface area stays small.
revoke execute on function public.on_note_report_autohide()          from public, anon, authenticated;
revoke execute on function public.enforce_field_note_rate_limit()    from public, anon, authenticated;
revoke execute on function public.text_has_banned_term(text)         from public, anon, authenticated;
revoke execute on function public.enforce_field_note_content_safety() from public, anon, authenticated;
revoke execute on function public.enforce_profile_content_safety()   from public, anon, authenticated;

comment on index public.note_reports_one_per_reporter is 'One report per account per note: de-dupes the queue and anti-griefs the auto-hide count.';
comment on function public.on_note_report_autohide() is 'Hides a field note once 3 distinct accounts report it, pending admin review. Reversible (admin clears is_hidden).';
comment on function public.enforce_field_note_rate_limit() is 'Caps a single account to 10 field notes per rolling hour.';
comment on table public.banned_terms is 'Admin-managed term blocklist. Seeded out-of-band so the words are never committed to source. No PostgREST access; read only by the SECURITY DEFINER matcher.';
