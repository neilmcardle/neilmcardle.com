import { strokeThin, rgba, fromHex } from "./pix.js";

const LIGHT_X = -0.45;
const LIGHT_Y = -0.89;

const FLOOR = {
  dark: [fromHex("#6d6356"), fromHex("#4b443a"), fromHex("#332e27")],
  light: [fromHex("#e4dacd"), fromHex("#cdc0af"), fromHex("#b6a893")],
};

const SHADOW = { dark: rgba(10, 8, 6), light: rgba(40, 32, 24) };

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((value) => (value + 0.5) / 16));

function dithered(x, y, level) {
  return level > BAYER[y & 3][x & 3];
}

function rimTopOf(species) {
  return species.rootHeight - 2;
}

export function potBottom(species) {
  const pot = species.pot;
  return rimTopOf(species) + pot.rimHeight + pot.bodyHeight + pot.footHeight;
}

export function computePose(tree, time, wind) {
  const sway = tree.species.sway;
  const shake = tree.shake;
  for (const node of tree.nodes) {
    const host = node.parent >= 0 ? tree.nodes[node.parent] : null;
    const amp = sway.amplitude[Math.min(node.depth, sway.amplitude.length - 1)];
    const oscillation = Math.sin(time * sway.rate * node.freq + node.phase);
    const shaken =
      shake.energy > 0.001
        ? amp *
          shake.energy *
          2.6 *
          Math.sin(time * 12.5 + node.phase) *
          shake.direction
        : 0;
    const offset =
      amp * wind.strength * oscillation * wind.direction +
      amp * wind.lean * 1.5 +
      shaken;
    node.worldAngle = (host ? host.worldAngle : 0) + node.angle + offset;
    node.baseX = host ? host.x : tree.origin.x;
    node.baseY = host ? host.y : tree.origin.y;
    node.x = node.baseX + Math.sin(node.worldAngle) * node.length;
    node.y = node.baseY - Math.cos(node.worldAngle) * node.length;
    node.delta = node.worldAngle - node.restAngle;
  }
}

function grainNoise(seed, x) {
  const v = Math.sin(seed * 12.9898 + x * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function limb(pix, x0, y0, x1, y1, w0, w1, grain, light, mid, dark) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const span = Math.hypot(dx, dy) || 1;
  const nx = -dy / span;
  const ny = dx / span;
  const lit = nx * LIGHT_X + ny * LIGHT_Y >= 0;
  const steps = Math.max(1, Math.ceil(span * 2));

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const wobble =
      grainNoise(grain, t * 6.1) * 0.6 + grainNoise(grain + 7.3, t * 2.3) * 0.4;
    const width = Math.max(1, (w0 + (w1 - w0) * t) * (0.9 + wobble * 0.2));
    const count = Math.max(1, Math.round(width));
    const first = -Math.floor((count - 1) / 2);
    const last = first + count - 1;
    const litEdge = lit ? last : first;
    const darkEdge = lit ? first : last;
    const cx = x0 + dx * t;
    const cy = y0 + dy * t;

    for (let offset = first; offset <= last; offset += 1) {
      let color = mid;
      if (count === 1) {
        color = mid;
      } else if (offset === litEdge) {
        color = grainNoise(grain + 1.7, t * 9.3) > 0.26 ? light : mid;
      } else if (offset === darkEdge) {
        color = grainNoise(grain + 4.9, t * 7.1) > 0.14 ? dark : mid;
      } else if (
        count >= 5 &&
        grainNoise(grain + 3.1, offset * 3.3 + Math.floor(t * 5) * 1.7) > 0.72
      ) {
        color = dark;
      }
      pix.set(
        Math.round(cx + nx * offset),
        Math.round(cy + ny * offset),
        color,
      );
    }
  }
}

function drawFloor(pix, tree, groundY, theme) {
  const tones = FLOOR[theme] ?? FLOOR.light;
  const centerX = tree.origin.x;
  const reach = Math.max(110, pix.width * 0.34);
  for (let y = groundY; y < pix.height; y += 1) {
    const depth = y - groundY;
    const tone = depth === 0 ? tones[0] : depth < 5 ? tones[1] : tones[2];
    for (let x = 0; x < pix.width; x += 1) {
      const falloff = 1 - Math.min(1, Math.abs(x - centerX) / reach);
      if (falloff <= 0) continue;
      const level = Math.pow(falloff, 1.5) * (depth === 0 ? 1 : 0.88);
      if (!dithered(x, y, level)) continue;
      pix.set(x, y, tone);
    }
  }
}

