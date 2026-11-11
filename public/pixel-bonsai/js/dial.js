import { BONSAI, SCENE } from "./species.js";
import { growBonsai } from "./grow.js";
import { Pix } from "./pix.js";
import { computePose, renderScene, potBottom } from "./render.js";
import { sampleWind } from "./wind.js";
import {
  stepLeaves,
  shedNear,
  shedFraction,
  regrowSome,
  fadeLitter,
} from "./leaves.js";

const FIELDS = [
  {
    group: "Proportion",
    path: "growth.scale",
    label: "Overall scale",
    min: 0.7,
    max: 2.2,
    step: 0.01,
  },
  {
    group: "Proportion",
    path: "growth.widthScale",
    label: "Trunk thickness",
    min: 0.5,
    max: 2.2,
    step: 0.01,
  },
  {
    group: "Proportion",
    path: "rootHeight",
    label: "Root leg height",
    min: 4,
    max: 28,
    step: 1,
  },

  {
    group: "Branching",
    path: "growth.childSpread",
    label: "Fork spread",
    min: 10,
    max: 46,
    step: 1,
  },
  {
    group: "Branching",
    path: "growth.childLift",
    label: "Upward lift",
    min: 0,
    max: 34,
    step: 1,
  },
  {
    group: "Branching",
    path: "growth.childFalloff",
    label: "Length falloff",
    min: 0.4,
    max: 0.85,
    step: 0.01,
  },
  {
    group: "Branching",
    path: "growth.childTaper",
    label: "Width falloff",
    min: 0.4,
    max: 0.9,
    step: 0.01,
  },

  {
    group: "Canopy",
    path: "pad.radiusX",
    label: "Pad width",
    min: 7,
    max: 28,
    step: 0.5,
  },
  {
    group: "Canopy",
    path: "pad.radiusY",
    label: "Pad height",
    min: 2.5,
    max: 12,
    step: 0.1,
  },
  {
    group: "Canopy",
    path: "pad.density",
    label: "Density",
    min: 0.6,
    max: 1,
    step: 0.01,
  },
  {
    group: "Canopy",
    path: "pad.edge",
    label: "Edge softness",
    min: 0,
    max: 0.7,
    step: 0.01,
  },
  {
    group: "Canopy",
    path: "pad.lip",
    label: "Underside lip",
    min: 0.1,
    max: 0.9,
    step: 0.01,
  },
  {
    group: "Canopy",
    path: "pad.accentChance",
    label: "Accent leaves",
    min: 0,
    max: 0.4,
    step: 0.01,
  },
  {
    group: "Canopy",
    path: "pad.cell",
    label: "Leaf size",
    min: 1,
    max: 4,
    step: 1,
  },

  { group: "Bark", path: "palette.bark.0", label: "Lit", type: "color" },
  { group: "Bark", path: "palette.bark.1", label: "Mid", type: "color" },
  { group: "Bark", path: "palette.bark.2", label: "Shadow", type: "color" },

  { group: "Leaves", path: "palette.leaf.0", label: "Lit", type: "color" },
  { group: "Leaves", path: "palette.leaf.1", label: "Mid", type: "color" },
  { group: "Leaves", path: "palette.leaf.2", label: "Shadow", type: "color" },
  { group: "Leaves", path: "palette.accent", label: "Accent", type: "color" },

  {
    group: "Pot glaze",
    path: "palette.pot.0",
    label: "Specular",
    type: "color",
  },
  { group: "Pot glaze", path: "palette.pot.1", label: "Light", type: "color" },
  { group: "Pot glaze", path: "palette.pot.2", label: "Mid", type: "color" },
  { group: "Pot glaze", path: "palette.pot.3", label: "Dark", type: "color" },
  {
    group: "Pot glaze",
    path: "palette.pot.4",
    label: "Deepest",
    type: "color",
  },
  {
    group: "Pot glaze",
    path: "pot.width",
    label: "Pot width",
    min: 50,
    max: 150,
    step: 1,
  },
  {
    group: "Pot glaze",
    path: "pot.bodyHeight",
    label: "Pot depth",
    min: 8,
    max: 40,
    step: 1,
  },
  {
    group: "Pot glaze",
    path: "pot.bodyInset",
    label: "Pot taper",
    min: 0,
    max: 20,
    step: 1,
  },

  { group: "Soil", path: "palette.soil.0", label: "Soil", type: "color" },
  { group: "Soil", path: "palette.soil.1", label: "Soil dark", type: "color" },
  { group: "Soil", path: "palette.moss", label: "Moss", type: "color" },

  {
    group: "Motion",
    path: "sway.rate",
    label: "Sway rate",
    min: 0.4,
    max: 4,
    step: 0.05,
  },
  {
    group: "Motion",
    path: "sway.amplitude.0",
    label: "Sway trunk",
    min: 0,
    max: 0.06,
    step: 0.001,
  },
  {
    group: "Motion",
    path: "sway.amplitude.1",
    label: "Sway inner",
    min: 0,
    max: 0.12,
    step: 0.002,
  },
  {
    group: "Motion",
    path: "sway.amplitude.2",
    label: "Sway outer",
    min: 0,
    max: 0.2,
    step: 0.002,
  },
  {
    group: "Motion",
    path: "sway.amplitude.3",
    label: "Sway tips",
    min: 0,
    max: 0.3,
    step: 0.005,
  },

  {
    group: "Falling",
    path: "fall.gravity",
    label: "Gravity",
    min: 6,
    max: 70,
    step: 1,
  },
  {
    group: "Falling",
    path: "fall.terminal",
    label: "Terminal speed",
    min: 6,
    max: 60,
    step: 1,
  },
  {
    group: "Falling",
    path: "fall.drift",
    label: "Wind drift",
    min: 0,
    max: 4,
    step: 0.05,
  },
  {
    group: "Falling",
    path: "fall.flutter",
    label: "Flutter",
    min: 0,
    max: 24,
    step: 0.5,
  },

  {
    group: "Cursor feel",
    path: "interaction.speedForFull",
    label: "Speed for full ruffle",
    min: 300,
    max: 3000,
    step: 50,
  },
  {
    group: "Cursor feel",
    path: "interaction.ruffleGain",
    label: "Ruffle gain",
    min: 0.02,
    max: 0.8,
    step: 0.01,
  },
  {
    group: "Cursor feel",
    path: "interaction.ruffleDecay",
    label: "Ruffle decay",
    min: 0.3,
    max: 6,
    step: 0.05,
  },
  {
    group: "Cursor feel",
    path: "interaction.ruffleLean",
    label: "Ruffle lean",
    min: 0,
    max: 1.2,
    step: 0.02,
  },
  {
    group: "Cursor feel",
    path: "interaction.shedRadius",
    label: "Shed radius",
    min: 4,
    max: 44,
    step: 1,
  },
  {
    group: "Cursor feel",
    path: "interaction.shedChance",
    label: "Shed chance",
    min: 0,
    max: 0.5,
    step: 0.005,
  },
  {
    group: "Cursor feel",
    path: "interaction.grabPull",
    label: "Grab pull",
    min: 0,
    max: 2.5,
    step: 0.05,
  },
  {
    group: "Cursor feel",
    path: "interaction.grabScale",
    label: "Grab travel",
    min: 15,
    max: 160,
    step: 1,
  },
  {
    group: "Cursor feel",
    path: "interaction.idleBeforeRegrow",
    label: "Idle before regrow",
    min: 0.4,
    max: 12,
    step: 0.1,
  },
  {
    group: "Cursor feel",
    path: "interaction.regrowRate",
    label: "Regrow rate",
    min: 2,
    max: 140,
    step: 1,
  },
];

