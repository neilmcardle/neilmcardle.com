// Standard 2:1 isometric ratio. Keeps tile diamonds twice as wide
// as they are tall, which matches Kenney's iso pack dimensions.
export const TILE_W = 64;
export const TILE_H = 32;

export function tileToScreen(col: number, row: number): { x: number; y: number } {
  return {
    x: ((col - row) * TILE_W) / 2,
    y: ((col + row) * TILE_H) / 2,
  };
}

export function screenToTile(x: number, y: number): { col: number; row: number } {
  const col = Math.round((x / (TILE_W / 2) + y / (TILE_H / 2)) / 2);
  const row = Math.round((y / (TILE_H / 2) - x / (TILE_W / 2)) / 2);
  return { col, row };
}
