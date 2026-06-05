import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import reactSsg from 'vite-plugin-react-ssg'

// Static build for Cloudflare Pages. The site is a traditional Vite React SPA;
// vite-plugin-react-ssg (apply: 'build' only, so it never touches dev or tests)
// prerenders a real HTML file per route after the build for SEO and first paint.
export default defineConfig({
  plugins: [react(), tailwindcss(), reactSsg()],
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
