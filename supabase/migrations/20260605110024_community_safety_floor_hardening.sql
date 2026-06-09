-- Pitch Atlas — community safety floor hardening (2026-06-05)
-- Hardens the banned-term matcher against leetspeak / zero-width / spaced-letter
-- evasion (still whole-word, still Scunthorpe-safe, still no regex-injection),
-- and stops overloading SQLSTATE 23514 (check_violation) for application-policy
-- rejections — the client keys on the message prefix, and 23514 collided with the
-- real weak_tier_requires_note CHECK in the logs. Functions only; triggers already
-- reference these by name. Additive, reversible.

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
  v_merged  text := '';
  v_run     text := '';
  tok       text;
begin
  if p_text is null or length(trim(p_text)) = 0 then
    return false;
  end if;

  -- 1) strip control + common zero-width characters (homoglyph/zero-width evasion)
  v_clean := regexp_replace(p_text, '[[:cntrl:]]', '', 'g');
  v_clean := replace(replace(replace(replace(replace(v_clean,
               chr(8203), ''), chr(8204), ''), chr(8205), ''), chr(8288), ''), chr(65279), '');

  -- 2) lowercase + fold common leetspeak so evasion spellings survive as letters
  v_clean := lower(v_clean);
  v_clean := translate(v_clean, '0134578@$!', 'oieastbasi');

  -- 3) collapse every run of non-alphanumerics to a single space; pad the ends so a
  --    term matches only as a whole space-delimited token (single- or multi-word).
  v_norm := ' ' || regexp_replace(v_clean, '[^a-z0-9]+', ' ', 'g') || ' ';

  if exists (
    select 1 from public.banned_terms b
    where position(' ' || lower(trim(b.term)) || ' ' in v_norm) > 0
  ) then
    return true;
  end if;

  -- 4) collapse runs of SINGLE-character tokens ("f u c k" -> "fuck") and re-check.
  --    Only consecutive single-char tokens fuse, so real words ("grape",
  --    "therapist") are never joined — the Scunthorpe problem stays solved.
  v_tokens := regexp_split_to_array(trim(v_norm), '\s+');
  foreach tok in array v_tokens loop
    if length(tok) = 1 then
      v_run := v_run || tok;
    else
      if length(v_run) > 0 then v_merged := v_merged || ' ' || v_run; v_run := ''; end if;
      v_merged := v_merged || ' ' || tok;
    end if;
  end loop;
  if length(v_run) > 0 then v_merged := v_merged || ' ' || v_run; end if;
  v_merged := ' ' || trim(v_merged) || ' ';

  return exists (
    select 1 from public.banned_terms b
    where position(' ' || lower(trim(b.term)) || ' ' in v_merged) > 0
  );
end; $$;

-- Drop the overloaded check_violation errcode: default raise_exception (P0001).
-- The client matches on the message prefix, so the contract is unchanged.
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

-- CREATE OR REPLACE preserves grants, but re-assert the lockdown to be safe.
revoke execute on function public.text_has_banned_term(text)         from public, anon, authenticated;
revoke execute on function public.enforce_field_note_rate_limit()    from public, anon, authenticated;
revoke execute on function public.enforce_field_note_content_safety() from public, anon, authenticated;
revoke execute on function public.enforce_profile_content_safety()   from public, anon, authenticated;
