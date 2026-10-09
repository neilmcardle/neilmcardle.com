export const INK = "#111111";

export const VERTEX = `
uniform float uForm[COUNT];
uniform vec2 uCenter[COUNT];
uniform float uScale;
uniform float uTime;
uniform float uDot;
attribute float icon;
attribute vec2 logo;
attribute vec3 sphere;
attribute float rnd;
varying float vAlpha;

vec3 flow(vec3 x, float t) {
  return vec3(
    sin(x.y * 1.7 + t) + sin(x.z * 2.3 - t * 0.7),
    sin(x.z * 1.3 + t * 1.1) + sin(x.x * 2.1 + t * 0.5),
    sin(x.x * 1.9 - t * 0.9) + sin(x.y * 1.1 + t * 0.3)
  ) * 0.5;
}

void main() {
  int i = int(icon + 0.5);
  float f = uForm[i];
  float spin = uTime * 0.12 + icon * 0.9;
  float c = cos(spin);
  float s = sin(spin);
  float spread = 0.3 + 0.7 * pow(fract(rnd * 7.31), 0.7);
  vec3 p = sphere * spread;
  p = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  p += flow(p * 1.2 + icon * 1.7, uTime * 0.2) * 0.3;
  p += flow(vec3(rnd * 6.0, fract(rnd * 3.7) * 4.0, icon), uTime * 0.42) * 0.14;
  p += flow(p * 2.4 - icon, uTime * 0.3) * 0.06;
  float along = clamp(logo.x + 0.5, 0.0, 1.0);
  float k = clamp(f * 1.6 - along * 0.45 - rnd * 0.15, 0.0, 1.0);
  float e = k * k * (3.0 - 2.0 * k);
  vec2 swirl = flow(vec3(logo * 3.0, icon), uTime * 0.8).xy * 0.16 * sin(e * 3.14159);
  vec2 local = mix(p.xy * 0.46, logo, e) + swirl;
  vec2 pos = uCenter[i] + local * uScale;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
  float depth = clamp(p.z * 0.5 + 0.5, 0.0, 1.0);
  float haze = (0.2 + 0.42 * depth) * (1.0 - 0.5 * spread * spread);
  gl_PointSize = uDot * mix(0.55 + 0.35 * depth, 0.95, e);
  vAlpha = mix(haze, 0.9, e);
}
`;

export const FRAGMENT = `
uniform vec3 uInk;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.28, d) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uInk, a);
}
`;