function drawShadow(pix, tree, groundY, theme) {
  const pot = tree.species.pot;
  const centerX = tree.origin.x + pot.offsetX;
  const color = SHADOW[theme] ?? SHADOW.light;
  for (let y = 0; y < 7; y += 1) {
    const spread = pot.width * 0.6 * (1 - y / 9);
    for (let x = -spread; x <= spread * 1.6; x += 1) {
      const px = Math.round(centerX + x);
      const edge = 1 - Math.min(1, Math.abs(x) / (spread * 1.4 || 1));
      const level = edge * (0.8 - y * 0.1);
      if (!dithered(px, groundY + y, level)) continue;
      pix.blend(px, groundY + y, color, 0.72);
    }
  }
}

function drawPot(pix, tree, skeleton, ink) {
  const pot = tree.species.pot;
  const glaze = tree.colors.pot;
  const centerX = tree.origin.x + pot.offsetX;
  const half = Math.floor(pot.width / 2);
  const left = centerX - half;
  const right = centerX + half;
  const rimTop = tree.origin.y + rimTopOf(tree.species);
  const rimBottom = rimTop + pot.rimHeight;
  const bodyEnd = rimBottom + pot.bodyHeight;
  const footEnd = bodyEnd + pot.footHeight;

  if (skeleton) {
    pix.row(left, right, rimTop, ink);
    pix.row(left + 2 + pot.bodyInset, right - 2 - pot.bodyInset, bodyEnd, ink);
    strokeThin(pix, left, rimTop, left + 2 + pot.bodyInset, bodyEnd, ink);
    strokeThin(pix, right, rimTop, right - 2 - pot.bodyInset, bodyEnd, ink);
    return;
  }

  for (let y = rimTop; y < rimBottom; y += 1) {
    const step = y - rimTop;
    const tone =
      step === 0
        ? glaze[1]
        : step === 1
          ? glaze[2]
          : step >= pot.rimHeight - 1
            ? glaze[4]
            : glaze[3];
    pix.row(left, right, y, tone);
  }
  for (let x = left; x <= right; x += 1) {
    const along =
      1 - Math.abs(x - (left + pot.width * 0.34)) / (pot.width * 0.5);
    if (along > 0.1 && dithered(x, rimTop, along)) pix.set(x, rimTop, glaze[0]);
  }

  const specularX = left + Math.round(pot.width * 0.24);
  for (let y = rimBottom; y < bodyEnd; y += 1) {
    const t = (y - rimBottom) / Math.max(1, pot.bodyHeight - 1);
    const inset = Math.round(2 + pot.bodyInset * t);
    const rowLeft = left + inset;
    const rowRight = right - inset;
    pix.row(
      rowLeft,
      rowRight,
      y,
      t > 0.78 ? glaze[4] : t > 0.44 ? glaze[3] : glaze[2],
    );

    const sheen = Math.max(0, 1 - t / 0.72);
    if (sheen > 0) {
      for (let k = -3; k <= 3; k += 1) {
        const x = specularX + k;
        const core = sheen * (1 - Math.abs(k) * 0.22);
        if (!dithered(x, y, core)) continue;
        pix.set(x, y, Math.abs(k) <= 1 && core > 0.68 ? glaze[0] : glaze[1]);
      }
    }
    if (t < 0.46 && dithered(rowRight - 1, y, 0.5 - t))
      pix.set(rowRight - 1, y, glaze[2]);

    const wrap = Math.max(0, 1 - t / 0.8);
    if (wrap > 0.08) {
      pix.set(rowLeft, y, glaze[1]);
      if (dithered(rowLeft + 1, y, wrap * 0.7))
        pix.set(rowLeft + 1, y, glaze[2]);
    } else {
      pix.set(rowLeft, y, glaze[3]);
    }

    pix.set(rowRight, y, glaze[4]);
    if (t > 0.9) pix.row(rowLeft + 2, rowRight - 2, y, glaze[3]);
  }

  pix.row(
    left + 2 + pot.bodyInset,
    right - 2 - pot.bodyInset,
    bodyEnd - 1,
    glaze[2],
  );

  for (let y = bodyEnd; y < footEnd; y += 1) {
    pix.row(
      centerX - pot.footInset - pot.footWidth,
      centerX - pot.footInset,
      y,
      glaze[4],
    );
    pix.row(
      centerX + pot.footInset,
      centerX + pot.footInset + pot.footWidth,
      y,
      glaze[4],
    );
  }

  const soilTop = tree.origin.y + rimTopOf(tree.species);
  for (let y = soilTop; y < soilTop + 4; y += 1) {
    for (let x = left + 5; x <= right - 5; x += 1) {
      pix.set(
        x,
        y,
        (x + y) % 3 === 0 ? tree.colors.soil[1] : tree.colors.soil[0],
      );
    }
  }

  tree.moss.forEach((spot) => {
    pix.set(centerX + spot.dx, soilTop + spot.dy, tree.colors.moss);
  });
}

