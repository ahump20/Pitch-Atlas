import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const outputDirectory = process.env.PITCH_ATLAS_ISLAND_OUTPUT
if (!outputDirectory) throw new Error('PITCH_ATLAS_ISLAND_OUTPUT is required')

export default defineConfig({
  publicDir: false,
  build: {
    outDir: outputDirectory,
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/island-learning/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    sourcemap: true,
    minify: false,
  },
})
