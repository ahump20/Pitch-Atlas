/*
  The foil, digitized from the physical card's actual behavior.

  On the reference card the houndstooth isn't printed color — it's two
  interleaved populations of foil micro-grooves with different groove
  orientations. Each population catches the light at a different tilt angle,
  which is why the pattern appears to invert and shimmer as the card rotates
  in the hand. So the fragment shader builds:

    1. a procedural houndstooth tessellation (no texture downloads),
       anti-aliased with fwidth, whose cell parity says which of the two
       interlocking tooth sets a pixel belongs to;
    2. two anisotropic specular bands — Gaussians over two projection axes,
       whose centers are linear functions of the live tilt, with a different
       tilt-to-center mapping per parity. Tilt right: set A lights up; keep
       tilting: set B takes over. That is the physical card's signature.
    3. a cosine-palette thin-film ramp (the standard cheap spectral
       approximation of interference) whose phase also rides the tilt, so the
       hue walks the spectrum as the card moves;
    4. the per-pitch accent triad as a tint, and a gold mode that collapses
       the palette toward a gold-white spectrum for the 1/1 chase card.

  One fullscreen triangle, one pass, zero textures.
*/

export const FOIL_VERT = `#version 300 es
out vec2 vUv;
void main() {
  // fullscreen triangle from gl_VertexID — no vertex buffer at all
  vec2 pos = vec2(float((gl_VertexID & 1) << 2) - 1.0, float((gl_VertexID & 2) << 1) - 1.0);
  vUv = pos * 0.5 + 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}`

export const FOIL_FRAG = `#version 300 es
precision highp float;

uniform vec2 uRes;       // canvas pixels
uniform vec2 uTilt;      // rx, ry in degrees (the live spring values)
uniform vec2 uLight;     // mx, my in 0..1 (the CSS light position)
uniform vec3 uC2;        // pitch accent mid
uniform vec3 uC3;        // pitch accent bright
uniform float uGold;     // 1.0 on the gold 1/1
in vec2 vUv;
out vec4 outColor;

// cosine palette: a + b * cos(2pi * (c*t + d)) — the cheap spectral ramp
vec3 palette(float t) {
  vec3 a = vec3(0.55, 0.5, 0.55);
  vec3 b = vec3(0.45, 0.45, 0.45);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.33, 0.67);
  return a + b * cos(6.28318 * (c * t + d));
}

// the houndstooth cell: a 2x2 parity check with diagonal half-plane teeth.
// returns coverage in x, cell parity in y.
vec2 houndstooth(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  float parity = mod(cell.x + cell.y, 2.0);
  float aa = fwidth(p.x) * 1.2;
  // the tooth: a solid half + a diagonal bite out of the neighbor half
  float diag = parity > 0.5 ? (f.x - f.y) : (f.x + f.y - 1.0);
  float bite = smoothstep(-aa, aa, diag);
  float solid = parity > 0.5 ? step(0.5, f.x) : step(f.x, 0.5);
  float cover = clamp(solid + bite * (1.0 - solid) * 0.85, 0.0, 1.0);
  return vec2(cover, parity);
}

void main() {
  vec2 px = vUv * uRes;
  float scale = max(uRes.x, 1.0) / 26.0;       // ~26 teeth across the field
  vec2 ht = houndstooth(px / scale);
  float tooth = ht.x;
  float parity = ht.y;

  float rx = uTilt.x / 14.0;                    // normalize to the drag clamp
  float ry = uTilt.y / 14.0;

  // two groove populations, two projection axes, two tilt mappings
  float dirA = dot(vUv, normalize(vec2(1.0, 1.0)));
  float dirB = dot(vUv, normalize(vec2(1.0, -1.0)));
  float centerA = 0.5 + rx * 0.55 + ry * 0.18;
  float centerB = 0.35 - rx * 0.45 + ry * 0.28;
  float bandA = exp(-pow((dirA - centerA) * 5.2, 2.0));
  float bandB = exp(-pow((dirB - centerB) * 5.2, 2.0));
  float spec = mix(bandB, bandA, parity);

  // a soft pointer-following glare so the foil also answers the light position
  float glare = exp(-distance(vUv, uLight) * 2.6) * 0.45;

  // thin-film hue: phase rides the projection axis and the tilt
  float t = mix(dirB, dirA, parity) * 1.6 + rx * 0.9 + ry * 0.45;
  vec3 irid = palette(t);

  // gold mode: collapse the spectrum toward gold-white for the 1/1
  vec3 goldTone = mix(vec3(0.85, 0.66, 0.30), vec3(1.0, 0.94, 0.76), spec);
  vec3 sheen = mix(irid, goldTone, uGold * 0.82);

  // the pitch accent breathes through the dark teeth
  vec3 accent = mix(uC2, uC3, spec) * (1.0 - uGold) * 0.30;

  float energy = 0.16 + 1.35 * spec + glare;
  vec3 col = tooth * (sheen * energy * 0.55 + accent);
  float alpha = tooth * clamp(0.10 + 0.62 * spec + glare * 0.5, 0.0, 0.85);

  // premultiplied output
  outColor = vec4(col * alpha, alpha);
}`
