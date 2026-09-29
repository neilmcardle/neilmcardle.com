const VERTEX_SHADER = `#version 300 es
void main() {
  vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}
`;

const FIELD_SHADER = `#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform float uLightMode;
uniform vec3 uDarkBackground;
uniform vec3 uLightBackground;
out vec4 fragColor;

const float HUE = 0.887393177;
const float HUE_SPREAD = -0.429194331;
const float HUE_TRAVEL = 1.45236635;
const float CHROMA = 0.119823761;
const float LIGHTNESS = 0.530169189;
const float COLOUR_CYCLE = 0.117324248;
const float THETA = 2.14230061;
const float SHEAR = 0.965145826;
const float SHRINK = 0.94932425;
const float LAYERS = 84.0;
const float WARP_FREQ_X = 0.470247269;
const float WARP_FREQ_Y = 2.20657897;
const float WARP_AMP_X = 0.124594621;
const float WARP_AMP_Y = 0.0251522921;
const float ASPECT_X = 1.94209421;
const float ASPECT_Y = 0.151666805;
const float OFFSET_X = 0.330082387;
const float OFFSET_Y = 0.0531095564;
const float TILT = -0.921059072;
const float ZOOM = 1.03183949;
const float CENTRE_X = 0.462641984;
const float CENTRE_Y = -0.340821296;
const float GLOW_SIZE = 0.00271344138;
const float FALLOFF = 0.360908926;
const float VIGNETTE = 0.0491423756;
const float FLOW_SPEED = 0.608192623;
const float FLOW_DIRECTION = 1.0;
const float BREATH_RATE = 0.591359556;
const float BREATH_AMOUNT = 0.10069073;
const float PHASE = 74.2924652;
const float ECHO = 0.0;
const float ECHO_SHIFT = 0.213882744;
const float SOFTNESS = 0.00219198084;
const float LIGHT_SWING = 0.174020559;

const float TAU = 6.28318530718;

vec3 oklchToLinear(float L, float C, float h) {
  float a = C * cos(h), b = C * sin(h);
  float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  float s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  vec3 lms = vec3(l_, m_, s_);
  lms = lms * lms * lms;
  return mat3(4.0767416621, -1.2684380046, -0.0041960863,
              -3.3077115913, 2.6097574011, -0.7034186147,
              0.2309699292, -0.3413193965, 1.7076147010) * lms;
}

float blueNoise(vec2 p, float frame) {
  p += 5.588238 * mod(frame, 64.0);
  return fract(52.9829189 * fract(0.06711056 * p.x + 0.00583715 * p.y));
}

void main() {
  vec2 R = iResolution.xy;
  vec2 pos = (gl_FragCoord.xy - 0.5 * R) / R.y;
  float t = iTime * FLOW_SPEED * FLOW_DIRECTION + PHASE;
  float breath = (-sin(iTime * BREATH_RATE * 1.5) + sin(iTime * BREATH_RATE + 1.0)) * 0.25 + 0.5;

  vec2 u = (pos - vec2(CENTRE_X, CENTRE_Y)) * (ZOOM - breath * BREATH_AMOUNT);
  float ct = cos(TILT), st = sin(TILT);
  u = mat2(ct, st, -st, ct) * u;

  mat2 fold = mat2(cos(THETA), sin(THETA), -SHEAR, cos(THETA));

  float hue0 = HUE * TAU;
  float hue1 = hue0 + HUE_SPREAD * TAU;
  vec3 color = vec3(0.0);

  for (float i = 1.0; i <= 96.0; i += 1.0) {
    if (i > LAYERS) break;
    u.x += -sin(u.y * WARP_FREQ_X + t + i * 0.007) * WARP_AMP_X;
    u.y += -sin(u.x * WARP_FREQ_Y - t + i * 0.02) * WARP_AMP_Y;
    u = fold * u * SHRINK;

    vec2 q = u - vec2(OFFSET_X + breath * 0.1, OFFSET_Y);
    vec2 s = vec2(q.x * ASPECT_X, q.y * ASPECT_Y);
    float glow = GLOW_SIZE / (dot(s, s) + SOFTNESS);
#ifndef SKIP_ECHO
    vec2 e = vec2((q.x - ECHO_SHIFT) * ASPECT_X, s.y);
    glow += ECHO * GLOW_SIZE / (dot(e, e) + SOFTNESS);
#endif
    glow *= 0.25 + breath * 0.4;

    float r = length(u);
    float k = sin(i * COLOUR_CYCLE + t * 1.2 + r * HUE_TRAVEL) * 0.5 + 0.5;
    vec3 tint = clamp(oklchToLinear(LIGHTNESS + LIGHT_SWING * k, CHROMA * (0.75 + 0.35 * k), mix(hue0, hue1, k)), 0.0, 1.0);
    color += glow * tint * exp2(-r * FALLOFF);
  }

  vec3 x = max(color, 0.0);
  color = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
  color = pow(clamp(color, 0.0, 1.0), vec3(0.85, 0.92, 0.98));

  float edge = smoothstep(0.5, 1.6, length(pos));
  color *= 1.0 - edge * VIGNETTE;

  vec3 dark = uDarkBackground + color * (1.0 - uDarkBackground);
  float strength = max(color.r, max(color.g, color.b));
  vec3 light = uLightBackground * (1.0 - strength) + color * 0.96;
  color = mix(dark, light, uLightMode);

  color += (blueNoise(gl_FragCoord.xy, floor(iTime * 24.0)) - 0.5) / 255.0;
  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

const MAX_PIXELS = 2400000;
const MAX_SCALE = 1;
const THEME_EASE = 12;
const SPEED = 0.35;

export type GlowShader = {
  setPaused(next: boolean): void;
  setTheme(next: "dark" | "light", instant?: boolean): void;
  destroy(): void;
};

function parseHex(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match)
    throw new Error(`Background colours must be #rrggbb, got "${hex}".`);
  const channel = (i: number) => parseInt(match[1].slice(i, i + 2), 16) / 255;
  return [channel(0), channel(2), channel(4)];
}

