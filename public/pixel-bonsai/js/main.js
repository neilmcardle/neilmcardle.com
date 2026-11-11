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
import { wake, shakeSound } from "./sound.js";

const canvas = document.getElementById("scene");
const context = canvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const AMBIENT = {
  enabled: true,
  weather: "breezy",
  direction: 1,
  speed: 0,
  gusts: 1,
};
const tune = BONSAI.interaction;

const inCard = document.documentElement.classList.contains("card");
const CARD_LEAVES = {
  leaf: ["#f7c9d3", "#eca2b2", "#b4687a"],
  accent: "#fde0e6",
  moss: "#6b4f39",
};
const tree = growBonsai(
  inCard
    ? { ...BONSAI, palette: { ...BONSAI.palette, ...CARD_LEAVES } }
    : BONSAI,
);
const groundY = SCENE.height - SCENE.groundInset;
tree.origin.y = groundY - potBottom(BONSAI);

const pointer = { x: 0, y: 0, speed: 0, direction: 1, inside: false, moved: 0 };
const grab = { active: false, startX: 0, pull: 0, mouse: false };

let pix = null;
let nativeWidth = 0;
let clock = 0;
let ruffle = 0;
let idle = 0;
let skeleton = false;
let regrowDebt = 0;

const bounds = {
  width: 0,
  height: SCENE.height,
  groundY,
  soilY: tree.origin.y + BONSAI.rootHeight,
  potLeft: 0,
  potRight: 0,
};

const CARD_WIDTH = 370;

function layout() {
  const viewWidth = document.documentElement.clientWidth || window.innerWidth;
  const viewHeight =
    document.documentElement.clientHeight || window.innerHeight;
  const card = document.documentElement.classList.contains("card");
  const scale = card
    ? Math.min(viewWidth / CARD_WIDTH, viewHeight / SCENE.height)
    : Math.max(1, Math.min(6, Math.floor((viewHeight * 0.82) / SCENE.height)));
  const width = card ? CARD_WIDTH : Math.ceil(viewWidth / scale);

  if (width !== nativeWidth) {
    nativeWidth = width;
    canvas.width = width;
    canvas.height = SCENE.height;
    context.imageSmoothingEnabled = false;
    pix = new Pix(context, width, SCENE.height);
    if (card) {
      const margin = 6;
      let x = width / 2 - BONSAI.pot.offsetX;
      x = Math.max(x, margin - tree.reach.left);
      x = Math.min(x, width - margin - tree.reach.right);
      tree.origin.x = Math.round(x);
    } else {
      tree.origin.x = Math.round(width / 2 + tree.balance);
    }
    bounds.width = width;
    bounds.potLeft =
      tree.origin.x + BONSAI.pot.offsetX - BONSAI.pot.width / 2 + 3;
    bounds.potRight =
      tree.origin.x + BONSAI.pot.offsetX + BONSAI.pot.width / 2 - 3;
  }

  canvas.style.width = `${width * scale}px`;
  canvas.style.height = `${SCENE.height * scale}px`;
}

function toScene(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    inside: event.clientY >= rect.top - 40 && event.clientY <= rect.bottom + 40,
  };
}

let lastMove = performance.now();

window.addEventListener("pointermove", (event) => {
  const now = performance.now();
  const dt = Math.max(0.008, (now - lastMove) / 1000);
  lastMove = now;
  const point = toScene(event);
  const dx = point.x - pointer.x;
  const speed = Math.min(2600, Math.abs(dx) / dt);

  pointer.speed = pointer.speed * 0.6 + speed * 0.4;
  if (Math.abs(dx) > 0.4) pointer.direction = Math.sign(dx);
  pointer.x = point.x;
  pointer.y = point.y;
  pointer.inside = point.inside;
  pointer.moved = clock;

  if (grab.active) {
    grab.pull = Math.max(
      -1.3,
      Math.min(1.3, (point.x - grab.startX) / tune.grabScale),
    );
    return;
  }

  if (!point.inside) return;
  idle = 0;
  const intensity = Math.min(1, pointer.speed / tune.speedForFull);
  ruffle = Math.min(1.9, ruffle + intensity * tune.ruffleGain);
  if (intensity > 0.12) {
    shedNear(
      tree,
      point.x,
      point.y,
      tune.shedRadius,
      intensity * tune.shedChance,
      pointer.direction,
      clock,
    );
  }
});

window.addEventListener("pointerdown", (event) => {
  const point = toScene(event);
  if (!point.inside) return;
  grab.active = true;
  grab.mouse = event.pointerType === "mouse";
  if (grab.mouse) wake();
  grab.startX = point.x;
  grab.pull = 0;
  idle = 0;
  document.body.dataset.grabbing = "true";
});

function releaseGrab() {
  if (!grab.active) return;
  const force = Math.abs(grab.pull);
  grab.active = false;
  document.body.dataset.grabbing = "false";
  if (force > 0.12) {
    ruffle = Math.min(1.9, ruffle + force * 1.1);
    shedFraction(
      tree,
      Math.min(0.4, force * 0.16),
      Math.sign(grab.pull) || 1,
      clock,
    );
    if (grab.mouse) shakeSound(force);
  }
  grab.pull = 0;
  idle = 0;
}

window.addEventListener("pointerup", releaseGrab);
window.addEventListener("pointercancel", releaseGrab);

canvas.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    wake();
    shakeSound(0.8);
    ruffle = Math.min(1.9, ruffle + 1.1);
    shedFraction(tree, 0.1, pointer.direction, clock);
    idle = 0;
    return;
  }
  if (event.key === "s" || event.key === "S") skeleton = !skeleton;
});

let resizeHandle = 0;
window.addEventListener("resize", () => {
  cancelAnimationFrame(resizeHandle);
  resizeHandle = requestAnimationFrame(layout);
});

layout();

let previous = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - previous) / 1000);
  previous = now;
  clock += dt;
  idle += dt;

  const damp = reducedMotion.matches ? 0.25 : 1;
  const ambient = sampleWind(AMBIENT, clock, damp);

  ruffle *= Math.exp(-dt * tune.ruffleDecay);
  if (clock - pointer.moved > 0.12) pointer.speed *= Math.exp(-dt * 6);

  const strength = (ambient.strength + ruffle) * damp;
  const wind = {
    strength,
    lean:
      (ambient.lean +
        grab.pull * tune.grabPull +
        ruffle * tune.ruffleLean * pointer.direction) *
      damp,
    direction: pointer.direction,
    gust: ambient.gust,
  };

  computePose(tree, clock, wind);
  stepLeaves(tree, dt, clock, wind, bounds);

  if (idle > tune.idleBeforeRegrow) {
    regrowDebt += dt * tune.regrowRate;
    while (regrowDebt >= 1) {
      regrowDebt -= 1;
      regrowSome(tree, 1, clock);
    }
    if (tree.resting.length > 0 && Math.random() < dt * 6) fadeLitter(tree, 1);
  }

  if (pix) {
    renderScene(pix, tree, { time: clock, theme: "dark", skeleton, groundY });
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
