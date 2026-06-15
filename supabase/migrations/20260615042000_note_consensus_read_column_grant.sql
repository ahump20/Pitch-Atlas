-- note_consensus is a public aggregate view. Keep current client output public,
-- but do not let future view columns become public by default.

revoke select on public.note_consensus from anon, authenticated;

grant select (
  note_id,
  pitch_slug,
  tried_count,
  reported_count,
  worked_count,
  mixed_count,
  no_change_count,
  worse_count,
  consensus
) on public.note_consensus to anon, authenticated;

comment on view public.note_consensus is
  'Invoker-rights consensus over denormalized outcome counts. Client roles can read current aggregate columns only; future/internal columns require an explicit grant. Verdict is NULL below 3 reported outcomes.';
