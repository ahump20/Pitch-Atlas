import { defineReactSsgConfig } from 'vite-plugin-react-ssg'
import { routes } from './src/routes'
import { PITCHES } from './src/data/pitches'
import { CRAFTSMEN } from './src/data/craftsmen'
import { LOST_PITCHES } from './src/data/lost-pitches'
import { BASIC_REPERTOIRE } from './src/data/repertoire'
import { WINGS } from './src/data/knowledge'
import { SOFTBALL_PITCHES, SOFTBALL_CRAFTSMEN } from './src/data/softball'

/*
  Build-time prerender targets. The plugin discovers the static routes (/, /repertoire,
  /craftsmen, /learn, /sources, 404) from `routes`; the dynamic pitch, basic-pitch,
  craftsman, lost-pitch, and knowledge-wing pages need their concrete paths listed here
  so each gets its own prerendered HTML file. The basic pages cover only repertoire
  entries without a filed specimen (filed ones live at /pitch/<slug> already). Adding an
  entry to the data automatically adds its prerender path, so this list never goes stale.
*/
export default defineReactSsgConfig({
  history: 'browser',
  origin: 'https://pitch-atlas.com',
  routes,
  paths: [
    '/movement-map',
    ...PITCHES.map((p) => `/pitch/${p.display.slug}`),
    ...BASIC_REPERTOIRE.map((e) => `/repertoire/${e.id}`),
    ...CRAFTSMEN.map((c) => `/craftsmen/${c.slug}`),
    ...LOST_PITCHES.map((p) => `/lost-pitches/${p.slug}`),
    ...WINGS.map((w) => `/learn/${w.slug}`),
    ...SOFTBALL_PITCHES.map((p) => `/softball/pitch/${p.slug}`),
    ...SOFTBALL_CRAFTSMEN.map((c) => `/softball/craftsmen/${c.slug}`),
  ],
})
