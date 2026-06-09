-- Fix spaced-letter evasion: substring-match banned terms ONLY within deliberately
-- spaced single-character runs (e.g. spaced single letters fused back together), never
-- inside real multi-character words, so "grape"/"therapist" stay false-positive-free.
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

  -- 1) strip control + common zero-width characters
  v_clean := regexp_replace(p_text, '[[:cntrl:]]', '', 'g');
  v_clean := replace(replace(replace(replace(replace(v_clean,
               chr(8203), ''), chr(8204), ''), chr(8205), ''), chr(8288), ''), chr(65279), '');

  -- 2) lowercase + fold common leetspeak (evasion spellings survive as letters)
  v_clean := lower(v_clean);
  v_clean := translate(v_clean, '0134578@$!', 'oieastbasi');

  -- 3) normalize to space-delimited tokens; whole-word / multi-word match
  v_norm := ' ' || regexp_replace(v_clean, '[^a-z0-9]+', ' ', 'g') || ' ';
  if exists (
    select 1 from public.banned_terms b
    where position(' ' || lower(trim(b.term)) || ' ' in v_norm) > 0
  ) then
    return true;
  end if;

  -- 4) isolate maximal runs of >=2 consecutive single-character tokens (deliberate
  --    letter-spacing) and SUBSTRING-match within those runs only. A real word is a
  --    multi-char token and never enters a run, so this cannot reintroduce Scunthorpe.
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

revoke execute on function public.text_has_banned_term(text) from public, anon, authenticated;
