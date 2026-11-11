const LITTLE_ENDIAN = (() => {
  const probe = new Uint32Array(1);
  new Uint8Array(probe.buffer)[0] = 1;
  return probe[0] === 1;
})();

export function rgba(r, g, b, a = 255) {
  if (LITTLE_ENDIAN) return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
  return ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
}

export function fromHex(hex, a = 255) {
  const value = parseInt(hex.slice(1), 16);
  return rgba((value >> 16) & 255, (value >> 8) & 255, value & 255, a);
}

function unpack(color) {
  if (LITTLE_ENDIAN) {
    return [
      color & 255,
      (color >> 8) & 255,
      (color >> 16) & 255,
      (color >>> 24) & 255,
    ];
  }
  return [
    (color >>> 24) & 255,
    (color >> 16) & 255,
    (color >> 8) & 255,
    color & 255,
  ];
}

export class Pix {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.image = ctx.createImageData(width, height);
    this.data = new Uint32Array(this.image.data.buffer);
  }

  clear() {
    this.data.fill(0);
  }

  set(x, y, color) {
    const px = x | 0;
    const py = y | 0;
    if (px < 0 || py < 0 || px >= this.width || py >= this.height) return;
    this.data[py * this.width + px] = color;
  }

  blend(x, y, color, alpha) {
    const px = x | 0;
    const py = y | 0;
    if (px < 0 || py < 0 || px >= this.width || py >= this.height) return;
    const index = py * this.width + px;
    const [dr, dg, db, da] = unpack(this.data[index]);
    const [sr, sg, sb] = unpack(color);
    const dstA = da / 255;
    const outA = alpha + dstA * (1 - alpha);
    if (outA <= 0) {
      this.data[index] = 0;
      return;
    }
    const mix = (s, d) =>
      Math.round((s * alpha + d * dstA * (1 - alpha)) / outA);
    this.data[index] = rgba(
      mix(sr, dr),
      mix(sg, dg),
      mix(sb, db),
      Math.round(outA * 255),
    );
  }

  block(x, y, w, h, color) {
    for (let oy = 0; oy < h; oy += 1) {
      for (let ox = 0; ox < w; ox += 1) {
        this.set(x + ox, y + oy, color);
      }
    }
  }

  row(x0, x1, y, color) {
    const from = Math.round(Math.min(x0, x1));
    const to = Math.round(Math.max(x0, x1));
    for (let x = from; x <= to; x += 1) this.set(x, y, color);
  }

  flush() {
    this.ctx.putImageData(this.image, 0, 0);
  }
}

export function strokeThin(pix, x0, y0, x1, y1, color) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) * 2));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    pix.set(Math.round(x0 + dx * t), Math.round(y0 + dy * t), color);
  }
}
