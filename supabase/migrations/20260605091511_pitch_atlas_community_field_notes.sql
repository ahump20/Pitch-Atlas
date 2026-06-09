-- PITCH ATLAS — Community "Field Notes" schema.
-- Maps onto the app's existing provenance + Field Notes vocabulary
-- (src/data/types.ts ClaimConfidence, src/data/field-notes.ts FieldNote / RANK_WEIGHTS).
-- Doctrine: "Sourced, not corrected" (weak tiers must carry a note), evidence-ranked
-- (not raw popularity), anonymous participation with claim-later, one-action-per-account.

-- ===== generic helper (plpgsql body not schema-validated at create time) =====
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ===== pitches lookup (FK target; seeded with the real specimen slugs) =====
create table public.pitches (
  slug text primary key,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ===== profiles (one per auth user, incl. anonymous) =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 2 and 40),
  is_claimed boolean not null default false,
  is_admin boolean not null default false,
  contribution_score int not null default 0,
  notes_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- is_admin() references profiles, so define it after the table exists.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ===== field_notes (the community submission — "I throw it like this") =====
create table public.field_notes (
  id uuid primary key default gen_random_uuid(),
  pitch_slug text not null references public.pitches(slug),
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  tweak text not null check (char_length(tweak) between 1 and 160),
  player_level text not null check (player_level in ('youth','high-school','college-plus')),
  arm_slot text not null check (arm_slot in ('over-the-top','three-quarter','sidearm','submarine')),
  velocity_band text check (velocity_band in ('under-60','60-69','70-79','80-89','90-plus')),
  intent text not null check (intent in ('more-movement','less-movement','added-velocity','reduced-velocity','better-command','deception','reduce-stress','other')),
  claimed_result_kind text not null check (claimed_result_kind in ('more-movement','better-command','velocity-gain','reduced-discomfort','inconsistent','worked-in-bullpen','worked-in-game','no-noticeable-change')),
  claimed_result_note text check (claimed_result_note is null or char_length(claimed_result_note) <= 200),
  sample_size int check (sample_size is null or (sample_size >= 0 and sample_size <= 100000)),
  evidence_url text check (evidence_url is null or char_length(evidence_url) <= 512),
  evidence_label text check (evidence_label is null or char_length(evidence_label) <= 80),
  source_tier text not null default 'community-firsthand'
    check (source_tier in ('coach-observed','reputable-analysis','community-firsthand','secondhand-attributed','unverified')),
  note text check (note is null or char_length(note) <= 200),
  visibility text not null default 'approved'
    check (visibility in ('pending','approved','approved-youth-safe','rejected')),
  adoption_count int not null default 0,
  helpful_count int not null default 0,
  base_rank numeric not null default 0,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Sourced, not corrected: the two weakest tiers MUST carry an explanatory note.
  constraint weak_tier_requires_note check (
    source_tier not in ('secondhand-attributed','unverified')
    or (note is not null and char_length(btrim(note)) > 0)
  )
);
create index field_notes_pitch_idx on public.field_notes (pitch_slug, visibility, is_hidden);
create index field_notes_rank_idx  on public.field_notes (pitch_slug, base_rank desc);
create index field_notes_author_idx on public.field_notes (author_id);

