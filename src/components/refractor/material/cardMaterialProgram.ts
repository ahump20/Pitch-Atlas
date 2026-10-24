import { materialRamp, rampToTexture, type RampName } from './foilRamp'
import { finishVector, type CardMaterial } from './materialPresets'
import { MATERIAL_FRAG, MATERIAL_VERT } from './shaders'

/*
  A minimal WebGL2 wrapper for the card material: compile, link, one ramp texture,
  uniforms, DPR-capped resize, dispose. Hand-rolled on purpose — pulling three.js onto
  the card's interaction path to draw one triangle with one shader buys nothing, and
  this whole layer is a few kilobytes.
*/

export const DPR_CAP = 1.5

/** Pure resize math, exported for tests: CSS size × capped DPR. */
export function backingSize(cssW: number, cssH: number, dpr: number): [number, number] {
  const p = Math.min(Math.max(dpr, 1), DPR_CAP)
  return [Math.max(1, Math.round(cssW * p)), Math.max(1, Math.round(cssH * p))]
}

/** Pure colour parse, exported for tests: #rrggbb → 0..1 triple. */
export function hexToTriple(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return [0.5, 0.5, 0.5]
  const n = parseInt(m[1], 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export const EMPTY_RECT: Rect = { x: 0, y: 0, w: 0, h: 0 }

/** A card's back is struck from its front's seed plus this offset, so the two faces never
    share a pattern, on its stock's own steel rim. The live back and the export both read
    these, so a downloaded back carries the pattern the visitor saw. */
export const BACK_SEED_OFFSET = 11
export const BACK_RING_HEX = '#6e757b'

/** The card's print geometry in CSS pixels of the card box, measured from the DOM. */
export interface MaterialLayout {
  width: number
  height: number
  pad: number
  radius: number
  fieldRadius: number
  window: Rect
  windowRadius: [number, number]
  head: Rect
  strip: Rect
}

export interface MaterialIdentity {
  c2: [number, number, number]
  c3: [number, number, number]
  ring: [number, number, number]
  /** per-card variation of the micro-structure (the reveal index) */
  seed: number
}

export interface MaterialFrame {
  layout: MaterialLayout
  identity: MaterialIdentity
  material: CardMaterial
  tilt: { rx: number; ry: number }
  /** x, y in 0..1 of the card; height in card widths; strength 0..2 */
  light: { x: number; y: number; height: number; strength: number }
}

export interface CardMaterialProgram {
  render(frame: MaterialFrame): void
  resize(cssW: number, cssH: number, dpr: number): void
  dispose(): void
}

const COVERAGE_INDEX = { full: 0, window: 1, frame: 2 } as const

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)
  if (!sh) throw new Error('shader alloc failed')
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh)
    gl.deleteShader(sh)
    throw new Error(`shader compile failed: ${log ?? 'unknown'}`)
  }
  return sh
}

/* Releasing a context is deferred one tick: React's development double-mount
   disposes and re-creates the layer on the same canvas synchronously, and a context
   lost through WEBGL_lose_context never renders again. A real unmount still frees
   its slot before the next frame. */
const pendingRelease = new WeakMap<HTMLCanvasElement, number>()

