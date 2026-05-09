export type TileType = "grass" | "path" | "water" | "deck" | "off";

export interface MapTile {
  type: TileType;
  walkable: boolean;
}

export type Map2D = MapTile[][];

export interface PlaceholderObject {
  id: string;
  kind: "cabin" | "tree" | "rock" | "hotTub" | "flowers" | "sign" | "log";
  col: number;
  row: number;
}
