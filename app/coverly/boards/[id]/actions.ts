"use server";

import { createCoverlyPublicClient } from "@/lib/coverly/supabase/public";
import { withHeights } from "@/lib/coverly/book-size";
import { type CoverCard } from "@/lib/coverly/queries";

export async function fetchBoardCovers(
  coverIds: string[],
): Promise<CoverCard[]> {
  if (!coverIds.length) return [];

  const supabase = createCoverlyPublicClient();
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from("covers")
      .select("id, isbn13, title, author, imprint, year, image_url, palette")
      .in("id", coverIds)
      .eq("delisted", false);

    const byId = new Map(
      ((data as CoverCard[]) ?? []).map((cover) => [cover.id, cover]),
    );
    const ordered = coverIds
      .map((id) => byId.get(id))
      .filter((cover): cover is CoverCard => cover !== undefined);

    return withHeights(ordered);
  } catch {
    return [];
  }
}
