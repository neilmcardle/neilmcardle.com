import {
  Application,
  Assets,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js";
import catalogue from "../data/characters.json";
import socketData from "../data/sockets.json";
import art from "../data/art.json";
import {
  SCENES,
  outlineFor,
  type Facing,
  type HotspotDef,
  type SceneDef,
  type SceneId,
} from "../data/scenes";
import {
  clampInside,
  distance,
  findPath,
  pointInPolygon,
  toPolygon,
  type Point,
  type Polygon,
} from "./geometry";

export const ART_BASE = "/hero-studio";

const WALK_SPEED = 420;
const LONG_PRESS_MS = 480;

type CharacterId = keyof typeof catalogue.characters;

function currentVersion(id: CharacterId): {
  figureHeight: number;
  speed: number;
  actions: unknown;
} {
  const entry = catalogue.characters[id] as {
    current: string;
    versions: Record<
      string,
      { figureHeight: number; speed: number; actions: unknown }
    >;
  };
  return entry.versions[entry.current];
}

type Actor = {
  id: CharacterId;
  root: Container;
  body: Sprite;
  shadow: Graphics;
  textures: Record<"right" | "towards" | "away", Texture>;
  pos: Point;
  facing: Facing;
  path: Point[];
  onArrive: (() => void) | null;
  walkClock: number;
  lift: number;
  walk: {
    frames: Texture[];
    stride: number;
    towards: Texture[] | null;
    away: Texture[] | null;
    verticalStride: number;
  } | null;
  travelled: number;
  frame: number;
  held: Graphics;
  heldColour: number | null;
  lean: number;
  settle: number;
  breath: number;
};

type Socket = { head: number[]; hand: number[] };
type SocketSet = {
  idle: Record<"right" | "towards" | "away", Socket | null>;
  walk?: (Socket | null)[];
};
const SOCKETS = socketData as Record<string, SocketSet>;

type Actions = {
  idle: { right: string; towards: string; away: string };
  walk?: {
    frames: number;
    right: string;
    stride: number;
    towards?: string;
    away?: string;
    verticalStride?: number;
  };
};

export type Target =
  | { kind: "hotspot"; hotspot: HotspotDef }
  | { kind: "npc"; id: string; name: string; walkTo: Point; face: Facing };

export type CastMember = { id: string; pos: Point; facing: Facing };

export type WorldEvents = {
  onHover: (
    label: string | null,
    screen: Point | null,
    target?: Target | null,
  ) => void;
  onPrimary: (target: Target | null, point: Point, touch: boolean) => void;
  onLook: (target: Target | null) => void;
  onReady: () => void;
  onFrame?: () => void;
};

export type WorldOptions = {
  touchScroll?: boolean;
  cast?: string[];
  cover?: { focusX: number; focusY: number };
};

function artUrl(path: string) {
  return `${ART_BASE}/${path}`;
}

function mix(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): number {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return (r << 16) | (g << 8) | bl;
}

export class World {
  private app = new Application();
  private stage = new Container();
  private backdrop = new Sprite();
  private actorsLayer = new Container();
  private occluders: Container[] = [];
  private overlays = new Map<string, { sprite: Sprite; y: number }>();
  private occluderSpans: { y: number; x0: number; x1: number }[] = [];
  private debugLayer = new Graphics();
  private highlightLayer = new Graphics();
  private highlighted: string | null = null;
  private whole = false;
  private highlightBase = 0;
  private scene: SceneDef = SCENES.studio;
  private walkable: Polygon = [];
  private hotspotShapes: { hotspot: HotspotDef; polys: Polygon[] }[] = [];
  private actors = new Map<string, Actor>();
  private player: Actor | null = null;
  private debug = false;
  private events: WorldEvents;
  private host: HTMLElement;
  private pressTimer: number | null = null;
  private pressFired = false;
  private destroyed = false;
  private ready = false;
  private inputLocked = false;

  private options: WorldOptions;
  private focusX = 0;
  private following = true;
  private drag: {
    x: number;
    y: number;
    moved: boolean;
    sideways: boolean | null;
  } | null = null;

  constructor(
    host: HTMLElement,
    events: WorldEvents,
    options: WorldOptions = {},
  ) {
    this.host = host;
    this.events = events;
    this.options = options;
  }

  toHost(p: Point): Point {
    return {
      x: this.stage.x + p.x * this.stage.scale.x,
      y: this.stage.y + p.y * this.stage.scale.y,
    };
  }

  get cameraX() {
    return Math.round(this.stage.x);
  }

  get cameraKey() {
    return `${Math.round(this.stage.x)},${Math.round(this.stage.y)},${this.stage.scale.x.toFixed(4)}`;
  }

  hotspotBoxes() {
    return this.hotspotShapes
      .filter(({ polys }) => polys.length)
      .map(({ hotspot, polys }) => {
        const xs = polys.flat().map((p) => p.x);
        const ys = polys.flat().map((p) => p.y);
        const a = this.toHost({ x: Math.min(...xs), y: Math.min(...ys) });
        const b = this.toHost({ x: Math.max(...xs), y: Math.max(...ys) });
        return {
          hotspot,
          left: a.x,
          top: a.y,
          width: b.x - a.x,
          height: b.y - a.y,
        };
      });
  }

  headOf(id: string): Point | null {
    const actor = this.actors.get(id);
    if (!actor || !actor.root.parent) return null;
    const scale = this.depthScale(actor.pos.y);
    return this.toHost({
      x: actor.pos.x,
      y: actor.pos.y - currentVersion(actor.id).figureHeight * scale * 1.05,
    });
  }

  destinationOf(id: string): Point | null {
    const path = this.actors.get(id)?.path;
    return path && path.length ? this.toHost(path[path.length - 1]) : null;
  }

  showWhole(on: boolean) {
    this.whole = on;
    this.fit();
  }

  setOutline(key: string, polys: Point[][]) {
    for (const shape of this.hotspotShapes)
      if (shape.hotspot.outline === key) shape.polys = polys;
    if (this.highlighted) this.drawHighlight();
  }

  isWalking(id: string) {
    return (this.actors.get(id)?.path.length ?? 0) > 0;
  }

  async init() {
    await this.app.init({
      resizeTo: this.host,
      background: 0x0c0a09,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });
    if (this.destroyed) {
      this.app.destroy(true);
      return;
    }
    this.host.appendChild(this.app.canvas);
    this.app.canvas.style.touchAction = this.options.touchScroll
      ? "pan-y"
      : "none";
    this.stage.addChild(this.backdrop, this.actorsLayer, this.debugLayer);
    this.app.stage.addChild(this.stage);
    this.actorsLayer.sortableChildren = true;
    const cast = (this.options.cast ?? ["neil"]) as CharacterId[];
    for (const id of cast) this.actors.set(id, await this.makeActor(id));
    this.player = this.actors.get(cast[0]) ?? null;
    this.bindInput();
    this.app.ticker.add((ticker) =>
      this.update(Math.min(ticker.elapsedMS, 250) / 1000),
    );
    this.app.renderer.on("resize", () => this.fit());
    this.ready = true;
    this.events.onReady();
  }

  destroy() {
    this.destroyed = true;
    if (this.ready) this.app.destroy(true, { children: true });
  }

  private async makeActor(id: CharacterId): Promise<Actor> {
    const actions = currentVersion(id).actions as Actions;
    const idle = actions.idle;
    const [right, towards, away] = await Promise.all([
      Assets.load<Texture>(artUrl(idle.right)),
      Assets.load<Texture>(artUrl(idle.towards)),
      Assets.load<Texture>(artUrl(idle.away)),
    ]);
    const root = new Container();
    const shadow = new Graphics();
    const body = new Sprite(towards);
    body.anchor.set(
      catalogue.format.foot.x / catalogue.format.cell.width,
      catalogue.format.foot.y / catalogue.format.cell.height,
    );
    const held = new Graphics();
    root.addChild(shadow, body, held);
    let walk: Actor["walk"] = null;
    if (actions.walk) {
      const { width, height } = catalogue.format.cell;
      const count = actions.walk.frames;
      const slice = async (path: string | undefined) => {
        if (!path) return null;
        const sheet = await Assets.load<Texture>(artUrl(path));
        return Array.from(
          { length: count },
          (_, i) =>
            new Texture({
              source: sheet.source,
              frame: new Rectangle(i * width, 0, width, height),
            }),
        );
      };
      const [frames, towardsFrames, awayFrames] = await Promise.all([
        slice(actions.walk.right),
        slice(actions.walk.towards),
        slice(actions.walk.away),
      ]);
      walk = {
        frames: frames!,
        stride: actions.walk.stride,
        towards: towardsFrames,
        away: awayFrames,
        verticalStride: actions.walk.verticalStride ?? 260,
      };
    }
    return {
      id,
      root,
      body,
      shadow,
      textures: { right, towards, away },
      pos: { x: 0, y: 0 },
      facing: "towards",
      path: [],
      onArrive: null,
      walkClock: 0,
      lift: 0,
      walk,
      travelled: 0,
      frame: -1,
      held,
      heldColour: null,
      lean: 0,
      settle: 0,
      breath: Math.random() * Math.PI * 2,
    };
  }

  async setScene(id: SceneId, cast: CastMember[], playerId: string) {
    this.scene = SCENES[id];
    this.walkable = toPolygon(this.scene.walkable);
    this.hotspotShapes = this.scene.hotspots.map((hotspot) => ({
      hotspot,
      polys: (hotspot.outline
        ? outlineFor(id, hotspot.outline)
        : hotspot.area
          ? [hotspot.area]
          : []
      ).map(toPolygon),
    }));
    this.backdrop.texture = await Assets.load<Texture>(
      artUrl(this.scene.image),
    );
    this.actorsLayer.removeChildren();
    this.actorsLayer.addChild(this.highlightLayer);
    for (const o of this.occluders) o.destroy({ children: true });
    this.occluders = [];
    this.overlays.clear();
    const extra =
      (
        art.scenes as Record<
          string,
          { overlays?: { id: string; src: string; x: number; y: number }[] }
        >
      )[id]?.overlays ?? [];
    for (const o of extra) {
      const sprite = new Sprite(await Assets.load<Texture>(artUrl(o.src)));
      sprite.position.set(o.x, o.y);
      sprite.alpha = 0;
      sprite.zIndex = 1126;
      this.actorsLayer.addChild(sprite);
      this.overlays.set(o.id, { sprite, y: o.y });
    }
    this.occluderSpans = [];
    for (const { hotspot, polys } of this.hotspotShapes) {
      if (!hotspot.outline) continue;
      for (const poly of polys) {
        const baseline = Math.max(...poly.map((p) => p.y));
        const cut = new Container();
        const piece = new Sprite(this.backdrop.texture);
        const mask = new Graphics()
          .poly(poly.flatMap((p) => [p.x, p.y]))
          .fill(0xffffff);
        piece.mask = mask;
        cut.addChild(piece, mask);
        cut.zIndex = baseline;
        cut.label = `occluder:${hotspot.id}`;
        this.occluders.push(cut);
        this.occluderSpans.push({
          y: baseline,
          x0: Math.min(...poly.map((p) => p.x)),
          x1: Math.max(...poly.map((p) => p.x)),
        });
        this.actorsLayer.addChild(cut);
      }
    }
    for (const actor of this.actors.values()) {
      actor.path = [];
      actor.onArrive = null;
      actor.travelled = 0;
    }
    for (const member of cast) {
      const actor = this.actors.get(member.id);
      if (!actor) continue;
      actor.pos = { ...member.pos };
      this.face(actor, member.facing);
      this.actorsLayer.addChild(actor.root);
    }
    this.player = this.actors.get(playerId) ?? null;
    if (this.options.cover && this.player) this.focusX = this.player.pos.x;
    this.fit();
    this.drawDebug();
  }

  actorState(id: string) {
    const actor = this.actors.get(id);
    return actor ? { pos: { ...actor.pos }, facing: actor.facing } : null;
  }

  get playerId() {
    return this.player?.id ?? null;
  }

  get sceneId(): SceneId {
    return this.scene.id;
  }

  faceActor(id: string, facing: Facing) {
    const actor = this.actors.get(id);
    if (actor) this.face(actor, facing);
  }

  get playerState() {
    return this.player
      ? { pos: { ...this.player.pos }, facing: this.player.facing }
      : null;
  }

  lockInput(locked: boolean) {
    this.inputLocked = locked;
    if (locked) this.events.onHover(null, null);
  }

  async capture(): Promise<string> {
    return this.app.renderer.extract.base64({
      target: this.stage,
      format: "png",
    });
  }

  setDebug(on: boolean) {
    this.debug = on;
    this.drawDebug();
  }

  toggleDebug() {
    this.debug = !this.debug;
    this.drawDebug();
    return this.debug;
  }

  walkTo(point: Point, onArrive?: () => void) {
    if (!this.player) return;
    this.following = true;
    this.player.path = findPath(this.player.pos, point, this.walkable);
    this.player.onArrive = onArrive ?? null;
    this.drawDebug();
  }

  facePlayer(facing: Facing) {
    if (this.player) this.face(this.player, facing);
  }

  setOverlay(id: string, open: boolean) {
    const o = this.overlays.get(id);
    if (!o) return;
    const from = o.sprite.alpha;
    const to = open ? 1 : 0;
    o.sprite.y = o.y;
    void this.tween(open ? 120 : 100, (t) => {
      o.sprite.alpha = from + (to - from) * t;
    });
  }

  highlight(id: string | null) {
    this.highlighted = id;
    this.drawHighlight();
    const layer = this.highlightLayer;
    if (!id) {
      layer.alpha = 0;
      return;
    }
    void this.tween(200, (t) => {
      if (this.highlighted === id) layer.alpha = 1 - Math.pow(1 - t, 3);
    });
  }

  private orderHighlight() {
    const y = this.player?.pos.y ?? 0;
    this.highlightLayer.zIndex =
      this.player && y > this.highlightBase ? y - 0.01 : 1e6;
  }

  private drawHighlight() {
    const g = this.highlightLayer;
    g.clear();
    const shape = this.hotspotShapes.find(
      ({ hotspot }) => hotspot.id === this.highlighted,
    );
    if (!shape) return;
    this.highlightBase = Math.max(...shape.polys.flat().map((p) => p.y), 0);
    this.orderHighlight();
    const px = 1 / (this.stage.scale.x || 1);
    for (const poly of shape.polys) {
      const flat = poly.flatMap((p) => [p.x, p.y]);
      g.poly(flat).fill({ color: 0xf2b84b, alpha: 0.12 });
      g.poly(flat).stroke({
        width: 8 * px,
        color: 0xf2b84b,
        alpha: 0.22,
        join: "round",
      });
      g.poly(flat).stroke({
        width: 2 * px,
        color: 0xffd98a,
        alpha: 0.95,
        join: "round",
      });
    }
  }

  hold(colour: number | null) {
    if (this.player) this.player.heldColour = colour;
  }

  async reach(result: () => void, gained: number | null = null) {
    const actor = this.player;
    if (!actor) return result();
    await this.tween(220, (t) => {
      actor.lift = -10 * t;
      actor.lean = 0.05 * t;
    });
    await this.wait(260);
    result();
    if (gained !== null) actor.heldColour = gained;
    await this.wait(gained !== null ? 520 : 140);
    await this.tween(220, (t) => {
      actor.lift = -10 * (1 - t);
      actor.lean = 0.05 * (1 - t);
    });
    if (gained !== null) actor.heldColour = null;
  }

  private wait(ms: number) {
    return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
  }

  private tween(ms: number, step: (t: number) => void) {
    return new Promise<void>((resolve) => {
      const start = performance.now();
      const tick = () => {
        const t = Math.min(1, (performance.now() - start) / ms);
        step(t);
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  private face(actor: Actor, facing: Facing) {
    actor.facing = facing;
    if (facing === "left" || facing === "right") {
      actor.body.texture = actor.textures.right;
      actor.body.scale.x =
        facing === "left"
          ? -Math.abs(actor.body.scale.x || 1)
          : Math.abs(actor.body.scale.x || 1);
    } else {
      actor.body.texture =
        facing === "towards" ? actor.textures.towards : actor.textures.away;
      actor.body.scale.x = Math.abs(actor.body.scale.x || 1);
    }
  }

  private depthScale(y: number) {
    const stops = this.scene.depth;
    if (y <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) {
      const [y1, s1] = stops[i];
      if (y <= y1) {
        const [y0, s0] = stops[i - 1];
        return s0 + ((s1 - s0) * (y - y0)) / (y1 - y0);
      }
    }
    return stops[stops.length - 1][1];
  }

  private lightAt(p: Point) {
    let color = this.scene.ambient;
    for (const light of this.scene.lights) {
      const t = Math.max(0, 1 - distance(p, light) / light.radius);
      if (t > 0) {
        const tinted = mix(color, light.color, t * 0.85);
        color = [(tinted >> 16) & 255, (tinted >> 8) & 255, tinted & 255];
      }
    }
    return (color[0] << 16) | (color[1] << 8) | color[2];
  }

  private update(dt: number) {
    for (const actor of this.actors.values()) {
      if (!actor.root.parent) continue;
      if (actor.path.length) {
        const next = actor.path[0];
        const speed =
          (currentVersion(actor.id).speed ?? WALK_SPEED) *
          this.depthScale(actor.pos.y);
        const d = distance(actor.pos, next);
        const dx = next.x - actor.pos.x;
        const dy = next.y - actor.pos.y;
        const facing: Facing =
          Math.abs(dy) <= Math.abs(dx) * 2.5
            ? dx < 0
              ? "left"
              : "right"
            : dy < 0
              ? "away"
              : "towards";
        if (facing !== actor.facing) this.face(actor, facing);
        if (d <= speed * dt) {
          actor.pos = { ...next };
          actor.path.shift();
          if (!actor.path.length) {
            actor.walkClock = 0;
            actor.travelled = 0;
            actor.settle = 1;
            this.face(actor, actor.facing);
            const done = actor.onArrive;
            actor.onArrive = null;
            done?.();
          }
        } else {
          actor.pos = {
            x: actor.pos.x + (dx / d) * speed * dt,
            y: actor.pos.y + (dy / d) * speed * dt,
          };
          actor.walkClock += dt;
          actor.travelled += speed * dt;
        }
      }
      const scale = this.depthScale(actor.pos.y);
      const sideways = actor.facing === "left" || actor.facing === "right";
      const set = actor.walk
        ? sideways
          ? actor.walk.frames
          : actor.facing === "towards"
            ? actor.walk.towards
            : actor.walk.away
        : null;
      const cycling = actor.path.length > 0 && set !== null;
      if (cycling && actor.walk && set) {
        const frames = set;
        const stride = sideways ? actor.walk.stride : actor.walk.verticalStride;
        const index =
          Math.floor((actor.travelled / (stride * scale)) * frames.length) %
          frames.length;
        actor.body.texture = frames[index];
        actor.frame = index;
      } else {
        actor.frame = -1;
      }
      const bob =
        actor.path.length && !cycling
          ? Math.abs(
              Math.sin(
                (actor.travelled / ((actor.walk?.stride ?? 300) * scale)) *
                  Math.PI *
                  2,
              ),
            ) * -3
          : 0;
      actor.root.position.set(actor.pos.x, actor.pos.y);
      actor.root.zIndex = actor.pos.y;
      if (this.highlighted && actor === this.player) this.orderHighlight();
      actor.breath += dt * 1.6;
      actor.settle = Math.max(0, actor.settle - dt * 5);
      actor.body.y = bob + actor.lift;
      const flip = actor.body.scale.x < 0 ? -1 : 1;
      actor.body.scale.set(scale * flip, scale);
      actor.body.rotation = actor.lean * flip;
      this.drawHeld(actor, scale, flip);
      actor.body.tint = this.lightAt(actor.pos);
      const width = (actor.body.texture.width ? 150 : 0) * scale;
      actor.shadow
        .clear()
        .ellipse(0, 0, width, width * 0.2)
        .fill({ color: 0x120c08, alpha: 0.38 });
    }
    if (this.options.cover && this.player) {
      const target = this.following ? this.player.pos.x : this.focusX;
      const next = this.focusX + (target - this.focusX) * Math.min(1, dt * 3.5);
      if (Math.abs(next - this.focusX) > 0.1) {
        this.focusX = next;
        this.fit();
      }
    }
    if (this.debug) this.drawDebug();
    this.events.onFrame?.();
  }

  private socketFor(actor: Actor): Socket | null {
    const set = SOCKETS[actor.id];
    if (!set) return null;
    const sideways = actor.facing === "left" || actor.facing === "right";
    if (actor.frame >= 0 && sideways && set.walk)
      return set.walk[actor.frame] ?? null;
    const key =
      actor.facing === "left" || actor.facing === "right"
        ? "right"
        : actor.facing;
    return set.idle[key] ?? null;
  }

  private drawHeld(actor: Actor, scale: number, flip: number) {
    actor.held.clear();
    if (actor.heldColour === null) return;
    const socket = this.socketFor(actor);
    if (!socket) return;
    const { foot } = catalogue.format;
    const x = (socket.hand[0] - foot.x) * scale * flip;
    const y = (socket.hand[1] - foot.y) * scale + actor.body.y;
    const r = 13 * scale;
    actor.held
      .circle(x, y, r)
      .fill({ color: actor.heldColour })
      .stroke({ color: 0x1a120b, width: 2 * scale, alpha: 0.6 });
  }

  private fit() {
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const cover =
      this.options.cover && !this.whole
        ? {
            ...this.options.cover,
            focusX: this.focusX || this.options.cover.focusX,
          }
        : undefined;
    const scale = cover
      ? Math.max(w / this.scene.width, h / this.scene.height)
      : Math.min(w / this.scene.width, h / this.scene.height) *
        (this.whole ? 0.9 : 1);
    this.stage.scale.set(scale);
    if (cover) {
      const sw = this.scene.width * scale;
      const sh = this.scene.height * scale;
      const x = Math.min(0, Math.max(w - sw, w / 2 - cover.focusX * scale));
      const y = Math.min(0, Math.max(h - sh, h / 2 - cover.focusY * scale));
      this.stage.position.set(x, y);
    } else {
      this.stage.position.set(
        (w - this.scene.width * scale) / 2,
        (h - this.scene.height * scale) / 2,
      );
    }
    if (this.highlighted) this.drawHighlight();
  }

  toWorld(clientX: number, clientY: number): Point {
    const rect = this.app.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - this.stage.x) / this.stage.scale.x,
      y: (clientY - rect.top - this.stage.y) / this.stage.scale.y,
    };
  }

  private npcTarget(p: Point): Target | null {
    for (const actor of this.actors.values()) {
      if (actor === this.player || !actor.root.parent) continue;
      const scale = this.depthScale(actor.pos.y);
      const height = currentVersion(actor.id).figureHeight * scale;
      const halfWidth = 120 * scale;
      if (
        p.x > actor.pos.x - halfWidth &&
        p.x < actor.pos.x + halfWidth &&
        p.y < actor.pos.y &&
        p.y > actor.pos.y - height
      ) {
        const fromLeft = (this.player?.pos.x ?? 0) <= actor.pos.x;
        const gap = 340 * scale;
        const spot = clampInside(
          { x: actor.pos.x + (fromLeft ? -gap : gap), y: actor.pos.y + 10 },
          this.walkable,
        );
        return {
          kind: "npc",
          id: actor.id,
          name: catalogue.characters[actor.id].name,
          walkTo: spot,
          face: fromLeft ? "right" : "left",
        };
      }
    }
    return null;
  }

  targetAt(p: Point): Target | null {
    const npc = this.npcTarget(p);
    if (npc) return npc;
    const reach = 34;
    for (let i = this.hotspotShapes.length - 1; i >= 0; i--) {
      const { hotspot, polys } = this.hotspotShapes[i];
      if (hotspot.inert) continue;
      const pts = polys.flat();
      if (!pts.length) continue;
      const x0 = Math.min(...pts.map((q) => q.x));
      const x1 = Math.max(...pts.map((q) => q.x));
      const y0 = Math.min(...pts.map((q) => q.y));
      const y1 = Math.max(...pts.map((q) => q.y));
      if ((x1 - x0) * (y1 - y0) > 40000) continue;
      if (
        p.x >= x0 - reach &&
        p.x <= x1 + reach &&
        p.y >= y0 - reach &&
        p.y <= y1 + reach
      )
        return { kind: "hotspot", hotspot };
    }
    for (let i = this.hotspotShapes.length - 1; i >= 0; i--) {
      const { hotspot, polys } = this.hotspotShapes[i];
      if (hotspot.inert) continue;
      if (polys.some((poly) => pointInPolygon(p, poly)))
        return { kind: "hotspot", hotspot };
    }
    return null;
  }

  private labelFor(target: Target | null) {
    if (!target) return null;
    return target.kind === "npc" ? target.name : target.hotspot.name;
  }

  private bindInput() {
    const canvas = this.app.canvas;
    const inside = (p: Point) =>
      p.x >= 0 &&
      p.y >= 0 &&
      p.x <= this.scene.width &&
      p.y <= this.scene.height;
    canvas.addEventListener("pointermove", (e) => {
      if (this.inputLocked || e.pointerType === "touch") return;
      const p = this.toWorld(e.clientX, e.clientY);
      const target = inside(p) ? this.targetAt(p) : null;
      canvas.style.cursor = target ? "pointer" : "default";
      this.events.onHover(
        this.labelFor(target),
        target ? { x: e.clientX, y: e.clientY } : null,
        target,
      );
    });
    canvas.addEventListener("pointerleave", () =>
      this.events.onHover(null, null),
    );
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("pointerdown", (e) => {
      if (this.inputLocked) return;
      const p = this.toWorld(e.clientX, e.clientY);
      if (!inside(p)) return;
      if (e.button === 2) {
        this.events.onLook(this.targetAt(p));
        return;
      }
      if (e.pointerType === "touch") {
        this.drag = {
          x: e.clientX,
          y: e.clientY,
          moved: false,
          sideways: null,
        };
        this.pressFired = false;
        this.pressTimer = window.setTimeout(() => {
          this.pressFired = true;
          const target = this.targetAt(p);
          this.events.onHover(
            this.labelFor(target),
            target ? { x: e.clientX, y: e.clientY } : null,
          );
          this.events.onLook(target);
        }, LONG_PRESS_MS);
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      const d = this.drag;
      if (!d || e.pointerType !== "touch") return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.moved && Math.hypot(dx, dy) > 10) {
        d.moved = true;
        d.sideways = Math.abs(dx) > Math.abs(dy);
        if (this.pressTimer) window.clearTimeout(this.pressTimer);
        this.pressTimer = null;
      }
      if (d.moved && d.sideways && this.options.cover) {
        this.following = false;
        this.focusX = Math.max(
          0,
          Math.min(this.scene.width, this.focusX - dx / this.stage.scale.x),
        );
        d.x = e.clientX;
        d.y = e.clientY;
        this.fit();
      }
    });
    canvas.addEventListener("pointerup", (e) => {
      if (this.pressTimer) window.clearTimeout(this.pressTimer);
      this.pressTimer = null;
      const dragged = this.drag?.moved ?? false;
      this.drag = null;
      if (dragged) return;
      if (this.inputLocked || e.button === 2) return;
      if (e.pointerType === "touch" && this.pressFired) return;
      const p = this.toWorld(e.clientX, e.clientY);
      if (!inside(p)) return;
      this.events.onPrimary(this.targetAt(p), p, e.pointerType === "touch");
    });
    canvas.addEventListener("pointercancel", () => {
      this.drag = null;
      if (this.pressTimer) window.clearTimeout(this.pressTimer);
      this.pressTimer = null;
    });
  }

  private drawDebug() {
    const g = this.debugLayer;
    g.clear();
    if (!this.debug) return;
    const w = this.scene.walkable;
    g.poly(w.flat())
      .fill({ color: 0x3ad17a, alpha: 0.18 })
      .stroke({ color: 0x3ad17a, width: 3 });
    for (const { polys } of this.hotspotShapes) {
      for (const poly of polys)
        g.poly(poly.flatMap((p) => [p.x, p.y])).stroke({
          color: 0xf2b84b,
          width: 3,
        });
    }
    for (const h of this.scene.hotspots)
      g.circle(h.walkTo.x, h.walkTo.y, 8).fill({ color: 0xf2b84b });
    if (this.player?.path.length) {
      g.moveTo(this.player.pos.x, this.player.pos.y);
      for (const p of this.player.path) g.lineTo(p.x, p.y);
      g.stroke({ color: 0x6ec3ff, width: 4 });
    }
    for (const actor of this.actors.values()) {
      if (!actor.root.parent) continue;
      g.moveTo(actor.pos.x - 30, actor.pos.y)
        .lineTo(actor.pos.x + 30, actor.pos.y)
        .stroke({ color: 0xff5a5a, width: 3 });
      const socket = this.socketFor(actor);
      if (socket) {
        const scale = this.depthScale(actor.pos.y);
        const flip = actor.body.scale.x < 0 ? -1 : 1;
        const { foot } = catalogue.format;
        for (const [point, colour] of [
          [socket.head, 0x6ec3ff],
          [socket.hand, 0xf2b84b],
        ] as const) {
          g.circle(
            actor.pos.x + (point[0] - foot.x) * scale * flip,
            actor.pos.y + (point[1] - foot.y) * scale + actor.body.y,
            9,
          ).stroke({ color: colour, width: 3 });
        }
      }
    }
    for (const o of this.occluderSpans) {
      g.moveTo(o.x0, o.y)
        .lineTo(o.x1, o.y)
        .stroke({ color: 0xc678ff, width: 4 });
    }
  }
}
