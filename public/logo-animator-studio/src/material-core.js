const rad = (d) => (d * Math.PI) / 180;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const PAD = 2;
const QUAD_VS = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;
const PART_VS = `#version 300 es
in vec2 aPos; uniform mat3 uM; uniform float uPad; out vec2 vT;
void main() {
  vT = aPos * 0.5 + 0.5;
  vec2 c = (uM * vec3(vT, 1.0)).xy - 0.5;
  gl_Position = vec4(c.x * 2.0 / uPad, -c.y * 2.0 / uPad, 0.0, 1.0);
}`;
const PART_FS = `#version 300 es
precision highp float;
in vec2 vT; uniform sampler2D uTex, uLine; uniform float uOp, uP, uWipe; uniform vec2 uC; out vec4 o;
void main() {
  vec4 fill = texture(uTex, vT);
  if (uP >= 0.999) { o = fill * uOp; return; }
  if (uWipe > 0.5) { o = fill * step(vT.x, uP) * uOp; return; }
  float ang = fract(atan(vT.x - uC.x, uC.y - vT.y) / 6.2831853);
  float shown = 1.0 - smoothstep(uP - 0.015, uP + 0.015, ang);
  o = fill * smoothstep(0.55, 1.0, uP);
  o += texture(uLine, vT) * shown * (1.0 - o.a);
  o *= uOp;
}`;
const BLUR_FS = `#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uTex; uniform vec2 uDir; out vec4 o;
void main() {
  float s = texture(uTex, vUv).a * 0.227027;
  s += (texture(uTex, vUv + uDir * 1.0).a + texture(uTex, vUv - uDir * 1.0).a) * 0.1945946;
  s += (texture(uTex, vUv + uDir * 2.0).a + texture(uTex, vUv - uDir * 2.0).a) * 0.1216216;
  s += (texture(uTex, vUv + uDir * 3.0).a + texture(uTex, vUv - uDir * 3.0).a) * 0.054054;
  s += (texture(uTex, vUv + uDir * 4.0).a + texture(uTex, vUv - uDir * 4.0).a) * 0.016216;
  o = vec4(s);
}`;
const SEED_FS = `#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uTex; out vec4 o;
void main() { o = texture(uTex, vUv).a < 0.5 ? vec4(vUv, 0.0, 1.0) : vec4(-1.0, -1.0, 0.0, 1.0); }`;
const FLOOD_FS = `#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uTex; uniform vec2 uStep; out vec4 o;
void main() {
  vec2 best = vec2(-1.0); float near = 1e9;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 s = texture(uTex, vUv + vec2(float(x), float(y)) * uStep).xy;
    if (s.x >= 0.0) { float d = distance(s, vUv); if (d < near) { near = d; best = s; } }
  }
  o = vec4(best, 0.0, 1.0);
}`;
const HEIGHT_FS = `#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uTex, uMask; uniform float uW, uTexel; out vec4 o;
void main() {
  vec2 s = texture(uTex, vUv).xy;
  float d = s.x < 0.0 ? uW : max(distance(s, vUv) - 0.5 * uTexel, 0.0);
  float x = clamp(d / uW, 0.0, 1.0);
  o = vec4(sqrt(max(1.0 - (1.0 - x) * (1.0 - x), 0.0)) * step(0.5, texture(uMask, vUv).a));
}`;
const SLOPE_FS = `#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uTex; uniform float uW, uTexel; out vec4 o;
void main() {
  vec2 e = vec2(uTexel, 0.0);
  vec2 g = vec2(texture(uTex, vUv + e.xy).a - texture(uTex, vUv - e.xy).a, texture(uTex, vUv + e.yx).a - texture(uTex, vUv - e.yx).a);
  o = vec4(g * uW / (2.0 * uTexel), texture(uTex, vUv).a, 1.0);
}`;
const GLASS_FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uMask, uSlope, uSoft;
uniform float uPad, uFlat, uDepth, uMetal, uRefract, uDisperse, uFlow, uGloss, uSheen, uPhase, uHue, uGlow, uBlur;
uniform vec3 uGlowColor;
const float TAU = 6.2831853;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fluid(vec2 p) {
  vec2 a = 0.45 * vec2(cos(TAU * uPhase), sin(TAU * uPhase));
  vec2 b = 0.3 * vec2(cos(-TAU * uPhase + 1.7), sin(-TAU * uPhase + 1.7));
  return noise(p * 3.0 + a) * 0.6 + noise(p * 6.5 + b + 11.0) * 0.3 + noise(p * 13.0 - a + 5.0) * 0.1;
}
float panel(vec3 d, vec3 c, vec2 ext, float soft) {
  float k = dot(d, c);
  if (k <= 0.0) return 0.0;
  vec3 ux = normalize(cross(vec3(0.0, 1.0, 0.0), c)), uy = cross(c, ux), p = d / k - c;
  return smoothstep(ext.x + soft, ext.x - soft * 0.5, abs(dot(p, ux))) * smoothstep(ext.y + soft, ext.y - soft * 0.5, abs(dot(p, uy)));
}
vec3 env(vec3 d, float rough) {
  float soft = 0.03 + rough * 0.5;
  vec3 sky = mix(vec3(0.3, 0.33, 0.4), vec3(0.72, 0.78, 0.92), smoothstep(-0.1, 0.9, d.y));
  vec3 ground = mix(vec3(0.24, 0.25, 0.29), vec3(0.08, 0.085, 0.11), smoothstep(0.0, -0.9, d.y));
  vec3 c = mix(ground, sky, smoothstep(-soft * 0.6 - 0.02, soft * 0.6 + 0.02, d.y));
  c += vec3(0.9, 0.95, 1.0) * 0.35 * exp(-abs(d.y) * mix(18.0, 4.0, rough));
  c += vec3(0.55, 0.6, 0.72) * smoothstep(0.45, -0.25, d.z);
  c += vec3(2.4, 2.3, 2.15) * panel(d, normalize(vec3(-0.5, 0.65, 0.57)), vec2(0.38, 0.26), soft);
  c += vec3(0.7, 0.9, 1.5) * panel(d, normalize(vec3(0.85, 0.1, 0.5)), vec2(0.07, 0.6), soft);
  c += vec3(1.3, 0.85, 0.55) * 0.8 * panel(d, normalize(vec3(-0.75, -0.35, 0.55)), vec2(0.22, 0.12), soft);
  return mix(c, vec3(0.42, 0.45, 0.52), rough * rough * 0.6);
}
vec3 hueShift(vec3 c, float a) {
  vec3 k = vec3(0.57735);
  return c * cos(a) + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - cos(a));
}
vec4 shade(vec3 n, vec3 tint, float thick, float rough) {
  vec3 v = vec3(0.0, 0.0, 1.0), r = reflect(-v, n);
  vec3 mirror = env(r, rough);
  float fres = 0.04 + 0.96 * pow(1.0 - clamp(n.z, 0.0, 1.0), 4.0);
  vec3 t = refract(-v, n, 1.0 / (1.15 + 0.55 * uRefract));
  float bend = smoothstep(0.02, 0.5, length(t.xy) * (0.6 + 1.4 * uRefract));
  vec3 through = env(normalize(vec3(-t.xy * (1.5 + 2.5 * uRefract), -t.z)), rough * 1.2 + 0.05) * mix(vec3(1.0), tint * tint * 1.3, 0.3 + 0.6 * thick);
  float density = 0.4 + 0.45 * thick;
  vec4 glass = vec4(tint * (0.75 + 0.25 * thick) * density, density);
  glass = mix(glass, vec4(through, 1.0), bend * 0.85);
  glass = mix(glass, vec4(mirror, 1.0), fres);
  vec4 metal = vec4(mirror * mix(vec3(1.0), tint, 0.45), 1.0);
  return mix(glass, metal, uMetal);
}

