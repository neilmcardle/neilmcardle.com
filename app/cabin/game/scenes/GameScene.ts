import Phaser from "phaser";
import { TILE_W, TILE_H, tileToScreen } from "../systems/isoMath";
import { generateMap, PLACEHOLDER_OBJECTS, MAP_SIZE } from "../data/map";
import type { TileType, PlaceholderObject } from "../types";

const TILE_COLORS: Record<TileType, number> = {
  grass: 0x86a065,
  path: 0xa78a64,
  water: 0x547d8c,
  deck: 0xb38a52,
  off: 0xf8f8f7,
};

const TILE_EDGE = 0x000000;
const TILE_EDGE_ALPHA = 0.06;

export class GameScene extends Phaser.Scene {
  private offsetX = 0;
  private offsetY = 0;

  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    const map = generateMap();

    const center = tileToScreen(MAP_SIZE / 2, MAP_SIZE / 2);
    this.offsetX = this.scale.width / 2 - center.x;
    this.offsetY = this.scale.height / 2 - center.y - 40;

    // Draw the entire static scene into a single Graphics, then bake it
    // to a texture so the GPU only blits one sprite per frame rather
    // than replaying a few hundred path commands. Per-object sprites
    // come back in Phase 2 when depth-sorting against the player matters.
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    for (let row = 0; row < MAP_SIZE; row++) {
      for (let col = 0; col < MAP_SIZE; col++) {
        const tile = map[row][col];
        if (tile.type === "off") continue;
        this.drawTile(g, col, row, TILE_COLORS[tile.type]);
      }
    }

    const sorted = [...PLACEHOLDER_OBJECTS].sort(
      (a, b) => a.col + a.row - (b.col + b.row),
    );
    for (const obj of sorted) {
      this.drawPlaceholderObject(g, obj);
    }

    g.generateTexture("scene", this.scale.width, this.scale.height);
    g.destroy();
    this.add.image(this.scale.width / 2, this.scale.height / 2, "scene");
  }

  private drawTile(g: Phaser.GameObjects.Graphics, col: number, row: number, color: number) {
    const { x, y } = tileToScreen(col, row);
    const cx = x + this.offsetX;
    const cy = y + this.offsetY;
    const w = TILE_W / 2;
    const h = TILE_H / 2;
    g.fillStyle(color, 1);
    g.lineStyle(1, TILE_EDGE, TILE_EDGE_ALPHA);
    g.beginPath();
    g.moveTo(cx, cy - h);
    g.lineTo(cx + w, cy);
    g.lineTo(cx, cy + h);
    g.lineTo(cx - w, cy);
    g.closePath();
    g.fillPath();
    g.strokePath();
  }

  private drawPlaceholderObject(g: Phaser.GameObjects.Graphics, obj: PlaceholderObject) {
    const { x, y } = tileToScreen(obj.col, obj.row);
    const cx = x + this.offsetX;
    const cy = y + this.offsetY;

    switch (obj.kind) {
      case "cabin":
        g.fillStyle(0x1c1c1c, 1);
        g.fillTriangle(cx - 36, cy + 8, cx + 36, cy + 8, cx, cy - 56);
        g.fillStyle(0x2a2a2a, 1);
        g.fillRect(cx - 30, cy + 4, 60, 14);
        g.fillStyle(0x4a6f8a, 1);
        g.fillRect(cx - 6, cy - 36, 12, 18);
        break;
      case "hotTub":
        g.fillStyle(0x6b4e2e, 1);
        g.fillEllipse(cx, cy, 22, 12);
        g.fillStyle(0x8a684a, 1);
        g.fillEllipse(cx, cy - 2, 18, 9);
        break;
      case "tree":
        g.fillStyle(0x3a5f3a, 1);
        g.fillTriangle(cx - 16, cy + 10, cx + 16, cy + 10, cx, cy - 44);
        g.fillStyle(0x2c4828, 1);
        g.fillTriangle(cx - 12, cy - 4, cx + 12, cy - 4, cx, cy - 38);
        g.fillStyle(0x4a3a28, 1);
        g.fillRect(cx - 2, cy + 8, 4, 6);
        break;
      case "rock":
        g.fillStyle(0x7a7a78, 1);
        g.fillEllipse(cx, cy - 4, 22, 14);
        g.fillStyle(0x919190, 1);
        g.fillEllipse(cx - 4, cy - 7, 10, 6);
        break;
      case "flowers":
        g.fillStyle(0x6a8c4a, 1);
        g.fillEllipse(cx, cy, 20, 10);
        for (const dx of [-6, 0, 6]) {
          g.fillStyle(0xe8d56a, 1);
          g.fillCircle(cx + dx, cy - 2, 2);
        }
        break;
      case "sign":
        g.fillStyle(0x6a4a2a, 1);
        g.fillRect(cx - 1, cy - 4, 2, 14);
        g.fillStyle(0xc9a878, 1);
        g.fillRect(cx - 10, cy - 14, 20, 10);
        break;
      case "log":
        g.fillStyle(0x6a4a2e, 1);
        g.fillEllipse(cx, cy, 26, 10);
        g.fillStyle(0x8a6638, 1);
        g.fillEllipse(cx - 12, cy - 1, 6, 7);
        g.fillEllipse(cx + 12, cy - 1, 6, 7);
        break;
    }
  }
}
