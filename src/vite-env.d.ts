/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  /** Supabase project URL. Public. Overrides the baked default at build time. */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase publishable (anon) key. Public by design — RLS is the boundary. */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
