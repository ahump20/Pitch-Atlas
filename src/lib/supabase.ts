import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/*
  The Supabase client. Pitch Atlas is a static site, so the browser talks
  straight to Supabase — there is no server in between. The publishable key is
  public by design (it ships inside the built bundle, which anyone can read);
  Row-Level Security on the database, not this key, is what keeps data safe.

  Env vars override the baked public defaults so a preview build or a fork can
  point at a different project without touching code.
*/
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://cloeoulvrrfcbitrjpso.supabase.co'

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_jMuBalGcB-qEBIVAYegthg_0Rr4pUgT'

/** Field Notes only render when a project is wired. With the baked defaults this is always true. */
export const COMMUNITY_ENABLED = Boolean(SUPABASE_URL) && Boolean(SUPABASE_PUBLISHABLE_KEY)

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})