const REGROW_ON = new Set(["growth", "pad", "palette", "rootHeight", "pot"]);

function readPath(target, path) {
  return path.split(".").reduce((node, key) => node[key], target);
}

function writePath(target, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const node = keys.reduce((step, key) => step[key], target);
  node[last] = value;
}

const original = structuredClone(BONSAI);
const config = structuredClone(BONSAI);

const canvas = document.getElementById("scene");
const context = canvas.getContext("2d");
const panel = document.getElementById("panel");
const output = document.getElementById("output");

let tree = growBonsai(config);
let pix = null;
let nativeWidth = 0;
let scale = 2;
let clock = 0;
let ruffle = 0;
let idle = 0;
let regrowDebt = 0;

const groundY = SCENE.height - SCENE.groundInset;
const pointer = { x: 0, y: 0, speed: 0, direction: 1, moved: 0 };
const grab = { active: false, startX: 0, pull: 0 };
const bounds = {
  width: 0,
  height: SCENE.height,
  groundY,
  soilY: 0,
  potLeft: 0,
  potRight: 0,
};

function placeTree() {
  tree.origin.y = groundY - potBottom(config);
  tree.origin.x = Math.round(nativeWidth / 2 + tree.balance);
  bounds.width = nativeWidth;
  bounds.soilY = tree.origin.y + config.rootHeight;
  bounds.potLeft =
    tree.origin.x + config.pot.offsetX - config.pot.width / 2 + 3;
  bounds.potRight =
    tree.origin.x + config.pot.offsetX + config.pot.width / 2 - 3;
}

