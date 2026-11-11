const MAX_RESTING = 520;

function worldPosition(tree, cell) {
  const host = tree.nodes[cell.node];
  const cos = Math.cos(host.delta);
  const sin = Math.sin(host.delta);
  return {
    x: host.x + cell.ox * cos - cell.oy * sin,
    y: host.y + cell.ox * sin + cell.oy * cos,
  };
}

function release(tree, cell, direction) {
  const point = worldPosition(tree, cell);
  cell.detached = true;
  tree.falling.push({
    x: point.x,
    y: point.y,
    vx: direction * (5 + Math.random() * 11),
    vy: -5 + Math.random() * 9,
    color: cell.accent ? tree.colors.accent : tree.colors.leaf[cell.shade],
    phase: Math.random() * Math.PI * 2,
    flutterRate: 2.4 + Math.random() * 3.6,
    drift: 0.55 + Math.random() * 0.9,
  });
}

export function shedFraction(tree, fraction, direction, time) {
  let count = 0;
  for (const cell of tree.leaves) {
    if (cell.detached || cell.showAt > time) continue;
    if (Math.random() > fraction) continue;
    release(tree, cell, direction);
    count += 1;
  }
  return count;
}

export function shedNear(tree, x, y, radius, chance, direction, time) {
  const reach = radius * radius;
  let count = 0;
  for (const cell of tree.leaves) {
    if (cell.detached || cell.showAt > time) continue;
    const point = worldPosition(tree, cell);
    const dx = point.x - x;
    const dy = point.y - y;
    const distance = dx * dx + dy * dy;
    if (distance > reach) continue;
    const falloff = 1 - distance / reach;
    if (Math.random() > chance * falloff) continue;
    release(tree, cell, direction);
    count += 1;
  }
  return count;
}

export function regrowSome(tree, count, time) {
  const total = tree.leaves.length;
  if (total === 0) return 0;
  let done = 0;
  let scanned = 0;
  while (done < count && scanned < total) {
    const cell = tree.leaves[tree.regrowCursor];
    tree.regrowCursor = (tree.regrowCursor + 1) % total;
    scanned += 1;
    if (!cell.detached) continue;
    cell.detached = false;
    cell.showAt = time + Math.random() * 0.35;
    done += 1;
  }
  return done;
}

export function fadeLitter(tree, count) {
  for (let i = 0; i < count && tree.resting.length > 0; i += 1) {
    tree.resting.splice(Math.floor(Math.random() * tree.resting.length), 1);
  }
}

export function stepLeaves(tree, dt, time, wind, bounds) {
  const fall = tree.species.fall;

  for (let i = tree.falling.length - 1; i >= 0; i -= 1) {
    const leaf = tree.falling[i];
    leaf.vy = Math.min(leaf.vy + fall.gravity * dt, fall.terminal);
    leaf.vx += (wind.lean * fall.drift * 16 - leaf.vx) * Math.min(1, dt * 2.2);
    const flutter =
      Math.sin(time * leaf.flutterRate + leaf.phase) *
      fall.flutter *
      leaf.drift;
    leaf.x += (leaf.vx + flutter) * dt;
    leaf.y += leaf.vy * dt;

    const overPot = leaf.x > bounds.potLeft && leaf.x < bounds.potRight;
    const target = overPot ? bounds.soilY : bounds.groundY;
    if (leaf.y >= target) {
      tree.resting.push({
        x: Math.round(leaf.x),
        y: Math.round(target) - Math.round(Math.random() * 2),
        color: leaf.color,
      });
      if (tree.resting.length > MAX_RESTING) tree.resting.shift();
      tree.falling.splice(i, 1);
      continue;
    }
    if (
      leaf.x < -8 ||
      leaf.x > bounds.width + 8 ||
      leaf.y > bounds.height + 8
    ) {
      tree.falling.splice(i, 1);
    }
  }
}
