import { makeRng, range } from "./rng.js";
import { fromHex } from "./pix.js";

const DEG = Math.PI / 180;
const LIGHT_X = -0.45;
const LIGHT_Y = -0.89;

function packPalette(palette) {
  return {
    bark: palette.bark.map((hex) => fromHex(hex)),
    dead: palette.dead.map((hex) => fromHex(hex)),
    leaf: palette.leaf.map((hex) => fromHex(hex)),
    accent: fromHex(palette.accent),
    pot: palette.pot.map((hex) => fromHex(hex)),
    soil: palette.soil.map((hex) => fromHex(hex)),
    moss: fromHex(palette.moss),
  };
}

export function growBonsai(species) {
  const rng = makeRng(species.seed);
  const nodes = [];
  const pads = [];
  const growth = species.growth;
  const scale = growth.scale ?? 1;
  const widthScale = growth.widthScale ?? 1;

  function addNode(parent, angle, length, width, depth, dead) {
    nodes.push({
      parent,
      angle: angle * DEG,
      length,
      width,
      depth,
      dead: Boolean(dead),
      phase: rng() * Math.PI * 2,
      freq: range(rng, 0.78, 1.32),
      grain: rng() * 1000,
      tip: false,
      twig: false,
      restAngle: 0,
      restX: 0,
      restY: 0,
      worldAngle: 0,
      delta: 0,
      baseX: 0,
      baseY: 0,
      x: 0,
      y: 0,
    });
    return nodes.length - 1;
  }

  function growBranch(
    parent,
    angle,
    length,
    width,
    depth,
    outward,
    maxDepth,
    dead,
  ) {
    const index = addNode(parent, angle, length, width, depth, dead);
    if (depth >= maxDepth) {
      nodes[index].tip = true;
      if (!dead) pads.push(index);
      for (let i = 0; i < 2; i += 1) {
        const side = i === 0 ? -1 : 1;
        const twigAngle =
          side * growth.childSpread * range(rng, 0.7, 1.4) -
          outward * growth.childLift * 0.4;
        const twig = addNode(
          index,
          twigAngle,
          length * range(rng, 0.38, 0.6),
          1,
          depth + 1,
          dead,
        );
        nodes[twig].tip = true;
        nodes[twig].twig = true;
      }
      return;
    }
    for (let i = 0; i < 2; i += 1) {
      const side = i === 0 ? -1 : 1;
      const childAngle =
        side * growth.childSpread * range(rng, 0.55, 1.15) -
        outward * growth.childLift;
      growBranch(
        index,
        childAngle,
        length * growth.childFalloff,
        Math.max(1, width * growth.childTaper),
        depth + 1,
        outward,
        maxDepth,
        dead,
      );
    }
  }

  const trunk = [];
  let parent = -1;
  growth.trunk.forEach((segment) => {
    const index = addNode(
      parent,
      segment.angle,
      segment.length * scale,
      segment.width * widthScale,
      0,
      false,
    );
    trunk.push(index);
    parent = index;
  });

  growth.branches.forEach((spec) => {
    const host = trunk[Math.min(spec.at, trunk.length - 1)];
    growBranch(
      host,
      spec.angle,
      spec.length * scale,
      spec.width * widthScale,
      1,
      Math.sign(spec.angle) || 1,
      spec.maxDepth ?? growth.maxDepth,
      spec.dead,
    );
  });

  pads.push(trunk[trunk.length - 1]);

  nodes.forEach((node) => {
    const host = node.parent >= 0 ? nodes[node.parent] : null;
    node.restAngle = (host ? host.restAngle : 0) + node.angle;
    const baseX = host ? host.restX : 0;
    const baseY = host ? host.restY : 0;
    node.restX = baseX + Math.sin(node.restAngle) * node.length;
    node.restY = baseY - Math.cos(node.restAngle) * node.length;
  });

  const leaves = [];
  pads.forEach((padIndex) => {
    const radiusX = range(
      rng,
      species.pad.radiusX * 0.78,
      species.pad.radiusX * 1.24,
    );
    const radiusY = range(
      rng,
      species.pad.radiusY * 0.8,
      species.pad.radiusY * 1.25,
    );
    const offsetX = range(rng, -2.5, 2.5);
    const offsetY = range(rng, -radiusY * 0.55, -radiusY * 0.25);
    const cell = species.pad.cell;
    const edge = species.pad.edge ?? 0.3;
    const lip = species.pad.lip ?? 0.5;
    for (let oy = -Math.ceil(radiusY); oy <= Math.ceil(radiusY); oy += cell) {
      for (let ox = -Math.ceil(radiusX); ox <= Math.ceil(radiusX); ox += cell) {
        const nx = ox / radiusX;
        const ny = oy / radiusY;
        const distance = nx * nx + ny * ny;
        if (distance > 1) continue;
        if (rng() > species.pad.density - distance * edge) continue;
        const lit = nx * LIGHT_X + ny * LIGHT_Y;
        let shade = lit > 0.42 ? 0 : lit > -0.16 ? 1 : 2;
        if (rng() < 0.16)
          shade = Math.min(2, Math.max(0, shade + (rng() < 0.5 ? -1 : 1)));
        if (ny > lip) shade = 2;
        leaves.push({
          node: padIndex,
          ox: offsetX + ox,
          oy: offsetY + oy,
          shade,
          accent: rng() < species.pad.accentChance,
          detached: false,
          showAt: 0,
        });
      }
    }
  });

  let minX = 0;
  let maxX = 0;
  let minY = 0;
  leaves.forEach((cell) => {
    const host = nodes[cell.node];
    const x = host.restX + cell.ox;
    const y = host.restY + cell.oy;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
  });

  const roots = growth.roots.map((root, index) => ({
    fromX: root.from * scale * 0.8,
    toX: root.to * scale * 0.8,
    width: root.width * widthScale,
    grain: index * 23.7 + 11.3,
  }));

  const moss = [];
  for (let i = 0; i < 34; i += 1) {
    moss.push({
      dx: Math.round(
        range(rng, -species.pot.width / 2 + 7, species.pot.width / 2 - 7),
      ),
      dy: Math.round(range(rng, 0, 2)),
    });
  }

  return {
    species,
    nodes,
    pads,
    leaves,
    roots,
    moss,
    origin: { x: 0, y: 0 },
    balance: -Math.round((minX + maxX) / 2),
    reach: {
      left: Math.round(minX),
      right: Math.round(maxX),
      top: Math.round(minY),
    },
    colors: packPalette(species.palette),
    shake: { energy: 0, direction: 1 },
    shed: 0,
    regrowCursor: 0,
    falling: [],
    resting: [],
  };
}
