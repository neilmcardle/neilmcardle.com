import { z } from "zod";

export const GENRES = ["thriller"] as const;

export const SUB_GENRES: Record<(typeof GENRES)[number], readonly string[]> = {
  thriller: ["psychological", "domestic", "procedural", "legal", "spy"],
} as const;

export const ART_STYLES = [
  "illustrated",
  "photographic",
  "type-only",
  "mixed",
] as const;
export const TYPOGRAPHY = [
  "serif",
  "sans",
  "script",
  "hand-lettered",
  "mixed",
] as const;
export const PEOPLE = ["none", "figure-no-face", "face-visible"] as const;
export const LAYOUTS = [
  "full-bleed-art",
  "framed-panel",
  "typographic",
  "photographic-object",
] as const;

export const VisionTagsSchema = z.object({
  sub_genre: z.enum(SUB_GENRES.thriller as [string, ...string[]]),
  art_style: z.enum(ART_STYLES),
  typography: z.enum(TYPOGRAPHY),
  people: z.enum(PEOPLE),
  layout: z.enum(LAYOUTS),
  confidence: z.enum(["high", "medium", "low"]),
});

export type VisionTags = z.infer<typeof VisionTagsSchema>;

export type Palette = {
  colors: string[];
  is_dark: boolean;
};
