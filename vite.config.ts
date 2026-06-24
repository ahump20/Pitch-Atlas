import { configDefaults, defineConfig } from 'vitest/config'
import type { Plugin, ResolvedConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import reactSsg from 'vite-plugin-react-ssg'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import { copyFile, writeFile, readFile, readdir } from 'node:fs/promises'
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

      // Strip the 3D-vendor modulepreload hints from every prerendered page.
      // Rolldown bakes <link rel="modulepreload"> for the three-core / react-three
      // chunks into the entry <head>, and the SSG prerender copies that head onto
      // all ~106 routes — so text routes (sources, about, privacy, learn) eagerly
      // fetch ~1.1 MB of 3D vendor they never execute. Those chunks are lazy
      // (BallScene's dynamic import), gated by WebGL + in-view, already dropped from
      // the SW precache, and HTTP-cached a year by _headers; on the ball routes they
      // now load on demand a beat later, with no effect on first paint (the ball is
      // never the LCP). Net: text routes stop downloading the 3D bundle. rolldown-
      // runtime and per-route chunk preloads are untouched.
      const stripThreePreload = (html: string) =>
        html.replace(/<link\b[^>]*\bmodulepreload\b[^>]*>/g, (tag) =>
          /(?:three-core|react-three|three-support)-[\w-]*\.js/.test(tag) ? '' : tag,
        )
      const walkHtml = async (dir: string): Promise<string[]> => {
        const entries = await readdir(dir, { withFileTypes: true })
        const nested = await Promise.all(
          entries.map((e) => {
            const full = path.join(dir, e.name)
            if (e.isDirectory()) return walkHtml(full)
            return Promise.resolve(e.name.endsWith('.html') ? [full] : [])
          }),
        )
        return nested.flat()
      }
      for (const file of await walkHtml(outDir)) {
        const html = await readFile(file, 'utf8')
        const next = stripThreePreload(html)
        if (next !== html) await writeFile(file, next)
      }
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
    // The dominant cost is jsdom environment creation (~31s across the suite), paid
    // once per file — so it parallelizes cleanly across workers. The 3D/R3F code does
    // NOT load in tests: BallStage falls back to the 2D seam schematic when jsdom
    // reports no WebGL, so the lazy BallScene (the sole importer of three/@react-three)
    // is never imported. Run files in parallel with headroom on the 8-core machine;
    // the generous timeout stays as a safety net for async-heavy route/form tests.
    testTimeout: 60000,
    fileParallelism: true,
    maxWorkers: 4,
    exclude: [...configDefaults.exclude, 'pitch-atlas-softball/**'],
    // Inline react-tweet so Vite transforms it (and no-ops its bundled CSS module
    // imports under css:false); otherwise Node tries to load .module.css as JS.
    server: { deps: { inline: ['react-tweet'] } },
  },
})
