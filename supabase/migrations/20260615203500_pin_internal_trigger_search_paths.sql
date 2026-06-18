-- Keep internal SECURITY DEFINER helpers off the mutable public namespace.
-- These functions are trigger/internal surfaces, not public RPCs; behavior stays
-- the same while every table/function reference remains schema-qualified.

create or replace function public.refresh_author_rollup(p_author uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_author is null then return; end if;
  update public.profiles p set
    notes_count = (select count(*) from public.field_notes where author_id = p_author and is_hidden = false),
    contribution_score = (
      select coalesce(sum(adoption_count + helpful_count), 0) + count(*)
      from public.field_notes where author_id = p_author and is_hidden = false
    ),
    updated_at = now()
  where p.id = p_author;
end;
$$;

create or replace function public.on_engagement_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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
end;
$$;

create or replace function public.on_field_note_after()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.refresh_author_rollup(coalesce(new.author_id, old.author_id));
  return coalesce(new, old);
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, is_claimed)
  values (new.id, coalesce(new.is_anonymous, false) = false)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.handle_user_claim()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set
    is_claimed = (coalesce(new.is_anonymous, false) = false) or (new.email is not null),
    updated_at = now()
  where id = new.id;
  return new;
end;
$$;

create or replace function public.on_note_report_autohide()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_distinct int;
  v_author uuid;
  v_threshold constant int := 3;
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
end;
$$;

