import type { SupabaseClient } from "@supabase/supabase-js";

export const PAGE_SIZE = 40;

export type CoverCard = {
  id: string;
  isbn13: string | null;
  title: string;
  author: string | null;
  imprint: string | null;
  year: number | null;
  image_url: string;
  palette: { colors: string[]; is_dark: boolean } | null;
  height_cm?: number;
};

export type CoverFilters = {
  q?: string;
  sub_genre?: string[];
  art_style?: string[];
  typography?: string[];
  people?: string[];
  layout?: string[];
  color?: string[];
  publisher_tier?: string[];
  tone?: "light" | "dark";
  year_min?: number;
  year_max?: number;
  curatedOnly?: boolean;
};

type FilterChain = {
  eq: (column: string, value: unknown) => FilterChain;
  in: (column: string, values: readonly unknown[]) => FilterChain;
  overlaps: (column: string, values: readonly unknown[]) => FilterChain;
  gte: (column: string, value: unknown) => FilterChain;
  lte: (column: string, value: unknown) => FilterChain;
  or: (filters: string) => FilterChain;
};

export function applyCoverFilters<T>(query: T, filters: CoverFilters): T {
  let q = query as FilterChain;
  if (filters.curatedOnly) q = q.eq("curated", true);
  for (const facet of [
    "sub_genre",
    "art_style",
    "typography",
    "people",
    "layout",
    "publisher_tier",
  ] as const) {
    const values = filters[facet];
    if (values && values.length > 0) q = q.in(facet, values);
  }
  if (filters.color && filters.color.length > 0)
    q = q.overlaps("color_families", filters.color);
  if (filters.tone) q = q.eq("palette_is_dark", filters.tone === "dark");
  if (filters.year_min != null) q = q.gte("year", filters.year_min);
  if (filters.year_max != null) q = q.lte("year", filters.year_max);
  if (filters.q) {
    const term = filters.q.replace(/[%_(),*\\]/g, " ").trim();
    if (term) q = q.or(`title.ilike.*${term}*,author.ilike.*${term}*`);
  }
  return q as T;
}

export async function fetchCoverPage(
  supabase: SupabaseClient,
  filters: CoverFilters,
  page: number,
): Promise<{ covers: CoverCard[]; total: number }> {
  const from = page * PAGE_SIZE;
  const base = supabase
    .from("covers")
    .select("id, isbn13, title, author, imprint, year, image_url, palette", {
      count: "exact",
    })
    .not("sub_genre", "is", null)
    .eq("delisted", false)
    .order("year", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const { data, count, error } = await applyCoverFilters(base, filters);
  if (error) throw new Error(error.message);
  return { covers: (data ?? []) as CoverCard[], total: count ?? 0 };
}

export function filtersFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
): CoverFilters {
  const list = (v: string | string[] | undefined) =>
    v == null
      ? undefined
      : (Array.isArray(v) ? v : v.split(",")).filter(Boolean);
  const num = (v: string | string[] | undefined) => {
    const n = Number(Array.isArray(v) ? v[0] : v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const tone = Array.isArray(sp.tone) ? sp.tone[0] : sp.tone;
  return {
    q: typeof sp.q === "string" && sp.q.trim() ? sp.q.trim() : undefined,
    sub_genre: list(sp.sub_genre),
    art_style: list(sp.art_style),
    typography: list(sp.typography),
    people: list(sp.people),
    layout: list(sp.layout),
    publisher_tier: list(sp.publisher_tier),
    color: list(sp.color),
    tone: tone === "light" || tone === "dark" ? tone : undefined,
    year_min: num(sp.year_min),
    year_max: num(sp.year_max),
  };
}
