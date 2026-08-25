"use server";

import { createCoverlyPublicClient } from "@/lib/coverly/supabase/public";
import { withHeights } from "@/lib/coverly/book-size";
import { type CoverCard } from "@/lib/coverly/queries";

export async function fetchLikedCovers(
  likedIds: string[],
): Promise<CoverCard[]> {
  if (!likedIds.length) return [];

  const supabase = createCoverlyPublicClient();
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from("covers")
      .select("id, isbn13, title, author, imprint, year, image_url, palette")
      .in("id", likedIds)
      .eq("delisted", false);

    return withHeights((data as CoverCard[]) ?? []);
  } catch {
    return [];
  }
}