function layout() {
  const host = canvas.parentElement;
  const width = Math.ceil(host.clientWidth / scale);
  if (width !== nativeWidth) {
    nativeWidth = width;
    canvas.width = width;
    canvas.height = SCENE.height;
    context.imageSmoothingEnabled = false;
    pix = new Pix(context, width, SCENE.height);
  }
  canvas.style.width = `${width * scale}px`;
  canvas.style.height = `${SCENE.height * scale}px`;
  placeTree();
}

function rebuild() {
  tree = growBonsai(config);
  placeTree();
}

function changedPaths() {
  return FIELDS.filter(
    (field) => readPath(config, field.path) !== readPath(original, field.path),
  );
}

function refreshOutput() {
  const changed = changedPaths();
  if (changed.length === 0) {
    output.textContent = "No changes yet. Move a dial.";
    return;
  }
  output.textContent = changed
    .map((field) => {
      const value = readPath(config, field.path);
      const printed = typeof value === "string" ? `'${value}'` : value;
      return `${field.path} = ${printed}`;
    })
    .join("\n");
}

function build() {
  const groups = new Map();
  FIELDS.forEach((field) => {
    if (!groups.has(field.group)) groups.set(field.group, []);
    groups.get(field.group).push(field);
  });

  groups.forEach((fields, name) => {
    const section = document.createElement("section");
    const heading = document.createElement("h2");
    heading.textContent = name;
    section.appendChild(heading);

    fields.forEach((field) => {
      const row = document.createElement("label");
      row.className = field.type === "color" ? "row row-color" : "row";

      const text = document.createElement("span");
      text.className = "name";
      text.textContent = field.label;

      const readout = document.createElement("output");
      const input = document.createElement("input");

      if (field.type === "color") {
        input.type = "color";
        input.value = readPath(config, field.path);
        readout.textContent = input.value;
      } else {
        input.type = "range";
        input.min = String(field.min);
        input.max = String(field.max);
        input.step = String(field.step);
        input.value = String(readPath(config, field.path));
        readout.textContent = input.value;
      }

      input.addEventListener("input", () => {
        const value =
          field.type === "color" ? input.value : Number(input.value);
        writePath(config, field.path, value);
        readout.textContent = field.type === "color" ? value : String(value);
        if (REGROW_ON.has(field.path.split(".")[0])) rebuild();
        refreshOutput();
      });

      row.append(text, input, readout);
      section.appendChild(row);
    });

    panel.appendChild(section);
  });
}

document.getElementById("reset").addEventListener("click", () => {
  const fresh = structuredClone(original);
  Object.keys(fresh).forEach((key) => {
    config[key] = fresh[key];
  });
  panel.textContent = "";
  build();
  rebuild();
  refreshOutput();
});

