/*
  The card material, in one fragment pass.

  A refractor is a dark mirror that throws a spectrum when light rakes across it. So
  the shader draws, in order:

    1. the stock — near-black mirror with a fine tooth, a vignette, and a soft sheen
       toward the key light so the black still reads as a surface;
    2. the micro-structure — the finishes, each a groove direction (hairline,
       crosshatch, cat-eye, the houndstooth's two populations) or a field of tiny
       facets (pillar columns, cracked-ice cells, glitter sites, ripple waves), each
       perturbing the normal or the tangent the light model sees;
    3. the light — a point key light above the card and a viewer straight on, both
       expressed in the card's own frame after its tilt, so turning the card under a
       still light and moving the light over a still card are the same calculation
       and nothing slides in screen space;
    4. the interference colour — a thin-film phase from view angle, position and the
       finish structure, sampled from the brand ramp texture (black → burnt → warm
       specular → ice → powder → cyan → chromium → black) and leaned toward a cosine
       prism by `spectral`;
    5. coverage — the rim and the field carry the foil; under the header and the
       bottom strip it is attenuated and luminance-capped so the print stays legible;
       over the media window only a thin lamination glaze passes, so the hand, the
       seams and the source chip stay intact;
    6. the edges — a bevel along the card's cut that lights on the key side and
       shadows on the far side, the step down into the field, and the black / ring /
       black bezel the CSS used to draw with box-shadow;
    7. ember — the 1/1 samples the lacquer ramp and warms its glints.

  Coordinates are CSS pixels of the card box (y down), so every rect the layer
  measures from the DOM lands exactly. One fullscreen triangle, one 256×1 texture.
*/

export const MATERIAL_VERT = `#version 300 es
out vec2 vUv;
void main() {
  vec2 pos = vec2(float((gl_VertexID & 1) << 2) - 1.0, float((gl_VertexID & 2) << 1) - 1.0);
  vUv = pos * 0.5 + 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}`

