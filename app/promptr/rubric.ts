// The Promptr rubric — the content backbone of the tool.
//
// Six dimensions, each scored 0–5 by the model. Total /30, placed into
// one of four named categories. Every consumer (score endpoint, client
// renderer, lesson cards) imports from this file so the dimensions are
// defined exactly once and in one canonical order.

export type DimensionKey =
  | "clarity"
  | "specificity"
  | "role"
  | "constraints"
  | "output_format"
  | "examples";

export type RubricCategory = "weak" | "decent" | "strong" | "world-class";

export interface RubricDimension {
  key: DimensionKey;
  label: string;
  score: number;        // 0–5
  explanation: string;  // one sentence: the gap
  improvement: string;  // one sentence: the concrete fix
}

export interface RubricSummary {
  total: number;         // 0–30
  category: RubricCategory;
  headline: string;      // one literary sentence
}

export interface RubricResponse {
  dimensions: RubricDimension[];
  summary: RubricSummary;
}

export interface RefineResponse {
  refined: string;
  changes: string[];     // 1–3 short bullets
}

// Canonical display order. The model is instructed to emit dimensions
// in exactly this order; the client also renders them in this order so
// the ordered NDJSON stream maps trivially to the UI.
export const DIMENSIONS: Array<{ key: DimensionKey; label: string }> = [
  { key: "clarity",       label: "Clarity" },
  { key: "specificity",   label: "Specificity" },
  { key: "role",          label: "Role & Context" },
  { key: "constraints",   label: "Constraints" },
  { key: "output_format", label: "Output format" },
  { key: "examples",      label: "Examples" },
];

// Bucket a score /30 into one of the four named categories. Kept as a
// pure function so the client can sanity-check the model's own category
// assignment (and recover gracefully if the model disagrees).
export function categoryFor(total: number): RubricCategory {
  if (total <= 12) return "weak";
  if (total <= 20) return "decent";
  if (total <= 24) return "strong";
  return "world-class";
}

// Literary one-liners for each category, used as a fallback if the
// model's own headline arrives malformed. Intentionally short and
// opinionated — they match the brand voice.
export const CATEGORY_HEADLINES: Record<RubricCategory, string> = {
  "weak":        "This prompt leaves most of the work to the model.",
  "decent":      "The model can work with this, but it will guess.",
  "strong":      "Tight and actionable. A good draft.",
  "world-class": "Nothing to cut, nothing to add.",
};

// Human-readable labels for the category chip in the UI.
export const CATEGORY_LABELS: Record<RubricCategory, string> = {
  "weak":        "Weak",
  "decent":      "Decent",
  "strong":      "Strong",
  "world-class": "World-class",
};
