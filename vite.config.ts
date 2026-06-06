import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import reactSsg from 'vite-plugin-react-ssg'
import { VitePWA } from 'vite-plugin-pwa'

// Static build for Cloudflare Pages. The site is a traditional Vite React SPA;
// vite-plugin-react-ssg (apply: 'build' only, so it never touches dev or tests)
// prerenders a real HTML file per route after the build for SEO and first paint.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    reactSsg(),
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
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: false,
    restoreMocks: true,
    // jsdom + the 3D imports make the first full-page render pay a heavy one-time
    // transform cost in the parallel suite; 5s is too tight for that cold start
    // (the same test passes in ~4s warm). Give it realistic headroom.
    testTimeout: 20000,
    // Inline react-tweet so Vite transforms it (and no-ops its bundled CSS module
    // imports under css:false); otherwise Node tries to load .module.css as JS.
    server: { deps: { inline: ['react-tweet'] } },
  },
})