function drawRoots(pix, tree, skeleton, ink) {
  const colors = tree.colors;
  const soilY = tree.origin.y + tree.species.rootHeight;
  if (skeleton) {
    tree.roots.forEach((root) => {
      strokeThin(
        pix,
        tree.origin.x + root.fromX,
        tree.origin.y - 2,
        tree.origin.x + root.toX,
        soilY + 2,
        ink,
      );
    });
    return;
  }
  tree.roots.forEach((root) => {
    limb(
      pix,
      tree.origin.x + root.fromX,
      tree.origin.y - 2,
      tree.origin.x + root.toX,
      soilY + 2,
      root.width,
      Math.max(2, root.width * 0.6),
      root.grain,
      colors.bark[0],
      colors.bark[1],
      colors.bark[2],
    );
  });
}

function drawBranches(pix, tree, skeleton, ink, joint) {
  for (const node of tree.nodes) {
    if (skeleton) {
      strokeThin(pix, node.baseX, node.baseY, node.x, node.y, ink);
      continue;
    }
    const bark = node.dead ? tree.colors.dead : tree.colors.bark;
    limb(
      pix,
      node.baseX,
      node.baseY,
      node.x,
      node.y,
      node.width,
      node.tip ? 1 : node.width * 0.78,
      node.grain,
      bark[0],
      bark[1],
      node.dead ? bark[1] : bark[2],
    );
  }
  if (!skeleton) return;
  for (const node of tree.nodes) {
    pix.block(Math.round(node.x) - 1, Math.round(node.y) - 1, 2, 2, joint);
  }
}

function drawFoliage(pix, tree, time) {
  const cell = tree.species.pad.cell;
  for (const leaf of tree.leaves) {
    if (leaf.detached || leaf.showAt > time) continue;
    const host = tree.nodes[leaf.node];
    const cos = Math.cos(host.delta);
    const sin = Math.sin(host.delta);
    const x = host.x + leaf.ox * cos - leaf.oy * sin;
    const y = host.y + leaf.ox * sin + leaf.oy * cos;
    const size = time - leaf.showAt < 0.16 ? 1 : cell;
    pix.block(
      Math.round(x),
      Math.round(y),
      size,
      size,
      leaf.accent ? tree.colors.accent : tree.colors.leaf[leaf.shade],
    );
  }
}

function drawLoose(pix, tree, skeleton) {
  const cell = skeleton ? 1 : tree.species.pad.cell;
  for (const leaf of tree.falling) {
    pix.block(Math.round(leaf.x), Math.round(leaf.y), cell, cell, leaf.color);
  }
  for (const rest of tree.resting) {
    pix.block(Math.round(rest.x), Math.round(rest.y), cell, cell, rest.color);
  }
}

export function renderScene(pix, tree, options) {
  const { time, theme, skeleton, groundY } = options;
  const ink = theme === "dark" ? rgba(122, 162, 255) : rgba(47, 109, 246);
  const joint = theme === "dark" ? rgba(244, 244, 245) : rgba(22, 22, 26);
  pix.clear();
  if (!skeleton) {
    drawFloor(pix, tree, groundY, theme);
    drawShadow(pix, tree, groundY, theme);
  }
  drawRoots(pix, tree, skeleton, ink);
  drawPot(pix, tree, skeleton, ink);
  drawBranches(pix, tree, skeleton, ink, joint);
  if (!skeleton) drawFoliage(pix, tree, time);
  drawLoose(pix, tree, skeleton);
  pix.flush();
}