export function createCardMaterialProgram(canvas: HTMLCanvasElement): CardMaterialProgram {
  const pending = pendingRelease.get(canvas)
  if (pending !== undefined) {
    window.clearTimeout(pending)
    pendingRelease.delete(canvas)
  }
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: 'low-power',
  })
  if (!gl) throw new Error('webgl2 unavailable')
  if (gl.isContextLost()) throw new Error('webgl2 context lost')

  const vs = compile(gl, gl.VERTEX_SHADER, MATERIAL_VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, MATERIAL_FRAG)
  const prog = gl.createProgram()
  if (!prog) throw new Error('program alloc failed')
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog)
    gl.deleteProgram(prog)
    throw new Error(`program link failed: ${log ?? 'unknown'}`)
  }
  gl.useProgram(prog)

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const u = (name: string) => gl.getUniformLocation(prog, name)
  const loc = {
    size: u('uSize'),
    pad: u('uPad'),
    radius: u('uRadius'),
    fieldRadius: u('uFieldRadius'),
    window: u('uWindow'),
    windowRadius: u('uWindowRadius'),
    head: u('uHead'),
    strip: u('uStrip'),
    tilt: u('uTilt'),
    light: u('uLight'),
    c2: u('uC2'),
    c3: u('uC3'),
    ring: u('uRing'),
    ember: u('uEmber'),
    coverage: u('uCoverage'),
    finish: u('uFinish'),
    exposure: u('uExposure'),
    spectral: u('uSpectral'),
    scale: u('uScale'),
    angle: u('uAngle'),
    rough: u('uRough'),
    sheen: u('uSheen'),
    glaze: u('uGlaze'),
    depth: u('uDepth'),
    glint: u('uGlint'),
    seed: u('uSeed'),
    ramp: u('uRamp'),
  }

  // the one texture: the foil ramp, 256×1, linear, repeating so the seam at fract() is soft
  const tex = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.uniform1i(loc.ramp, 0)
  let loadedRamp: RampName | null = null
  const loadRamp = (name: RampName) => {
    if (loadedRamp === name) return
    const bytes = rampToTexture(materialRamp(name))
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes)
    loadedRamp = name
  }

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)

  let disposed = false
  const rect = (l: WebGLUniformLocation | null, r: Rect) => gl.uniform4f(l, r.x, r.y, r.w, r.h)

  return {
    resize(cssW, cssH, dpr) {
      if (disposed) return
      const [w, h] = backingSize(cssW, cssH, dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, w, h)
    },
    render({ layout, identity, material, tilt, light }) {
      if (disposed) return
      loadRamp(material.ramp)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(loc.size, layout.width, layout.height)
      gl.uniform1f(loc.pad, layout.pad)
      gl.uniform1f(loc.radius, layout.radius)
      gl.uniform1f(loc.fieldRadius, layout.fieldRadius)
      rect(loc.window, layout.window)
      gl.uniform2f(loc.windowRadius, layout.windowRadius[0], layout.windowRadius[1])
      rect(loc.head, layout.head)
      rect(loc.strip, layout.strip)
      gl.uniform2f(loc.tilt, tilt.rx, tilt.ry)
      gl.uniform4f(loc.light, light.x, light.y, light.height, light.strength)
      gl.uniform3f(loc.c2, ...identity.c2)
      gl.uniform3f(loc.c3, ...identity.c3)
      gl.uniform3f(loc.ring, ...identity.ring)
      gl.uniform1f(loc.ember, material.ember ? 1 : 0)
      gl.uniform1f(loc.coverage, COVERAGE_INDEX[material.coverage])
      gl.uniform1fv(loc.finish, finishVector(material))
      gl.uniform1f(loc.exposure, material.exposure)
      gl.uniform1f(loc.spectral, material.spectral)
      gl.uniform1f(loc.scale, material.patternScale)
      gl.uniform1f(loc.angle, material.patternAngle)
      gl.uniform1f(loc.rough, material.roughness)
      gl.uniform1f(loc.sheen, material.sheen)
      gl.uniform1f(loc.glaze, material.glaze)
      gl.uniform1f(loc.depth, material.depth)
      gl.uniform3f(loc.glint, material.glint.intensity, material.glint.size, material.glint.density)
      gl.uniform1f(loc.seed, identity.seed)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    dispose() {
      if (disposed) return
      disposed = true
      gl.deleteTexture(tex)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(prog)
      pendingRelease.set(
        canvas,
        window.setTimeout(() => {
          pendingRelease.delete(canvas)
          gl.getExtension('WEBGL_lose_context')?.loseContext()
        }, 0),
      )
    },
  }
}
