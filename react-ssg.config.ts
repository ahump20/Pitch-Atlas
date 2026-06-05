import { defineReactSsgConfig } from 'vite-plugin-react-ssg'
import { routes } from './src/routes'
import { PITCHES } from './src/data/pitches'
import { CRAFTSMEN } from './src/data/craftsmen'
import { LOST_PITCHES } from './src/data/lost-pitches'

/*
  Build-time prerender targets. The plugin discovers the static routes (/, /craftsmen,
  /sources, 404) from `routes`; the dynamic pitch and craftsman pages need their
  concrete paths listed here so each specimen and each craftsman gets its own
  prerendered HTML file. Adding a pitch or a craftsman to the data automatically
  adds its prerender path, so this list never goes stale.
*/
export default defineReactSsgConfig({
  history: 'browser',
  origin: 'https://pitch-atlas.com',
  routes,
  paths: [
    ...PITCHES.map((p) => `/pitch/${p.display.slug}`),
    ...CRAFTSMEN.map((c) => `/craftsmen/${c.slug}`),
    ...LOST_PITCHES.map((p) => `/lost-pitches/${p.slug}`),
  ],
})