-- ===== note_tries ("Tried This" / adoption — one per account) =====
create table public.note_tries (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.field_notes(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  outcome text check (outcome is null or char_length(outcome) <= 200),
  created_at timestamptz not null default now(),
  unique (note_id, user_id)
);
create index note_tries_note_idx on public.note_tries (note_id);

-- ===== note_helpful ("useful" — one per account) =====
create table public.note_helpful (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.field_notes(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (note_id, user_id)
);
create index note_helpful_note_idx on public.note_helpful (note_id);

-- ===== note_reports (moderation floor) =====
create table public.note_reports (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.field_notes(id) on delete cascade,
  reporter_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  reason text check (reason is null or char_length(reason) <= 300),
  status text not null default 'open' check (status in ('open','reviewed','actioned','dismissed')),
  created_at timestamptz not null default now()
);

-- ===== rank model (RANK_WEIGHTS: provenance .35, adoption .20, usefulness .20,
-- community-confidence .10; contextMatch .15 stays client-side per the design) =====
create or replace function public.note_base_rank(
  p_source_tier text, p_has_evidence boolean, p_adoption int, p_helpful int, p_sample int
) returns numeric language sql immutable as $$
  select round((
      0.35 * least(1.0, (case p_source_tier
            when 'coach-observed' then 0.80
            when 'reputable-analysis' then 0.70
            when 'community-firsthand' then 0.50
            when 'secondhand-attributed' then 0.30
            when 'unverified' then 0.10
            else 0.40 end) + (case when p_has_evidence then 0.15 else 0.0 end))
    + 0.20 * least(1.0, p_adoption::numeric / 10.0)
    + 0.20 * least(1.0, p_helpful::numeric / 10.0)
    + 0.10 * least(1.0, coalesce(p_sample, 0)::numeric / 20.0)
  )::numeric, 4);
$$;

create or replace function public.refresh_author_rollup(p_author uuid)
returns void language plpgsql security definer set search_path = public as $$
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
end; $$;

create or replace function public.on_engagement_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_note uuid; v_author uuid; v_adopt int; v_help int;
begin
  v_note := coalesce(new.note_id, old.note_id);
  select author_id into v_author from public.field_notes where id = v_note;
  if v_author is null then return coalesce(new, old); end if;
  select count(*) into v_adopt from public.note_tries  where note_id = v_note;
  select count(*) into v_help  from public.note_helpful where note_id = v_note;
  update public.field_notes f set
    adoption_count = v_adopt,
    helpful_count  = v_help,
    base_rank = public.note_base_rank(f.source_tier, f.evidence_url is not null, v_adopt, v_help, f.sample_size),
    updated_at = now()
  where f.id = v_note;
  perform public.refresh_author_rollup(v_author);
  return coalesce(new, old);
end; $$;

create trigger trg_tries_change   after insert or delete on public.note_tries
  for each row execute function public.on_engagement_change();
create trigger trg_helpful_change after insert or delete on public.note_helpful
  for each row execute function public.on_engagement_change();

-- field_notes: compute base_rank on write; roll up author after write
create or replace function public.on_field_note_biu()
returns trigger language plpgsql as $$
begin
  new.base_rank := public.note_base_rank(new.source_tier, new.evidence_url is not null,
                                          new.adoption_count, new.helpful_count, new.sample_size);
  new.updated_at := now();
  return new;
end; $$;
create trigger trg_field_note_biu before insert or update on public.field_notes
  for each row execute function public.on_field_note_biu();

create or replace function public.on_field_note_after()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.refresh_author_rollup(coalesce(new.author_id, old.author_id));
  return coalesce(new, old);
end; $$;
create trigger trg_field_note_after after insert or delete on public.field_notes
  for each row execute function public.on_field_note_after();

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ===== auth.users -> profiles sync (anonymous + claim-later) =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin
  insert into public.profiles (id, is_claimed)
  values (new.id, coalesce(new.is_anonymous, false) = false)
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_user_claim()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin
  update public.profiles set
    is_claimed = (coalesce(new.is_anonymous, false) = false) or (new.email is not null),
    updated_at = now()
  where id = new.id;
  return new;
end; $$;
create trigger on_auth_user_updated after update on auth.users
  for each row execute function public.handle_user_claim();

-- ===== RLS =====
alter table public.pitches      enable row level security;
alter table public.profiles     enable row level security;
alter table public.field_notes  enable row level security;
alter table public.note_tries   enable row level security;
alter table public.note_helpful enable row level security;
alter table public.note_reports enable row level security;

create policy pitches_read on public.pitches for select to anon, authenticated using (true);

create policy profiles_read on public.profiles for select to anon, authenticated using (true);
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy field_notes_read on public.field_notes for select to anon, authenticated
  using ((is_hidden = false and visibility in ('approved','approved-youth-safe'))
         or author_id = auth.uid() or public.is_admin());
create policy field_notes_insert on public.field_notes for insert to authenticated
  with check (author_id = auth.uid());
create policy field_notes_update_own on public.field_notes for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy field_notes_admin_all on public.field_notes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy field_notes_delete_own on public.field_notes for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

create policy tries_read_own on public.note_tries for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy tries_insert on public.note_tries for insert to authenticated
  with check (user_id = auth.uid()
              and not exists (select 1 from public.field_notes f where f.id = note_id and f.author_id = auth.uid()));
create policy tries_delete_own on public.note_tries for delete to authenticated
  using (user_id = auth.uid());

create policy helpful_read_own on public.note_helpful for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy helpful_insert on public.note_helpful for insert to authenticated
  with check (user_id = auth.uid()
              and not exists (select 1 from public.field_notes f where f.id = note_id and f.author_id = auth.uid()));
create policy helpful_delete_own on public.note_helpful for delete to authenticated
  using (user_id = auth.uid());

create policy reports_insert on public.note_reports for insert to authenticated
  with check (reporter_id = auth.uid());
create policy reports_admin_read on public.note_reports for select to authenticated
  using (public.is_admin());
create policy reports_admin_update on public.note_reports for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ===== grants: writes restricted to safe columns; counts/rank/score system-managed =====
revoke all on public.profiles     from anon, authenticated;
revoke all on public.field_notes  from anon, authenticated;
revoke all on public.note_tries   from anon, authenticated;
revoke all on public.note_helpful from anon, authenticated;
revoke all on public.note_reports from anon, authenticated;
revoke all on public.pitches      from anon, authenticated;

grant select on public.pitches to anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

grant select on public.field_notes to anon, authenticated;
grant insert (pitch_slug, display_name, tweak, player_level, arm_slot, velocity_band, intent,
              claimed_result_kind, claimed_result_note, sample_size, evidence_url, evidence_label,
              source_tier, note) on public.field_notes to authenticated;
grant update (tweak, claimed_result_note, sample_size, evidence_url, evidence_label, source_tier, note)
              on public.field_notes to authenticated;
grant delete on public.field_notes to authenticated;

grant select on public.note_tries to authenticated;
grant insert (note_id, outcome) on public.note_tries to authenticated;
grant delete on public.note_tries to authenticated;

grant select on public.note_helpful to authenticated;
grant insert (note_id) on public.note_helpful to authenticated;
grant delete on public.note_helpful to authenticated;

grant insert (note_id, reason) on public.note_reports to authenticated;
grant select, update on public.note_reports to authenticated; -- gated to admins by RLS