function attach(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("WebGL could not create a shader object.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Shader failed to compile: ${gl.getShaderInfoLog(shader)}`);
  }
  gl.attachShader(program, shader);
  gl.deleteShader(shader);
}

function compile(gl: WebGL2RenderingContext) {
  const program = gl.createProgram();
  if (!program) throw new Error("WebGL could not create a program.");
  attach(gl, program, gl.VERTEX_SHADER, VERTEX_SHADER);
  attach(gl, program, gl.FRAGMENT_SHADER, FIELD_SHADER);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Shader failed to link: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

function context(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) throw new Error("WebGL2 is not available in this browser.");
  return gl;
}

export function createGlowShader(
  canvas: HTMLCanvasElement,
  options: {
    background?: { dark?: string; light?: string };
    paused?: boolean;
    theme?: "dark" | "light";
  } = {},
): GlowShader {
  const gl = context(canvas);
  const darkGround = parseHex(options.background?.dark ?? "#090909");
  const lightGround = parseHex(options.background?.light ?? "#ffffff");
  const program = compile(gl);
  const locations = {
    resolution: gl.getUniformLocation(program, "iResolution"),
    time: gl.getUniformLocation(program, "iTime"),
    lightMode: gl.getUniformLocation(program, "uLightMode"),
    dark: gl.getUniformLocation(program, "uDarkBackground"),
    light: gl.getUniformLocation(program, "uLightBackground"),
  };
  const maxDimension = Math.min(
    gl.getParameter(gl.MAX_TEXTURE_SIZE),
    gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
  );

  let resolution = window.matchMedia(
    `(resolution: ${window.devicePixelRatio || 1}dppx)`,
  );
  let deviceRatio = window.devicePixelRatio || 1;
  let width = canvas.clientWidth;
  let height = canvas.clientHeight;
  let visible = true;
  let disposed = false;
  let paused = options.paused ?? false;
  let frame = 0;
  let elapsed = 0;
  let previous: number | null = null;
  let target = options.theme === "light" ? 1 : 0;
  let mode = target;

  function canDraw() {
    return !disposed && !document.hidden && visible && width > 0 && height > 0;
  }

  function moving() {
    return !paused;
  }

  function draw() {
    const scale = Math.min(
      deviceRatio,
      MAX_SCALE,
      Math.sqrt(MAX_PIXELS / (width * height)),
      maxDimension / width,
      maxDimension / height,
    );
    const w = Math.max(1, Math.floor(width * scale));
    const h = Math.max(1, Math.floor(height * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.useProgram(program);
    gl.uniform2f(locations.resolution, w, h);
    gl.uniform1f(locations.time, elapsed);
    gl.uniform1f(locations.lightMode, mode);
    gl.uniform3fv(locations.dark, darkGround);
    gl.uniform3fv(locations.light, lightGround);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!canvas.hasAttribute("data-ready"))
      canvas.setAttribute("data-ready", "");
  }

  function schedule() {
    if (!frame && canDraw()) frame = requestAnimationFrame(tick);
  }

  function refresh() {
    if (!canDraw()) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = null;
    } else schedule();
  }

  function tick(now: number) {
    frame = 0;
    if (!canDraw()) {
      previous = null;
      return;
    }
    const delta =
      previous === null ? 0 : Math.min((now - previous) / 1000, 0.1);
    previous = now;
    if (moving()) elapsed += delta * SPEED;
    if (mode !== target) {
      mode += (target - mode) * (1 - Math.exp(-delta * THEME_EASE));
      if (Math.abs(target - mode) < 0.002) mode = target;
    }
    try {
      draw();
    } catch (error) {
      destroy();
      console.error(error);
      return;
    }
    if (moving() || mode !== target) schedule();
    else previous = null;
  }

  function pixelRatioChanged() {
    if (disposed) return;
    const next = window.devicePixelRatio || 1;
    if (deviceRatio === next) return;
    deviceRatio = next;
    resolution.removeEventListener("change", pixelRatioChanged);
    resolution = window.matchMedia(`(resolution: ${next}dppx)`);
    resolution.addEventListener("change", pixelRatioChanged);
    refresh();
  }

  const sizer = new ResizeObserver(([entry]) => {
    if (disposed || !entry) return;
    const next = entry.contentRect;
    if (width === next.width && height === next.height) return;
    width = next.width;
    height = next.height;
    refresh();
  });
  const watcher = new IntersectionObserver(([entry]) => {
    if (disposed || !entry || visible === entry.isIntersecting) return;
    visible = entry.isIntersecting;
    refresh();
  });

  function destroy() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    frame = 0;
    sizer.disconnect();
    watcher.disconnect();
    resolution.removeEventListener("change", pixelRatioChanged);
    document.removeEventListener("visibilitychange", refresh);
    window.removeEventListener("resize", pixelRatioChanged);
    gl.deleteProgram(program);
  }

  sizer.observe(canvas);
  watcher.observe(canvas);
  resolution.addEventListener("change", pixelRatioChanged);
  document.addEventListener("visibilitychange", refresh);
  window.addEventListener("resize", pixelRatioChanged);
  schedule();

  return {
    setPaused(next) {
      if (disposed || paused === next) return;
      paused = next;
      refresh();
    },
    setTheme(next, instant = false) {
      if (disposed) return;
      target = next === "light" ? 1 : 0;
      if (paused || instant) mode = target;
      refresh();
    },
    destroy,
  };
}
