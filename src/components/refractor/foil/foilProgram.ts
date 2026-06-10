import { FOIL_FRAG, FOIL_VERT } from './shaders'

/*
  A minimal WebGL2 wrapper for one fullscreen-triangle pass — compile, link,
  uniforms, DPR-capped resize, dispose. Hand-rolled on purpose: pulling the
  three.js chunk onto the hero's interaction path to draw a single quad with a
  single custom shader buys nothing; this whole layer is a few kilobytes.
*/

export const DPR_CAP = 1.5

/** Pure resize math, exported for tests: CSS size × capped DPR. */
export function backingSize(cssW: number, cssH: number, dpr: number): [number, number] {
  const p = Math.min(Math.max(dpr, 1), DPR_CAP)
  return [Math.max(1, Math.round(cssW * p)), Math.max(1, Math.round(cssH * p))]
}

export interface FoilUniforms {
  tilt: { rx: number; ry: number; mx: number; my: number }
  c2: [number, number, number]
  c3: [number, number, number]
  gold: boolean
}

/** Pure color parse, exported for tests: #rrggbb → linear-ish 0..1 triple. */
export function hexToTriple(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return [0.5, 0.5, 0.5]
  const n = parseInt(m[1], 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export interface FoilProgram {
  render(u: FoilUniforms): void
  resize(cssW: number, cssH: number, dpr: number): void
  dispose(): void
}

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

export function createFoilProgram(canvas: HTMLCanvasElement): FoilProgram {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: 'low-power',
  })
  if (!gl) throw new Error('webgl2 unavailable')

  const vs = compile(gl, gl.VERTEX_SHADER, FOIL_VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FOIL_FRAG)
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

  const loc = {
    res: gl.getUniformLocation(prog, 'uRes'),
    tilt: gl.getUniformLocation(prog, 'uTilt'),
    light: gl.getUniformLocation(prog, 'uLight'),
    c2: gl.getUniformLocation(prog, 'uC2'),
    c3: gl.getUniformLocation(prog, 'uC3'),
    gold: gl.getUniformLocation(prog, 'uGold'),
  }

  gl.enable(gl.BLEND)
  // premultiplied-alpha over
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)

  let disposed = false

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
    render(u) {
      if (disposed) return
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(loc.res, canvas.width, canvas.height)
      gl.uniform2f(loc.tilt, u.tilt.rx, u.tilt.ry)
      gl.uniform2f(loc.light, u.tilt.mx / 100, u.tilt.my / 100)
      gl.uniform3f(loc.c2, ...u.c2)
      gl.uniform3f(loc.c3, ...u.c3)
      gl.uniform1f(loc.gold, u.gold ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    dispose() {
      if (disposed) return
      disposed = true
      gl.deleteVertexArray(vao)
      gl.deleteProgram(prog)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
