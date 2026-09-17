export type LandingCover = {
  id: string;
  isbn: string;
  title: string;
  author: string;
  imprint: string;
  year: number | null;
  subGenre: string;
  artStyle: string;
  typography: string;
  layout: string;
  colors: string[];
  families: string[];
  dark: boolean;
  src: string;
};

export type LandingData = {
  covers: LandingCover[];
  count: number;
};

type Row = {
  id: string;
  isbn13: string | null;
  title: string | null;
  author: string | null;
  imprint: string | null;
  year: number | null;
  sub_genre: string | null;
  art_style: string | null;
  typography: string | null;
  layout: string | null;
  color_families: string[] | null;
  palette: { colors: string[]; is_dark: boolean } | null;
  image_url: string;
};

const FIELDS =
  "id,isbn13,title,author,imprint,year,sub_genre,art_style,typography,layout,color_families,palette,image_url";

function tidyTitle(title: string) {
  return title
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/:\s*(A|An)\s+(Novel|Thriller)\b.*$/i, "")
    .replace(/\s+(A|An)\s+(Novel|Thriller)$/i, "")
    .trim();
}

function tidyAuthor(author: string | null) {
  if (!author) return "Unknown";
  const parts = author.split(",").map((p) => p.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : author;
}

export async function fetchLandingCovers(): Promise<LandingData> {
  const base = process.env.NEXT_PUBLIC_COVERLY_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_COVERLY_SUPABASE_ANON_KEY;
  if (!base || !key) return { covers: [], count: 0 };
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const filters =
    "image_url=not.is.null&sub_genre=not.is.null&delisted=is.false&palette=not.is.null";

  try {
    const [rowsRes, countRes] = await Promise.all([
      fetch(
        `${base}/rest/v1/covers?select=${FIELDS}&${filters}&order=year.desc.nullslast&limit=420`,
        { headers, next: { revalidate: 3600 } },
      ),
      fetch(
        `${base}/rest/v1/covers?select=id&image_url=not.is.null&sub_genre=not.is.null&delisted=is.false`,
        {
          headers: { ...headers, Prefer: "count=exact", Range: "0-0" },
          next: { revalidate: 3600 },
        },
      ),
    ]);
    const rows: Row[] = rowsRes.ok ? await rowsRes.json() : [];
    const range = countRes.headers.get("content-range");
    const count = range ? Number(range.split("/")[1]) || 0 : 0;

    const covers = rows
      .filter((r) => r.palette?.colors?.length && r.title)
      .map((r) => ({
        id: r.id,
        isbn: r.isbn13 ?? "",
        title: tidyTitle(r.title ?? ""),
        author: tidyAuthor(r.author),
        imprint: r.imprint ?? "Independent",
        year: r.year,
        subGenre: r.sub_genre ?? "",
        artStyle: r.art_style ?? "",
        typography: r.typography ?? "",
        layout: r.layout ?? "",
        colors: r.palette?.colors ?? [],
        families: r.color_families ?? [],
        dark: r.palette?.is_dark ?? true,
        src: r.image_url,
      }));

    return { covers, count };
  } catch {
    return { covers: [], count: 0 };
  }
}
