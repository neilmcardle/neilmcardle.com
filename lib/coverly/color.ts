export const COLOR_FAMILIES = [
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "purple",
  "pink",
  "neutral",
] as const;

export type ColorFamily = (typeof COLOR_FAMILIES)[number];

export const FAMILY_SWATCH: Record<ColorFamily, string> = {
  red: "#c0392b",
  orange: "#e07b39",
  yellow: "#d9b310",
  green: "#3f8f4f",
  teal: "#2e8b8b",
  blue: "#2f5fa8",
  purple: "#6b4fa0",
  pink: "#c2557f",
  neutral: "#8a8a8a",
};

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return { h, s, l };
}

export function hexToFamily(hex: string): ColorFamily {
  const { h, s, l } = hexToHsl(hex);
  if (s < 0.18 || l < 0.08 || l > 0.94) return "neutral";
  if (h < 15 || h >= 345) return "red";
  if (h < 45) return "orange";
  if (h < 70) return "yellow";
  if (h < 160) return "green";
  if (h < 195) return "teal";
  if (h < 255) return "blue";
  if (h < 290) return "purple";
  return "pink";
}

export function paletteFamilies(colors: string[]): ColorFamily[] {
  const all = [...new Set(colors.map(hexToFamily))];
  const hued = all.filter((f) => f !== "neutral");
  return hued.length > 0 ? hued : ["neutral"];
}
