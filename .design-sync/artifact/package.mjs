// Assemble the page's component files from the verified design-sync build:
// compressed bundle and React 19 libraries, the stylesheet, one preview per
// component (the verified preview module inlined, cells in source order), and the
// types index. Guides and per-component .d.ts come from guides.py.
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
// Run from anywhere: paths resolve from this file (.design-sync/artifact/ in the repo).
const REPO_ROOT = decodeURIComponent(new URL('../..', import.meta.url).pathname).replace(/\/$/, '')
const require = createRequire(`${REPO_ROOT}/.ds-sync/package.json`)
const esbuild = require('esbuild')
const REPO = REPO_ROOT
const DS = `${REPO}/ds-bundle`
const OUT = process.argv[2]                         // …/ds-artifact/project
const groups = JSON.parse(readFileSync(join(OUT, '..', 'groups.json'), 'utf8'))
const bad = (label, s) => {
  for (const [re, what] of [[/<\/script/i, '</script'], [/<!--/, '<!--'], [/\beval\s*\(/, 'eval('], [/new\s+Function\s*\(/, 'new Function(']]) {
    if (re.test(s)) throw new Error(`${label} contains ${what}`)
  }
}
mkdirSync(join(OUT, 'components/lib'), { recursive: true })

// bundle.js: the verified build, compressed; the @ds-bundle header stays line 1.
const src = readFileSync(`${DS}/_ds_bundle.js`, 'utf8')
const nl = src.indexOf('\n')
const header = src.slice(0, nl)
if (!header.startsWith('/* @ds-bundle:')) throw new Error('no bundle header')
const min = (code) => esbuild.transformSync(code, { minify: true, keepNames: true, target: 'es2020', charset: 'utf8', legalComments: 'none' }).code
// The driver stubs 'scheduler' with a throw, on the theory that a direct import
// means react-dom leaked into the build. Here it does not: @react-three/fiber's
// renderer imports scheduler itself, exactly as it does on the site, where Vite
// hands it the one copy react-dom uses. The stub fires only once WebGL is present
// and the 3D scene loads, so every capture without WebGL missed it. Point it at
// the instance react.development.js exposes; without that lib it still throws,
// and BallStage's boundary falls back to the schematic.
const STUB = /"shim:scheduler-shim"\(\) \{\s*init_define_import_meta_env\(\);\s*throw new Error\("\[SCHEDULER_MISSING\][^"]*"\);\s*\}/g
const stubs = src.match(STUB) || []
if (stubs.length !== 1) throw new Error(`expected one scheduler stub in the bundle, found ${stubs.length}`)
const patched = src.replace(STUB, '"shim:scheduler-shim"(exports, module) { module.exports = window.__paScheduler; if (!module.exports) throw new Error("[pa] scheduler missing: load components/lib/react.development.js before bundle.js"); }')
const bundle = header + '\n' + min(patched.slice(nl + 1))
bad('bundle.js', bundle.slice(nl + 1))
writeFileSync(join(OUT, 'components/bundle.js'), bundle)

// React + ReactDOM (with the client entry) and the scheduler ReactDOM runs on,
// the repo's own versions, as one development IIFE. The driver builds bundle.js
// with NODE_ENV=development, and @react-three/fiber picks its reconciler from
// that flag: the development reconciler reads React internals (actQueue and
// kin) that only React's development build defines. Pairing it with production
// React throws the moment the 3D scene mounts, which no capture without WebGL
// sees. Measured lighter production React first; it breaks BallStage, so no.
const reactVer = require(`${REPO}/node_modules/react/package.json`).version
const noClobber = ';window.React=window.React||window.__dsReact;window.ReactDOM=window.ReactDOM||window.__dsReactDOM;window.__paScheduler=window.__paScheduler||window.__dsScheduler;try{delete window.__dsReact;delete window.__dsReactDOM;delete window.__dsScheduler;}catch(e){}'
const reactBuild = esbuild.buildSync({
  stdin: { contents: 'window.__dsReact=require("react");window.__dsReactDOM=require("react-dom");Object.assign(window.__dsReactDOM,require("react-dom/client"));window.__dsScheduler=require("scheduler")', resolveDir: `${REPO}/node_modules` },
  bundle: true, format: 'iife', platform: 'browser', minify: true, keepNames: true, target: 'es2020', legalComments: 'none',
  define: { 'process.env.NODE_ENV': '"development"' }, footer: { js: noClobber }, write: false,
})
const react = `/* React ${reactVer} and ReactDOM ${reactVer} (development builds): assigns window.React, window.ReactDOM and window.__paScheduler (the scheduler ReactDOM runs on). MIT, Meta Platforms, Inc. */\n` + reactBuild.outputFiles[0].text
bad('react lib', react)
writeFileSync(join(OUT, 'components/lib/react.development.js'), react)
writeFileSync(join(OUT, 'components/lib/react-dom.development.js'), `/* ReactDOM ${reactVer} ships inside react.development.js, which assigns window.ReactDOM. */\n`)

// bundle.css: the site's compiled stylesheet, verbatim.
const css = readFileSync(`${DS}/_ds_bundle.css`, 'utf8')
if (/<\/style/i.test(css)) throw new Error('bundle.css contains </style')
writeFileSync(join(OUT, 'components/bundle.css'), css)

// previews
const SINGLE = { Dialog: true, Select: true, Tooltip: true, Toaster: true }
const order = (name) => [...readFileSync(`${REPO}/.design-sync/previews/${name}.tsx`, 'utf8').matchAll(/^export function (\w+)/gm)].map((m) => m[1])
const names = Object.keys(groups)
const dts = []
for (const name of names) {
  const mod = readFileSync(`${DS}/_preview/${name}.js`, 'utf8')
  bad(`${name} preview module`, mod)
  const cells = order(name)
  // Side-by-side cards sit on one baseline: the header rides the first cell only,
  // so the row aligns to the bottom rather than letting the headed cell hang low.
  const GRID = { PitchSpecimenCard: 360, BallStage: 360, SeamSchematic: 280 }
  const layout = GRID[name]
    ? `#root{display:grid;grid-template-columns:repeat(auto-fit,minmax(${GRID[name]}px,1fr));align-items:end;background:var(--surface-page)}`
    : '#root>.pa-cell+.pa-cell{border-top:1px solid var(--hairline-void)}'
  const html = `<!-- @dsCard group="${groups[name]}" height=__H__ -->
<!doctype html>
<html><head><meta charset="utf-8">
<style>html,body{margin:0;background:var(--surface-page)}${layout}</style>
</head><body>
<div id="root"></div>
<script>
${mod.trim()}
(function () {
  var h = React.createElement, root = document.getElementById('root');
  ${JSON.stringify(SINGLE[name] ? cells.slice(0, 1) : cells)}.forEach(function (k) {
    var el = document.createElement('div');
    el.className = 'pa-cell';
    root.appendChild(el);
    try {
      ReactDOM.createRoot(el).render(h(window.PitchAtlas.DsRouter, null, h(window.__dsPreview[k])));
    } catch (e) {
      el.textContent = 'Preview error: ' + ((e && e.message) || e);
    }
  });
})();
</script>
</body></html>
`
  mkdirSync(join(OUT, 'components', name), { recursive: true })
  writeFileSync(join(OUT, 'components', name, 'preview.html'), html)
  dts.push(readFileSync(join(OUT, 'components', name, `${name}.d.ts`), 'utf8').replace(/^import \* as React from 'react';\n\n/, ''))
}
writeFileSync(join(OUT, 'components/index.d.ts'), "import * as React from 'react';\n\n" + dts.join('\n'))

// fonts: every face the site loads, Latin subset; the four already on the page stay as they are.
mkdirSync(join(OUT, 'fonts'), { recursive: true })
const onPage = new Set(['anton-latin-400-normal.woff2', 'hanken-grotesk-latin-400-normal.woff2', 'martian-mono-latin-400-normal.woff2', 'newsreader-latin-400-normal.woff2'])
const faces = JSON.parse(readFileSync(process.argv[3], 'utf8')).type.fonts
for (const f of faces) {
  const file = f.file.replace(/^fonts\//, '')
  if (onPage.has(file)) continue
  const slug = file.replace(/-latin-.*/, '')
  copyFileSync(`${REPO}/node_modules/@fontsource/${slug}/files/${file}`, join(OUT, 'fonts', file))
}
const sizes = (p) => readdirSync(p).map((f) => `${f} ${readFileSync(join(p, f)).length}`)
console.log('bundle.js', bundle.length, '| react lib', react.length, '| bundle.css', css.length)
console.log('fonts', sizes(join(OUT, 'fonts')).join(', '))
