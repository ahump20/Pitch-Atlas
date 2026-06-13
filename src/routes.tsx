import type { RouteObject } from 'react-router-dom'
import { RootLayout } from './components/layout/RootLayout'

/*
  The route map. One layout (masthead + footer + grain) wraps every page and
  stays eager — the shell never waits on a chunk. Every page behind it loads
  through the data router's route-level `lazy`, so each chapter ships as its
  own file instead of one 1.4 MB bundle. The build-time prerender still writes
  real HTML: the static handler awaits each matched route's lazy module before
  renderToString, so no published page is a fallback shell. The client entry
  (main.tsx) holds the prerendered paint until the router has the first
  chunk in hand.
*/
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, lazy: () => import('./pages/AtlasHome').then((m) => ({ Component: m.AtlasHome })) },
      { path: 'pitch/:slug', lazy: () => import('./pages/PitchChapter').then((m) => ({ Component: m.PitchChapter })) },
      { path: 'repertoire', lazy: () => import('./pages/RepertoirePage').then((m) => ({ Component: m.RepertoirePage })) },
      { path: 'repertoire/:id', lazy: () => import('./pages/RepertoireChapter').then((m) => ({ Component: m.RepertoireChapter })) },
      { path: 'craftsmen', lazy: () => import('./pages/CraftsmenHall').then((m) => ({ Component: m.CraftsmenHall })) },
      { path: 'craftsmen/:slug', lazy: () => import('./pages/CraftsmanChapter').then((m) => ({ Component: m.CraftsmanChapter })) },
      { path: 'lost-pitches', lazy: () => import('./pages/LostPitchesHall').then((m) => ({ Component: m.LostPitchesHall })) },
      { path: 'lost-pitches/:slug', lazy: () => import('./pages/LostPitchChapter').then((m) => ({ Component: m.LostPitchChapter })) },
      { path: 'learn', lazy: () => import('./pages/KnowledgeHub').then((m) => ({ Component: m.KnowledgeHub })) },
      { path: 'learn/:slug', lazy: () => import('./pages/KnowledgeChapter').then((m) => ({ Component: m.KnowledgeChapter })) },
      { path: 'sources', lazy: () => import('./pages/SourcesPage').then((m) => ({ Component: m.SourcesPage })) },
      { path: 'sandbox', lazy: () => import('./pages/SandboxPage').then((m) => ({ Component: m.SandboxPage })) },
      { path: 'movement-map', lazy: () => import('./pages/MovementMapPage').then((m) => ({ Component: m.MovementMapPage })) },
      { path: 'compare', lazy: () => import('./pages/ComparePage').then((m) => ({ Component: m.ComparePage })) },
      { path: 'grips', lazy: () => import('./pages/GripsPage').then((m) => ({ Component: m.GripsPage })) },
      { path: 'softball', lazy: () => import('./pages/SoftballHub').then((m) => ({ Component: m.SoftballHub })) },
      { path: 'softball/fastpitch', lazy: () => import('./pages/SoftballFastpitchPage').then((m) => ({ Component: m.SoftballFastpitchPage })) },
      { path: 'softball/slowpitch', lazy: () => import('./pages/SoftballSlowpitchPage').then((m) => ({ Component: m.SoftballSlowpitchPage })) },
      { path: 'softball/pitch/:slug', lazy: () => import('./pages/SoftballPitchChapter').then((m) => ({ Component: m.SoftballPitchChapter })) },
      { path: 'softball/craftsmen/:slug', lazy: () => import('./pages/SoftballCraftsmanChapter').then((m) => ({ Component: m.SoftballCraftsmanChapter })) },
      { path: 'about', lazy: () => import('./pages/AboutPage').then((m) => ({ Component: m.AboutPage })) },
      { path: 'privacy', lazy: () => import('./pages/PrivacyPage').then((m) => ({ Component: m.PrivacyPage })) },
      { path: 'support', lazy: () => import('./pages/SupportPage').then((m) => ({ Component: m.SupportPage })) },
      { path: '*', lazy: () => import('./pages/NotFound').then((m) => ({ Component: m.NotFound })) },
    ],
  },
]
