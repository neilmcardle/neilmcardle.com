"use server";

import { createCoverlyPublicClient } from "@/lib/coverly/supabase/public";
import { withHeights } from "@/lib/coverly/book-size";
import {
  applyCoverFilters,
  fetchCoverPage,
  type CoverCard,
  type CoverFilters,
} from "@/lib/coverly/queries";

export type MapPoint = {
  id: string;
  title: string;
  author: string | null;
  year: number | null;
  image_url: string;
  hex: string;
};

const MAP_CHUNK = 1000;

export async function fetchMapPoints(
  filters: CoverFilters,
): Promise<MapPoint[]> {
  const supabase = createCoverlyPublicClient();
  if (!supabase) return [];

  const points: MapPoint[] = [];
  for (let from = 0; from < 12000; from += MAP_CHUNK) {
    const base = supabase
      .from("covers")
      .select("id, title, author, year, image_url, palette")
      .not("sub_genre", "is", null)
      .eq("delisted", false)
      .not("palette", "is", null)
      .range(from, from + MAP_CHUNK - 1);

    const { data, error } = await applyCoverFilters(base, filters);
    if (error) break;

    const rows = (data ?? []) as {
      id: string;
      title: string;
      author: string | null;
      year: number | null;
      image_url: string;
      palette: { colors: string[] } | null;
    }[];

    for (const row of rows) {
      const hex = row.palette?.colors?.[0];
      if (!hex) continue;
      points.push({
        id: row.id,
        title: row.title,
        author: row.author,
        year: row.year,
        image_url: row.image_url,
        hex,
      });
    }
    if (rows.length < MAP_CHUNK) break;
  }
  return points;
}

export async function loadMoreCovers(
  filters: CoverFilters,
  page: number,
): Promise<{ covers: CoverCard[]; total: number }> {
  const supabase = createCoverlyPublicClient();
  if (!supabase) return { covers: [], total: 0 };

  const { covers, total } = await fetchCoverPage(supabase, filters, page);
  return { covers: withHeights(covers), total };
}

export type CoverDetailData = {
  id: string;
  isbn13: string | null;
  image_url: string;
  title: string;
  author: string | null;
  imprint: string | null;
  year: number | null;
  designer_credit: string | null;
  sub_genre: string | null;
  art_style: string | null;
  typography: string | null;
  people: string | null;
  layout: string | null;
  palette: { colors: string[]; is_dark: boolean } | null;
};

export async function fetchCoverDetail(
  id: string,
): Promise<CoverDetailData | null> {
  const supabase = createCoverlyPublicClient();
  if (!supabase) return null;

  const { data: cover } = await supabase
    .from("covers")
    .select(
      "id, isbn13, image_url, title, author, imprint, year, designer_credit, sub_genre, art_style, typography, people, layout, palette",
    )
    .eq("id", id)
    .eq("delisted", false)
    .maybeSingle();
  if (!cover) return null;

  return cover as CoverDetailData;
}

export async function fetchSimilarCovers(id: string): Promise<CoverCard[]> {
  const supabase = createCoverlyPublicClient();
  if (!supabase) return [];

  const { data: source } = await supabase
    .from("covers")
    .select("sub_genre, art_style, color_families")
    .eq("id", id)
    .eq("delisted", false)
    .maybeSingle();
  if (!source) return [];

  const { data: rpcData } = await supabase
    .rpc("similar_covers", { source_cover_id: id, match_count: 12 })
    .select("id, title, author, imprint, year, image_url, palette");
  let similar = (Array.isArray(rpcData) ? rpcData : []) as CoverCard[];

  if (similar.length < 6) {
    const typed = source as {
      sub_genre: string | null;
      art_style: string | null;
      color_families: string[] | null;
    };
    const colors = typed.color_families ?? [];
    const ors: string[] = [];
    if (typed.sub_genre) ors.push(`sub_genre.eq.${typed.sub_genre}`);
    if (colors.length) ors.push(`color_families.ov.{${colors.join(",")}}`);

    let pool = supabase
      .from("covers")
      .select(
        "id, title, author, imprint, year, image_url, palette, sub_genre, art_style, color_families",
      )
      .neq("id", id)
      .not("sub_genre", "is", null)
      .eq("delisted", false)
      .order("year", { ascending: false, nullsFirst: false })
      .limit(40);
    if (ors.length) pool = pool.or(ors.join(","));

    const { data: poolData } = await pool;
    similar = (poolData ?? [])
      .map((c) => {
        const cc = c as CoverCard & {
          sub_genre: string | null;
          art_style: string | null;
          color_families: string[] | null;
        };
        const overlap = (cc.color_families ?? []).filter((f) =>
          colors.includes(f),
        ).length;
        const score =
          (cc.sub_genre === typed.sub_genre ? 3 : 0) +
          overlap +
          (cc.art_style === typed.art_style ? 1 : 0);
        return { cc, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(({ cc }) => cc as CoverCard);
  }

  return similar;
}