export const MATERIAL_FRAG = `#version 300 es
precision highp float;

uniform vec2  uSize;         // card box, css px
uniform float uPad;          // rim width: the field is inset by this
uniform float uRadius;       // card corner radius
uniform float uFieldRadius;  // field corner radius
uniform vec4  uWindow;       // media window rect x, y, w, h (css px)
uniform vec2  uWindowRadius; // window top / bottom corner radii
uniform vec4  uHead;         // header rect
uniform vec4  uStrip;        // bottom strip rect
uniform vec2  uTilt;         // rx, ry in degrees
uniform vec4  uLight;        // x, y in 0..1 of the card, height (card widths), strength
uniform vec3  uC2;
uniform vec3  uC3;
uniform vec3  uRing;
uniform float uEmber;
uniform float uCoverage;     // 0 full · 1 window · 2 frame
uniform float uFinish[8];    // hairline, pillar, crosshatch, cracked ice, glitter, ripple, cat-eye, houndstooth
uniform float uExposure;
uniform float uSpectral;
uniform float uScale;
uniform float uAngle;        // degrees
uniform float uRough;
uniform float uSheen;
uniform float uGlaze;
uniform float uDepth;
uniform vec3  uGlint;        // intensity, size, density
uniform float uSeed;
uniform sampler2D uRamp;

in vec2 vUv;
out vec4 outColor;

const float PI = 3.14159265;

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}
// the arched window: one radius for the top corners, another for the bottom
float sdWindow(vec2 p, vec2 b, vec2 r) {
  float rad = min(p.y < 0.0 ? r.x : r.y, min(b.x, b.y));
  return sdRoundBox(p, b, rad);
}
float rectMask(vec2 p, vec4 r, float aa) {
  if (r.z <= 0.0 || r.w <= 0.0) return 0.0;
  vec2 d = max(r.xy - p, p - (r.xy + r.zw));
  return 1.0 - smoothstep(-aa, aa, max(d.x, d.y));
}
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + uSeed * 0.37);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
vec2 hash22(vec2 p) {
  float h = hash21(p);
  return vec2(h, hash21(p + h + 7.13));
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0)), c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
vec3 prism(float t) {
  return vec3(0.55, 0.5, 0.55) + vec3(0.45) * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}
vec2 rot2(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }

// the houndstooth: coverage in x, groove population in y
vec2 houndstooth(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  float parity = mod(cell.x + cell.y, 2.0);
  float aa = fwidth(p.x) * 1.2;
  float diag = parity > 0.5 ? (f.x - f.y) : (f.x + f.y - 1.0);
  float bite = smoothstep(-aa, aa, diag);
  float solid = parity > 0.5 ? step(0.5, f.x) : step(f.x, 0.5);
  float cover = clamp(solid + bite * (1.0 - solid) * 0.85, 0.0, 1.0);
  return vec2(cover, parity);
}
// four sub-pixel samples of the weave, averaged, so its tooth edges stay smooth in
// both directions and do not shimmer as the card turns
vec2 houndstoothAA(vec2 p) {
  vec2 ox = dFdx(p) * 0.25, oy = dFdy(p) * 0.25;
  return 0.25 * (houndstooth(p + ox + oy) + houndstooth(p - ox + oy) + houndstooth(p + ox - oy) + houndstooth(p - ox - oy));
}
// brushed-metal lobe for a groove direction t in the card plane (Kajiya-Kay)
float anisoLobe(vec2 t, vec3 h, float shin) {
  float th = dot(vec3(t, 0.0), h);
  return pow(max(1.0 - th * th, 0.0), shin);
}
float isoLobe(vec3 n, vec3 h, float shin) {
  return pow(max(dot(n, h), 0.0), shin);
}

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;
  vec2 hsz = uSize * 0.5;
  float dCard = sdRoundBox(p - hsz, hsz, uRadius);
  if (dCard > 1.5) discard;

  float aa = 0.75;
  vec2 fieldHalf = hsz - uPad;
  float dField = sdRoundBox(p - hsz, fieldHalf, uFieldRadius);
  float inField = 1.0 - smoothstep(-aa, aa, dField);
  vec2 winHalf = uWindow.zw * 0.5;
  float dWin = sdWindow(p - (uWindow.xy + winHalf), winHalf, uWindowRadius);
  float inWin = uWindow.z > 0.0 ? 1.0 - smoothstep(-aa, aa, dWin) : 0.0;
  float inHead = rectMask(p, uHead, aa);
  float inStrip = rectMask(p, uStrip, aa);

  // ── frames: the viewer and the key light in the card's own space after its tilt
  float rx = radians(uTilt.x), ry = radians(uTilt.y);
  mat3 M = rotX(ry) * rotY(rx);          // card-local → world (the CSS rotateX(ry) rotateY(rx))
  mat3 Mt = transpose(M);
  float aspect = uSize.y / uSize.x;
  vec2 q = p / uSize.x;                   // card-width units, y down
  vec3 Pw = M * vec3(q, 0.0);
  vec3 Lw = vec3(uLight.x, uLight.y * aspect, uLight.z);
  vec3 L = normalize(Mt * (Lw - Pw));
  vec3 V = normalize(Mt * vec3(0.0, 0.0, 1.0));
  vec3 H = normalize(L + V);
  float lightDist = length(Lw.xy - q);
  float atten = uLight.w * (0.62 + 0.38 / (1.0 + 2.2 * lightDist * lightDist));

  float shinA = mix(90.0, 7.0, uRough);   // anisotropic lobe tightness
  float shinI = mix(60.0, 9.0, uRough);   // isotropic facets

  // ── stock
  float vig = smoothstep(0.35, 1.25, length((p - hsz) / hsz));
  vec3 stock = mix(vec3(0.0314, 0.0353, 0.0392), vec3(0.0275, 0.0196, 0.0353), vig);
  stock = mix(stock, vec3(0.075, 0.034, 0.02), uEmber * 0.45);
  stock += (vnoise(p * 0.85) - 0.5) * 0.026 + (vnoise(p * 0.06 + 3.0) - 0.5) * 0.03;
  vec3 nFlat = vec3(0.0, 0.0, 1.0);
  float diff = max(dot(nFlat, L), 0.0);
  float fres = pow(1.0 - max(dot(nFlat, V), 0.0), 3.0);
  vec3 col = stock * (0.88 + 0.95 * diff * uSheen) + vec3(0.16, 0.18, 0.19) * fres * 0.45;

  // ── micro-structure → one lobe, one phase, one tooth multiplier
  // The finishes are laid out on a 360px card and enlarge with a bigger one, so a card
  // shown larger, or exported, keeps the finish the visitor tuned: measured in pixels,
  // a 1500px export carried four times the pillar columns of the card on screen. A
  // smaller card keeps the finish at its finest legible pitch rather than going finer.
  vec2 pf = p * min(1.0, 360.0 / uSize.x);
  float lobe = 0.0, weight = 0.0, phase = 0.0, toothMul = 1.0, spark = 0.0;
  float edgeDark = 1.0;
  vec2 tHair = rot2(vec2(1.0, 0.0), radians(uAngle));
  vec2 perp = vec2(-tHair.y, tHair.x);
  float streak = 0.72 + 0.56 * vnoise(vec2(dot(pf, perp) * 0.7 * uScale, dot(pf, tHair) * 0.012));

  if (uFinish[0] > 0.0) { // brushed hairline
    lobe += uFinish[0] * anisoLobe(tHair, H, shinA) * streak;
    weight += uFinish[0];
  }
  if (uFinish[1] > 0.0) { // pillar columns
    float colW = 21.0 / uScale;
    float colI = floor(pf.x / colW);
    vec2 hc = hash22(vec2(colI, 3.7));
    vec3 nP = normalize(vec3((hc.x - 0.5) * 0.46, (hc.y - 0.5) * 0.1, 1.0));
    lobe += uFinish[1] * isoLobe(nP, H, shinI) * 1.15;
    phase += uFinish[1] * (hc.x - 0.5) * 0.9;
    weight += uFinish[1];
    float seam = min(fract(pf.x / colW), 1.0 - fract(pf.x / colW)) * colW;
    edgeDark *= 1.0 - uFinish[1] * 0.28 * (1.0 - smoothstep(0.0, 1.2, seam));
  }
  if (uFinish[2] > 0.0) { // crosshatch
    vec2 tB = rot2(vec2(1.0, 0.0), -radians(uAngle));
    float cross = max(anisoLobe(tHair, H, shinA), anisoLobe(tB, H, shinA));
    lobe += uFinish[2] * cross * streak;
    weight += uFinish[2];
  }
  if (uFinish[3] > 0.0) { // cracked ice
    vec2 g = pf / (88.0 / uScale);
    vec2 ig = floor(g), fg = fract(g);
    float md = 8.0, md2 = 8.0;
    vec2 mc = ig;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 nb = vec2(float(x), float(y));
      vec2 r = nb + hash22(ig + nb) - fg;
      float d = dot(r, r);
      if (d < md) { md2 = md; md = d; mc = ig + nb; } else if (d < md2) { md2 = d; }
    }
    float edge = sqrt(md2) - sqrt(md);
    vec2 hc = hash22(mc + 11.0);
    vec3 nI = normalize(vec3((hc - 0.5) * 0.6, 1.0));
    lobe += uFinish[3] * isoLobe(nI, H, shinI) * 1.2;
    phase += uFinish[3] * (hc.y - 0.5) * 1.3;
    weight += uFinish[3];
    edgeDark *= mix(1.0, 0.5 + 0.5 * smoothstep(0.0, 0.07, edge), uFinish[3]);
  }
  if (uFinish[4] > 0.0) { // glitter
    float cell = 7.5 / (max(uGlint.z, 0.05) * uScale);
    vec2 gi = floor(pf / cell), gf = fract(pf / cell);
    vec2 o = 0.2 + 0.6 * hash22(gi + 5.0);
    float present = step(0.5, hash21(gi + 9.0));
    float site = present * (1.0 - smoothstep(0.0, 0.07 + 0.2 * uGlint.y, length(gf - o)));
    vec2 h3 = hash22(gi + 2.0);
    vec3 nG = normalize(vec3((h3 - 0.5) * 1.2, 1.0));
    spark += uFinish[4] * site * isoLobe(nG, H, 260.0) * 3.2 * uGlint.x;
  }
  if (uFinish[5] > 0.0) { // ripple
    vec2 w = 0.2 * vec2(cos(pf.x * 0.07 * uScale + pf.y * 0.025), cos(pf.y * 0.06 * uScale - pf.x * 0.02 + 1.7));
    vec3 nR = normalize(vec3(w, 1.0));
    lobe += uFinish[5] * isoLobe(nR, H, shinI) * 1.1;
    phase += uFinish[5] * w.x * 0.8;
    weight += uFinish[5];
  }
  if (uFinish[6] > 0.0) { // cat-eye
    vec2 rd = normalize(p - hsz + 0.001);
    lobe += uFinish[6] * anisoLobe(vec2(-rd.y, rd.x), H, shinA);
    weight += uFinish[6];
  }
  float parity = 0.0;
  // a small card's weave is quieter: at phone size its full contrast out-shone the grip
  // clip it frames. About half below 280px of card, whole from 440px up, so the
  // inspector on a wide screen and every export (1200px or wider) keep the full weave.
  float weaveGain = mix(0.5, 1.0, smoothstep(280.0, 440.0, uSize.x));
  if (uFinish[7] > 0.0) { // houndstooth: two interleaved groove populations
    // one cell count across the card at every size; a count that varied across the
    // card folded the pattern back on itself near the far edge, a jagged band
    vec2 ht = houndstoothAA(p / (uSize.x / 52.0 / uScale));
    parity = ht.y;
    vec2 tA = normalize(vec2(1.0, 1.0)), tB = normalize(vec2(1.0, -1.0));
    float lobeA = anisoLobe(tA, H, shinA), lobeB = anisoLobe(tB, H, shinA);
    float hl = mix(0.5 * (lobeA + lobeB), mix(lobeB, lobeA, parity), weaveGain);
    lobe += uFinish[7] * hl;
    weight += uFinish[7];
    toothMul = mix(1.0, mix(1.0 - 0.26 * weaveGain, 1.0, ht.x), uFinish[7]);
  }
  float smoothLobe = isoLobe(nFlat, H, mix(22.0, 6.0, uRough)) * 0.9;
  float broad = isoLobe(nFlat, H, 4.0);
  lobe = weight > 0.0 ? mix(smoothLobe, lobe / max(weight, 1.0), clamp(weight, 0.0, 1.0)) : smoothLobe;
  // the micro-structure is the rim's; the field is the printed face and stays smooth
  lobe = mix(lobe, smoothLobe, inField * 0.75);
  // the room's light on the foil: the interference colour is always there, dimly,
  // and the streaks ride on top of it
  float fill = 0.22 * (0.35 + 0.65 * broad);

  // ── interference colour from the brand ramp, leaned toward a prism
  float film = dot(q, normalize(vec2(1.0, 0.62))) * 1.35 + uTilt.x * 0.045 + uTilt.y * 0.025
             + (1.0 - max(dot(nFlat, V), 0.0)) * 2.0 + phase * (1.0 - 0.6 * inField) + parity * 0.08 * weaveGain * (1.0 - inField) + uSeed * 0.11;
  vec3 rampCol = (texture(uRamp, vec2(fract(film - 0.018), 0.5)).rgb
                + texture(uRamp, vec2(fract(film), 0.5)).rgb * 1.4
                + texture(uRamp, vec2(fract(film + 0.018), 0.5)).rgb) / 3.4;
  vec3 tint = mix(rampCol, prism(film * 0.8), uSpectral * 0.55);
  tint = mix(tint, tint * vec3(1.14, 0.9, 0.76), uEmber * 0.4);

  // ── coverage
  float rimMul, fieldMul, glazeMul;
  if (uCoverage < 0.5)      { rimMul = 1.0;  fieldMul = 0.22; glazeMul = uGlaze; }
  else if (uCoverage < 1.5) { rimMul = 0.14; fieldMul = 0.06; glazeMul = max(uGlaze, 0.85); }
  else                      { rimMul = 1.0;  fieldMul = 0.22; glazeMul = 0.0; }
  float region = mix(rimMul, fieldMul, inField);
  // the tooth pattern is the rim's signature; the field is the printed face, so
  // there it fades to a whisper
  toothMul = mix(toothMul, mix(0.93, 1.0, toothMul), inField);
  float prot = max(inHead, inStrip);
  region *= mix(1.0, 0.4, prot);

  float exposure = uExposure * 1.15 * atten * region;
  vec3 foil = tint * (lobe * toothMul + fill * mix(1.0, toothMul, 0.35)) * exposure;
  vec3 glintCol = mix(vec3(1.0, 0.98, 0.95), vec3(1.0, 0.92, 0.84), uEmber);
  col += foil + glintCol * spark * 0.8 * region * atten;
  col += (1.0 - uEmber) * mix(uC2, uC3, lobe) * 0.1 * region;
  col *= edgeDark;

  // ── inside the field: a lit lip at the top, a well at the bottom
  float fy = clamp((p.y - uPad) / max(uSize.y - 2.0 * uPad, 1.0), 0.0, 1.0);
  col += inField * 0.06 * (1.0 - smoothstep(0.0, 0.07, fy));
  col *= 1.0 - inField * 0.5 * smoothstep(0.9, 1.0, fy);

  // ── the print stays legible: cap the luminance under the header and the strip
  float lum = dot(col, vec3(0.3, 0.59, 0.11));
  float cap = 0.5;
  if (prot > 0.0 && lum > cap) col *= mix(1.0, cap / lum, prot);

  // ── edges: the card's cut bevel and the step down into the field
  float eps = 0.6;
  vec2 gC = normalize(vec2(
    sdRoundBox(p - hsz + vec2(eps, 0.0), hsz, uRadius) - sdRoundBox(p - hsz - vec2(eps, 0.0), hsz, uRadius),
    sdRoundBox(p - hsz + vec2(0.0, eps), hsz, uRadius) - sdRoundBox(p - hsz - vec2(0.0, eps), hsz, uRadius)) + 1e-5);
  float bw = 1.6 + 1.8 * uDepth;
  float e = clamp(1.0 + dCard / bw, 0.0, 1.0);
  vec3 nb = normalize(vec3(gC * 0.8 * e, 1.0));
  float bevSpec = isoLobe(nb, H, 26.0);
  col += vec3(1.0, 0.97, 0.93) * bevSpec * e * (0.5 + 0.9 * uDepth);
  col *= 1.0 - e * 0.32 * (1.0 - max(dot(nb, L), 0.0)) * uDepth;

  // the field cut: a shadowed groove just outside the field, a lit lip past it
  float cw = 2.2;
  float groove = (1.0 - smoothstep(0.0, cw, dField)) * step(0.0, dField);
  col *= 1.0 - groove * 0.4 * uDepth;
  vec2 gF = normalize(vec2(
    sdRoundBox(p - hsz + vec2(eps, 0.0), fieldHalf, uFieldRadius) - sdRoundBox(p - hsz - vec2(eps, 0.0), fieldHalf, uFieldRadius),
    sdRoundBox(p - hsz + vec2(0.0, eps), fieldHalf, uFieldRadius) - sdRoundBox(p - hsz - vec2(0.0, eps), fieldHalf, uFieldRadius)) + 1e-5);
  float lip = smoothstep(cw, cw + 0.8, dField) * (1.0 - smoothstep(cw + 0.8, cw + 2.6, dField));
  float lit = max(dot(-gF, normalize(Lw.xy - q)), 0.0);
  col += vec3(0.9, 0.9, 0.92) * lip * lit * 0.22 * uDepth;

  // the bezel: black / ring / black outside the field, black / dim ring inside
  float band = 1.0 - smoothstep(-0.5, 0.5, abs(dField - 1.0) - 1.0);   // 0..2
  col = mix(col, vec3(0.0), band);
  band = 1.0 - smoothstep(-0.5, 0.5, abs(dField - 2.5) - 0.5);          // 2..3
  col = mix(col, uRing, band);
  band = 1.0 - smoothstep(-0.5, 0.5, abs(dField - 3.75) - 0.75);        // 3..4.5
  col = mix(col, vec3(0.0), band);
  band = 1.0 - smoothstep(-0.5, 0.5, abs(dField + 1.0) - 1.0);          // -2..0
  col = mix(col, vec3(0.0), band * inField);
  band = 1.0 - smoothstep(-0.5, 0.5, abs(dField + 2.5) - 0.5);          // -3..-2
  col = mix(col, mix(uRing, stock, 0.55), band * inField);

  // ── the window: only a thin lamination glaze crosses the media
  float glazeA = clamp((smoothLobe * 0.55 + broad * 0.12 + spark * 0.5) * glazeMul * atten, 0.0, 0.5);
  vec3 glazeC = mix(tint, vec3(1.0), 0.45);

  float a = 1.0 - smoothstep(-0.75, 0.75, dCard);
  vec3 rgb = mix(col * a, glazeC * glazeA, inWin);
  float alpha = mix(a, glazeA, inWin);
  outColor = vec4(rgb, alpha);
}`
