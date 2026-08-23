import type { Cover } from "./CoverMarquee";

const URL_BASE = process.env.NEXT_PUBLIC_COVERLY_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_COVERLY_SUPABASE_ANON_KEY;

const QUERY =
  "covers?select=title,image_url" +
  "&image_url=not.is.null" +
  "&sub_genre=not.is.null" +
  "&delisted=is.false" +
  "&order=year.desc.nullslast" +
  "&limit=48";

const COUNT_QUERY =
  "covers?select=id&image_url=not.is.null&sub_genre=not.is.null&delisted=is.false";

export async function fetchCovers(): Promise<{
  covers: Cover[];
  count: number;
}> {
  if (!URL_BASE || !ANON) return { covers: [], count: 0 };
  const headers = { apikey: ANON, Authorization: `Bearer ${ANON}` };

  try {
    const [rowsRes, countRes] = await Promise.all([
      fetch(`${URL_BASE}/rest/v1/${QUERY}`, {
        headers,

        next: { revalidate: 3600 },
      }),
      fetch(`${URL_BASE}/rest/v1/${COUNT_QUERY}`, {
        headers: { ...headers, Prefer: "count=exact", Range: "0-0" },
        next: { revalidate: 3600 },
      }),
    ]);

    const rows = rowsRes.ok
      ? ((await rowsRes.json()) as { title: string; image_url: string }[])
      : [];
    const range = countRes.headers.get("content-range");
    const count = range ? Number(range.split("/")[1]) || 0 : 0;

    return {
      covers: rows.map((r) => ({ src: r.image_url, title: r.title ?? "" })),
      count,
    };
  } catch {
    return { covers: [], count: 0 };
  }
}