document.getElementById("copy").addEventListener("click", async () => {
  const button = document.getElementById("copy");
  try {
    await navigator.clipboard.writeText(output.textContent);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Select and copy";
  }
  setTimeout(() => {
    button.textContent = "Copy values";
  }, 1400);
});

document.getElementById("zoom").addEventListener("input", (event) => {
  scale = Number(event.target.value);
  document.getElementById("zoom-value").textContent = `${scale}x`;
  nativeWidth = 0;
  layout();
});

document.getElementById("shake").addEventListener("click", () => {
  ruffle = Math.min(1.9, ruffle + 1.2);
  shedFraction(tree, 0.12, pointer.direction, clock);
  idle = 0;
});

const stage = document.getElementById("stage");
let lastMove = performance.now();

stage.addEventListener("pointermove", (event) => {
  const now = performance.now();
  const dt = Math.max(0.008, (now - lastMove) / 1000);
  lastMove = now;
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  const dx = x - pointer.x;
  pointer.speed = pointer.speed * 0.6 + Math.min(2600, Math.abs(dx) / dt) * 0.4;
  if (Math.abs(dx) > 0.4) pointer.direction = Math.sign(dx);
  pointer.x = x;
  pointer.y = y;
  pointer.moved = clock;
  idle = 0;

  if (grab.active) {
    grab.pull = Math.max(
      -1.3,
      Math.min(1.3, (x - grab.startX) / config.interaction.grabScale),
    );
    return;
  }
  const intensity = Math.min(
    1,
    pointer.speed / config.interaction.speedForFull,
  );
  ruffle = Math.min(1.9, ruffle + intensity * config.interaction.ruffleGain);
  if (intensity > 0.12) {
    shedNear(
      tree,
      x,
      y,
      config.interaction.shedRadius,
      intensity * config.interaction.shedChance,
      pointer.direction,
      clock,
    );
  }
});

stage.addEventListener("pointerdown", (event) => {
  const rect = canvas.getBoundingClientRect();
  grab.active = true;
  grab.startX = ((event.clientX - rect.left) / rect.width) * canvas.width;
  grab.pull = 0;
  idle = 0;
});

const endGrab = () => {
  if (!grab.active) return;
  const force = Math.abs(grab.pull);
  grab.active = false;
  if (force > 0.12) {
    ruffle = Math.min(1.9, ruffle + force * 1.1);
    shedFraction(
      tree,
      Math.min(0.4, force * 0.16),
      Math.sign(grab.pull) || 1,
      clock,
    );
  }
  grab.pull = 0;
};
window.addEventListener("pointerup", endGrab);
window.addEventListener("pointercancel", endGrab);

window.addEventListener("resize", () => {
  nativeWidth = 0;
  layout();
});

build();
refreshOutput();
layout();

const AMBIENT = {
  enabled: true,
  weather: "breezy",
  direction: 1,
  speed: 0,
  gusts: 1,
};
let previous = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - previous) / 1000);
  previous = now;
  clock += dt;
  idle += dt;

  const ambient = sampleWind(AMBIENT, clock, 1);
  ruffle *= Math.exp(-dt * config.interaction.ruffleDecay);
  if (clock - pointer.moved > 0.12) pointer.speed *= Math.exp(-dt * 6);

  const wind = {
    strength: ambient.strength + ruffle,
    lean:
      ambient.lean +
      grab.pull * config.interaction.grabPull +
      ruffle * config.interaction.ruffleLean * pointer.direction,
    direction: pointer.direction,
    gust: ambient.gust,
  };

  computePose(tree, clock, wind);
  stepLeaves(tree, dt, clock, wind, bounds);

  if (idle > config.interaction.idleBeforeRegrow) {
    regrowDebt += dt * config.interaction.regrowRate;
    while (regrowDebt >= 1) {
      regrowDebt -= 1;
      regrowSome(tree, 1, clock);
    }
    if (tree.resting.length > 0 && Math.random() < dt * 6) fadeLitter(tree, 1);
  }

  if (pix)
    renderScene(pix, tree, {
      time: clock,
      theme: "dark",
      skeleton: false,
      groundY,
    });
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
