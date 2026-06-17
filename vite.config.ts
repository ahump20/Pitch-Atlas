import { configDefaults, defineConfig } from 'vitest/config'
import type { Plugin, ResolvedConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import reactSsg from 'vite-plugin-react-ssg'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import { copyFile, writeFile } from 'node:fs/promises'
import { renderSitemapXml } from './src/lib/sitemap'

/*
  Post-prerender artifacts. Runs after vite-plugin-react-ssg's closeBundle (plugin
  order is execution order), once every route HTML file exists:

  - sitemap.xml is generated from the same data arrays the prerender paths come
    from (src/lib/sitemap.ts), so it cannot drift the way the old hand-written
    public/sitemap.xml did. No lastmod — a build date is not a content date.
  - 404.html is copied from the prerendered /404 route (the NotFound view; the
    splat route is listed by hand in react-ssg.config.ts). With the _redirects
    SPA catch-all removed, Cloudflare Pages serves this file with a real 404
    status for unknown paths instead of a 200 app shell.
*/
function postBuildArtifacts(): Plugin {
  let resolved: ResolvedConfig
  return {
    name: 'pitch-atlas-post-build-artifacts',
    apply: 'build',
    configResolved(config) {
      resolved = config
    },
    async closeBundle() {
      if (resolved.build.ssr) return
      const outDir = path.resolve(resolved.root, resolved.build.outDir)
      await writeFile(path.join(outDir, 'sitemap.xml'), renderSitemapXml())
      await copyFile(path.join(outDir, '404', 'index.html'), path.join(outDir, '404.html'))
    },
  }
}

// Static build for Cloudflare Pages. The site is a traditional Vite React SPA;
// vite-plugin-react-ssg (apply: 'build' only, so it never touches dev or tests)
// prerenders a real HTML file per route after the build for SEO and first paint.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    reactSsg(),
    postBuildArtifacts(),
    // Offline support for a LIVE, prerendered site. The live build always wins
    // online (NetworkFirst for navigation), only the immutable hashed bundles are
    // precached, and a new version installs only when the pitcher taps Reload
    // (registerType 'prompt'). That is what keeps a deploy from stranding an
    // installed visitor on a stale build. manifest:false keeps the hand-written
    // public/site.webmanifest; injectRegister:null because main.tsx registers via
    // the React hook (client-only, never touched by the build-time prerender).
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      manifest: false,
      workbox: {
        // Precache ONLY the content-hashed bundles + self-hosted fonts. NEVER the
        // ~78 prerendered route HTML files — that is the stale-build trap.
        globPatterns: ['assets/**/*.{js,css,woff,woff2}'],
        // Keep every subset on disk for runtime unicode-range (accented names in
        // community content still render), but drop the non-Latin weights from
        // the eager first-visit precache — this site's content is Latin-only.
        // `cyrillic` also covers `cyrillic-ext`; `latin` (no -ext) stays cached.
        // Also drop the lazy 3D vendor chunks (~1.1 MB combined): they load on
        // demand only when a pitch's 3D ball mounts, and `_headers` already gives
        // them immutable year-long HTTP caching — no reason to precache them on a
        // first visit a text reader may never spend in a chapter.
        globIgnores: [
          '**/*-{latin-ext,vietnamese,cyrillic}-*.woff2',
          '**/three-core-*.js',
          '**/react-three-*.js',
          '**/three-support-*.js',
        ],
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Pages you've opened read offline; online, the live build always wins.
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pa-pages',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Grip data you've already loaded survives offline, labels intact.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && /supabase\.(co|in)$/.test(url.hostname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pa-supabase-reads',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Grip imagery for opened pages.
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pa-images',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    target: 'es2022',
    sourcemap: false,
    // The only allowed >500 kB chunk is the lazy Three.js vendor core, pinned by
    // src/test/prerender-integrity.test.ts so this global Vite warning stays useful.
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'three-core',
              test: /node_modules[\\/]three[\\/]/,
              priority: 30,
            },
            {
              name: 'react-three',
              test: /node_modules[\\/]@react-three[\\/]/,
              priority: 25,
            },
            {
              name: 'three-support',
              test: /node_modules[\\/](?:camera-controls|maath|meshline|stats-gl|suspend-react|troika-three-text|troika-worker-utils|use-sync-external-store|zustand)[\\/]/,
              priority: 20,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: false,
    restoreMocks: true,
    // jsdom + the 3D imports make the first full-page render pay a heavy one-time
    // transform cost in the parallel suite. Keep the timeout aligned with the
    // current route/form tests instead of failing on cold-start work.
    testTimeout: 60000,
    fileParallelism: false,
    maxWorkers: 1,
    exclude: [...configDefaults.exclude, 'pitch-atlas-softball/**'],
    // Inline react-tweet so Vite transforms it (and no-ops its bundled CSS module
    // imports under css:false); otherwise Node tries to load .module.css as JS.
    server: { deps: { inline: ['react-tweet'] } },
  },
})
