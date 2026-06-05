import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Static build for Cloudflare Pages. No SSR.
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
    // Inline react-tweet so Vite transforms it (and no-ops its bundled CSS module
    // imports under css:false); otherwise Node tries to load .module.css as JS.
    server: { deps: { inline: ['react-tweet'] } },
  },
})
