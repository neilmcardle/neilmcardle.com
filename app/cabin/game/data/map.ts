import type { Map2D, PlaceholderObject } from "../types";

export const MAP_SIZE = 32;

const CENTER = MAP_SIZE / 2;
const RADIUS = 14;

const STREAM_PATH: Array<[number, number]> = [
  [4, 22],
  [6, 24],
  [8, 25],
  [10, 26],
  [12, 26],
  [13, 24],
];

const PATH_TILES: Array<[number, number]> = [
  [18, 28],
  [18, 26],
  [17, 24],
  [17, 22],
  [17, 20],
  [17, 18],
];

const DECK = { col0: 16, col1: 19, row0: 14, row1: 17 };

function inDeck(col: number, row: number): boolean {
  return col >= DECK.col0 && col <= DECK.col1 && row >= DECK.row0 && row <= DECK.row1;
}

function nearStream(col: number, row: number): boolean {
  for (const [c, r] of STREAM_PATH) {
    if (Math.abs(col - c) <= 1 && Math.abs(row - r) <= 1) return true;
  }
  return false;
}

function onPath(col: number, row: number): boolean {
  return PATH_TILES.some(([c, r]) => c === col && r === row);
}

export function generateMap(): Map2D {
  const map: Map2D = [];
  for (let row = 0; row < MAP_SIZE; row++) {
    map[row] = [];
    for (let col = 0; col < MAP_SIZE; col++) {
      const dx = col - CENTER;
      const dy = row - CENTER;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > RADIUS) {
        map[row][col] = { type: "off", walkable: false };
      } else if (inDeck(col, row)) {
        map[row][col] = { type: "deck", walkable: true };
      } else if (nearStream(col, row)) {
        map[row][col] = { type: "water", walkable: false };
      } else if (onPath(col, row)) {
        map[row][col] = { type: "path", walkable: true };
      } else {
        map[row][col] = { type: "grass", walkable: true };
      }
    }
  }
  return map;
}

// Placeholder objects rendered as simple shapes in Phase 1. In Phase 2
// these become real Kenney sprites and most of this file moves to
// data/objects.ts with story copy + actions attached.
export const PLACEHOLDER_OBJECTS: PlaceholderObject[] = [
  { id: "cabin", kind: "cabin", col: 17, row: 15 },
  { id: "hotTub", kind: "hotTub", col: 16, row: 16 },
  { id: "tree-n", kind: "tree", col: 16, row: 4 },
  { id: "tree-ne", kind: "tree", col: 22, row: 6 },
  { id: "tree-e", kind: "tree", col: 26, row: 13 },
  { id: "tree-se", kind: "tree", col: 24, row: 22 },
  { id: "tree-s", kind: "tree", col: 20, row: 27 },
  { id: "tree-w", kind: "tree", col: 5, row: 14 },
  { id: "tree-nw", kind: "tree", col: 9, row: 6 },
  { id: "tree-ne2", kind: "tree", col: 19, row: 7 },
  { id: "rock-1", kind: "rock", col: 12, row: 22 },
  { id: "rock-2", kind: "rock", col: 25, row: 20 },
  { id: "rock-3", kind: "rock", col: 8, row: 18 },
  { id: "flowers-1", kind: "flowers", col: 14, row: 23 },
  { id: "flowers-2", kind: "flowers", col: 22, row: 13 },
  { id: "sign", kind: "sign", col: 18, row: 27 },
  { id: "log", kind: "log", col: 14, row: 25 },
];