void main() {
  vec4 m = texture(uMask, vUv);
  vec4 s = texture(uSlope, vUv);
  float b = texture(uSoft, vUv).r;
  float a = mix(m.a, smoothstep(0.25, 0.75, b) * max(m.a, step(0.5, b)), uBlur);
  vec3 halo = uGlowColor * uGlow * pow(smoothstep(0.0, 0.55, b), 2.0);
  vec4 under = vec4(halo * 0.8, length(halo) * 0.55);
  if (uFlat < 0.5) {
    vec2 drop = vec2(0.012, -0.018) * (0.5 + uDepth) * 2.0 / uPad;
    float shadow = smoothstep(0.1, 0.9, texture(uSoft, vUv + drop).r) * (0.1 + 0.2 * uDepth);
    float focus = pow(smoothstep(0.55, 1.0, texture(uSoft, vUv + drop * 1.7).r), 2.0) * (1.0 - uMetal) * (0.25 + 0.75 * uRefract);
    under = vec4(under.rgb * (1.0 - shadow), under.a + shadow * (1.0 - under.a));
    under += vec4(mix(vec3(1.0), uGlowColor, 0.45) * focus * 0.4, focus * 0.22);
  }
  if (a < 0.003) { o = under; return; }
  vec3 tint = hueShift(m.rgb / max(m.a, 0.001), uHue);
  if (uFlat > 0.5) { o = vec4(tint * a, a) + under * (1.0 - a); return; }

  float h = s.b;
  vec2 p = (vUv - 0.5) * uPad + 1.0;
  float f0 = fluid(p);
  vec2 fg = vec2(fluid(p + vec2(0.012, 0.0)) - f0, fluid(p + vec2(0.0, 0.012)) - f0) / 0.012;
  vec2 slope = s.rg + fg * uFlow * 0.2 * (0.3 + 0.7 * h);
  vec3 n = normalize(vec3(-slope, 1.0));

  float rough = 1.0 - uGloss;
  float d = uDisperse * 0.25;
  vec3 nr = normalize(vec3(n.xy * (1.0 + d), n.z)), nb = normalize(vec3(n.xy * (1.0 - d), n.z));
  vec4 cr = shade(nr, tint, h, rough), cg = shade(n, tint, h, rough), cb = shade(nb, tint, h, rough);
  vec4 col = vec4(cr.r, cg.g, cb.b, (cr.a + cg.a + cb.a) / 3.0);

  vec3 hv = normalize(normalize(vec3(-0.5, 0.65, 0.57)) + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, hv), 0.0), mix(14.0, 260.0, uGloss)) * (0.2 + 0.8 * uGloss);
  col = vec4(col.rgb + spec, min(col.a + spec, 1.0));

  vec3 film = 0.5 + 0.5 * cos(TAU * ((1.0 - n.z) * 1.6 + f0 * 0.8 + uPhase + vec3(0.0, 0.33, 0.67)));
  float fk = uSheen * (0.35 + 0.65 * pow(1.0 - n.z, 0.6));
  col = mix(col, vec4(col.rgb * 0.35 + film * (0.55 + 0.45 * tint), 1.0), fk);

  col.rgb = col.rgb / (1.0 + 0.22 * col.rgb);
  col *= a;
  o = col + under * (1.0 - col.a);
}`;

const mul = (a, b) => [
  a[0] * b[0] + a[3] * b[1] + a[6] * b[2], a[1] * b[0] + a[4] * b[1] + a[7] * b[2], a[2] * b[0] + a[5] * b[1] + a[8] * b[2],
  a[0] * b[3] + a[3] * b[4] + a[6] * b[5], a[1] * b[3] + a[4] * b[4] + a[7] * b[5], a[2] * b[3] + a[5] * b[4] + a[8] * b[5],
  a[0] * b[6] + a[3] * b[7] + a[6] * b[8], a[1] * b[6] + a[4] * b[7] + a[7] * b[8], a[2] * b[6] + a[5] * b[7] + a[8] * b[8],
];
const move = (x, y) => [1, 0, 0, 0, 1, 0, x, y, 1];
const scale = (x, y) => [x, 0, 0, 0, y, 0, 0, 0, 1];
const spin = (deg) => { const c = Math.cos(rad(deg)), s = Math.sin(rad(deg)); return [c, s, 0, -s, c, 0, 0, 0, 1]; };
const about = (cx, cy, m) => mul(move(cx, cy), mul(m, move(-cx, -cy)));
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);

function centreOf(img) {
  const S = 96, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d', { willReadFrequently: true });
  const k = Math.min(S / img.width, S / img.height), w = img.width * k, h = img.height * k;
  g.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
  const d = g.getImageData(0, 0, S, S).data;
  let x0 = S, y0 = S, x1 = -1, y1 = -1;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (d[(y * S + x) * 4 + 3] > 8) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return x1 < 0 ? [0.5, 0.5] : [(x0 + x1 + 1) / 2 / S, (y0 + y1 + 1) / 2 / S];
}

function createMaterial(canvas) {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const program = (vs, fs) => {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {};
    for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) { const name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name); }
    return { p, u };
  };
  if (!gl.getExtension('EXT_color_buffer_float')) return null;
  let part, blur, seed, flood, height, slope, glass;
  try {
    part = program(PART_VS, PART_FS); blur = program(QUAD_VS, BLUR_FS); seed = program(QUAD_VS, SEED_FS); flood = program(QUAD_VS, FLOOD_FS);
    height = program(QUAD_VS, HEIGHT_FS); slope = program(QUAD_VS, SLOPE_FS); glass = program(QUAD_VS, GLASS_FS);
  } catch (e) { console.error(e); return null; }

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const texture = (w, h, float, filter = gl.LINEAR) => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    if (w && float) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  const target = (w, h, float, filter) => {
    const tex = texture(w, h, float, filter), fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { tex, fbo, w, h };
  };
  const H = 256, D = 384;
  const soft = [target(H, H, true), target(H, H, true)];
  const field = [target(D, D, true, gl.NEAREST), target(D, D, true, gl.NEAREST)];
  const relief = [target(D, D, true), target(D, D, true)];
  let mask = null, parts = [];

  function upload(img, max) {
    const size = Math.min(max, Math.max(img.width, img.height) || 512), c = document.createElement('canvas');
    c.width = c.height = size;
    const k = Math.min(size / img.width, size / img.height), w = img.width * k, h = img.height * k;
    c.getContext('2d').drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    const tex = texture();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    return tex;
  }
  function setParts(images, lines) {
    parts.forEach((p) => { gl.deleteTexture(p.tex); if (p.line) gl.deleteTexture(p.line); });
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    parts = images.map((img, i) => ({ tex: upload(img, 2048), line: lines && lines[i] ? upload(lines[i], 1024) : null, centre: centreOf(img) }));
  }

  function render(frame, v, glowColor, pad = PAD) {
    const W = canvas.width, Hc = canvas.height;
    if (!parts.length || !W) return;
    if (!mask || mask.w !== W || mask.h !== Hc) { if (mask) { gl.deleteTexture(mask.tex); gl.deleteFramebuffer(mask.fbo); } mask = target(W, Hc); }
    const quad = () => gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    const pass = (prog, dst, src) => { gl.useProgram(prog.p); gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo); gl.viewport(0, 0, dst.w, dst.h); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src); gl.uniform1i(prog.u.uTex, 0); };

    gl.bindFramebuffer(gl.FRAMEBUFFER, mask.fbo);
    gl.viewport(0, 0, W, Hc);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(part.p);
    gl.uniform1i(part.u.uTex, 0); gl.uniform1i(part.u.uLine, 1); gl.uniform1f(part.u.uPad, pad);
    const whole = about(0.5, 0.5, mul(spin(frame.whole.spin), scale(Math.cos(rad(frame.whole.flip)), 1)));
    parts.forEach((pt, i) => {
      const f = frame.parts[i] || frame.parts[0];
      const m = mul(whole, mul(move(f.tx / 200, f.ty / 200), about(pt.centre[0], pt.centre[1], mul(spin(f.rot), scale(f.sc, f.sc)))));
      gl.uniformMatrix3fv(part.u.uM, false, m);
      gl.uniform1f(part.u.uOp, clamp(f.op));
      gl.uniform1f(part.u.uP, f.p);
      gl.uniform1f(part.u.uWipe, pt.line ? 0 : 1);
      gl.uniform2f(part.u.uC, pt.centre[0], pt.centre[1]);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, pt.line || pt.tex);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, pt.tex);
      quad();
    });
    gl.disable(gl.BLEND);

    let src = mask.tex;
    [1, 2, 4, 7].forEach((step) => {
      const reach = (0.9 * step * PAD) / (H * pad);
      [[soft[0], reach, 0], [soft[1], 0, reach]].forEach(([dst, x, y]) => {
        pass(blur, dst, src);
        gl.uniform2f(blur.u.uDir, x, y);
        quad();
        src = dst.tex;
      });
    });

    const flat = !(v.depth > 0), w = (0.015 + 0.2 * (v.depth / 100)) / pad;
    if (!flat) {
      pass(seed, field[0], mask.tex); quad();
      let from = 0;
      for (let step = D / 2; step >= 0.99; step = step > 1 ? Math.max(1, Math.floor(step / 2)) : 0) {
        pass(flood, field[1 - from], field[from].tex);
        gl.uniform2f(flood.u.uStep, step / D, step / D);
        quad();
        from = 1 - from;
      }
      pass(flood, field[1 - from], field[from].tex); gl.uniform2f(flood.u.uStep, 1 / D, 1 / D); quad(); from = 1 - from;

      pass(height, relief[0], field[from].tex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, mask.tex); gl.uniform1i(height.u.uMask, 1);
      gl.uniform1f(height.u.uW, w); gl.uniform1f(height.u.uTexel, 1 / D);
      quad();
      [[relief[1], relief[0], 1 / D, 0], [relief[0], relief[1], 0, 1 / D], [relief[1], relief[0], 1.6 / D, 0], [relief[0], relief[1], 0, 1.6 / D]].forEach(([dst, from2, x, y]) => {
        pass(blur, dst, from2.tex);
        gl.uniform2f(blur.u.uDir, x, y);
        quad();
      });
      pass(slope, relief[1], relief[0].tex);
      gl.uniform1f(slope.u.uW, w); gl.uniform1f(slope.u.uTexel, 1 / D);
      quad();
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, Hc);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(glass.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, mask.tex); gl.uniform1i(glass.u.uMask, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, relief[1].tex); gl.uniform1i(glass.u.uSlope, 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, soft[1].tex); gl.uniform1i(glass.u.uSoft, 2);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1f(glass.u.uPad, pad);
    gl.uniform1f(glass.u.uFlat, flat ? 1 : 0);
    gl.uniform1f(glass.u.uDepth, v.depth / 100);
    gl.uniform1f(glass.u.uMetal, v.metal / 100);
    gl.uniform1f(glass.u.uRefract, v.refract / 100);
    gl.uniform1f(glass.u.uDisperse, v.disperse / 100);
    gl.uniform1f(glass.u.uFlow, v.flow / 100);
    gl.uniform1f(glass.u.uGloss, v.gloss / 100);
    gl.uniform1f(glass.u.uSheen, v.sheen / 100);
    gl.uniform1f(glass.u.uPhase, frame.whole.g);
    gl.uniform1f(glass.u.uHue, rad(frame.whole.hue));
    gl.uniform1f(glass.u.uGlow, clamp(frame.whole.glow / 40));
    gl.uniform1f(glass.u.uBlur, clamp(frame.whole.blur / 12));
    gl.uniform3fv(glass.u.uGlowColor, hex(glowColor));
    quad();
  }

  return { setParts, render, get ready() { return parts.length > 0; } };
}

const SHADERS = { QUAD_VS, PART_VS, PART_FS, BLUR_FS, SEED_FS, FLOOD_FS, HEIGHT_FS, SLOPE_FS, GLASS_FS };

export { PAD, SHADERS, createMaterial };