create or replace function public.text_has_banned_term(p_text text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
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

  v_clean := regexp_replace(p_text, '[[:cntrl:]]', '', 'g');
  v_clean := replace(replace(replace(replace(replace(v_clean,
               chr(8203), ''), chr(8204), ''), chr(8205), ''), chr(8288), ''), chr(65279), '');

  v_clean := lower(v_clean);
  v_clean := translate(v_clean, '0134578@$!', 'oieastbasi');

  v_norm := ' ' || regexp_replace(v_clean, '[^a-z0-9]+', ' ', 'g') || ' ';
  if exists (
    select 1 from public.banned_terms b
    where position(' ' || lower(trim(b.term)) || ' ' in v_norm) > 0
  ) then
    return true;
  end if;

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
end;
$$;

create or replace function public.enforce_field_note_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
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
end;
$$;

create or replace function public.enforce_field_note_content_safety()
returns trigger
language plpgsql
security definer
set search_path = ''
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
end;
$$;

create or replace function public.enforce_profile_content_safety()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.text_has_banned_term(new.display_name) then
    raise exception 'content_blocked: that display name contains language we do not allow here';
  end if;
  return new;
end;
$$;

create or replace function public.enforce_discussion_depth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent_parent uuid;
  v_parent_topic  text;
begin
  if new.parent_id is not null then
    select parent_id, topic_key into v_parent_parent, v_parent_topic
    from public.discussion_posts where id = new.parent_id;
    if v_parent_topic is null then
      raise exception 'invalid_parent: that comment no longer exists';
    end if;
    if v_parent_parent is not null then
      raise exception 'too_deep: replies cannot be replied to';
    end if;
    new.topic_key := v_parent_topic;
  end if;
  return new;
end;
$$;

create or replace function public.enforce_discussion_content_safety()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.text_has_banned_term(new.body) or public.text_has_banned_term(new.display_name) then
    raise exception 'content_blocked: that post contains language we do not allow here';
  end if;
  return new;
end;
$$;

create or replace function public.enforce_discussion_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_recent int;
begin
  select count(*) into v_recent from public.discussion_posts
  where author_id = new.author_id and created_at > now() - interval '1 hour';
  if v_recent >= 15 then
    raise exception 'rate_limit: too many posts in a short time — please slow down and try again later';
  end if;
  return new;
end;
$$;

create or replace function public.enforce_discussion_media_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_recent int;
begin
  if not exists (select 1 from public.discussion_media_terms where user_id = new.owner_id) then
    raise exception 'media_blocked: please accept the upload terms before posting media';
  end if;
  if new.mime_type not in ('image/jpeg','image/png','image/webp','image/gif',
                           'video/mp4','video/webm','video/quicktime') then
    raise exception 'media_blocked: that file type is not allowed here';
  end if;
  if new.kind = 'image' and new.mime_type not like 'image/%' then
    raise exception 'media_blocked: the file type does not match an image';
  end if;
  if new.kind = 'video' and new.mime_type not like 'video/%' then
    raise exception 'media_blocked: the file type does not match a video';
  end if;
  if new.kind = 'image' and new.byte_size > 8 * 1024 * 1024 then
    raise exception 'media_blocked: images must be under 8 MB';
  end if;
  if new.kind = 'video' and new.byte_size > 50 * 1024 * 1024 then
    raise exception 'media_blocked: videos must be under 50 MB';
  end if;
  select count(*) into v_recent from public.discussion_media
  where owner_id = new.owner_id and created_at > now() - interval '1 hour';
  if v_recent >= 20 then
    raise exception 'rate_limit: too many uploads in a short time — please slow down';
  end if;
  return new;
end;
$$;

create or replace function public.on_discussion_report()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_distinct int;
begin
  if new.post_id is not null then
    select count(distinct reporter_id) into v_distinct
    from public.discussion_reports where post_id = new.post_id and status = 'open';
    update public.discussion_posts set report_count = v_distinct where id = new.post_id;
    if v_distinct >= 3 then
      update public.discussion_posts set is_hidden = true, updated_at = now()
      where id = new.post_id and is_hidden = false;
    end if;
  else
    select count(distinct reporter_id) into v_distinct
    from public.discussion_reports where media_id = new.media_id and status = 'open';
    update public.discussion_media set report_count = v_distinct where id = new.media_id;
    if v_distinct >= 2 then
      update public.discussion_media set is_hidden = true where id = new.media_id and is_hidden = false;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.enforce_discussion_block_edges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent_author uuid;
begin
  if new.parent_id is not null then
    select author_id into v_parent_author
    from public.discussion_posts
    where id = new.parent_id;

    if private.blocked_between(new.author_id, v_parent_author) then
      raise exception 'blocked_interaction: that conversation is not available';
    end if;
  end if;

  return new;
end;
$$;

do $$
begin
  if to_regclass('public.thread_participants') is not null then
    execute $fn$
      create or replace function public.add_thread_creator_participant()
      returns trigger
      language plpgsql
      security definer
      set search_path = ''
      as $body$
      begin
        insert into public.thread_participants(thread_id, user_id)
        values (new.id, new.created_by)
        on conflict do nothing;
        return new;
      end;
      $body$;
    $fn$;

    execute 'revoke execute on function public.add_thread_creator_participant() from public, anon, authenticated';
  end if;
end
$$;

revoke execute on function public.refresh_author_rollup(uuid) from public, anon, authenticated;
revoke execute on function public.on_engagement_change() from public, anon, authenticated;
revoke execute on function public.on_field_note_after() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_claim() from public, anon, authenticated;
revoke execute on function public.on_note_report_autohide() from public, anon, authenticated;
revoke execute on function public.text_has_banned_term(text) from public, anon, authenticated;
revoke execute on function public.enforce_field_note_rate_limit() from public, anon, authenticated;
revoke execute on function public.enforce_field_note_content_safety() from public, anon, authenticated;
revoke execute on function public.enforce_profile_content_safety() from public, anon, authenticated;
revoke execute on function public.enforce_discussion_depth() from public, anon, authenticated;
revoke execute on function public.enforce_discussion_content_safety() from public, anon, authenticated;
revoke execute on function public.enforce_discussion_rate_limit() from public, anon, authenticated;
revoke execute on function public.enforce_discussion_media_limits() from public, anon, authenticated;
revoke execute on function public.on_discussion_report() from public, anon, authenticated;
revoke execute on function public.enforce_discussion_block_edges() from public, anon, authenticated;

comment on function public.refresh_author_rollup(uuid) is
  'Internal rollup helper. SECURITY DEFINER with empty search_path and explicit public references.';
comment on function public.text_has_banned_term(text) is
  'Internal content-safety matcher. SECURITY DEFINER with empty search_path and explicit public references.';
