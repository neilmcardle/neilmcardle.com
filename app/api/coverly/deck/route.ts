import { NextResponse } from "next/server";
import { createCoverlyPublicClient } from "@/lib/coverly/supabase/public";
import { renderDeck, type DeckCover } from "@/lib/coverly/pdf/deck";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_COVERS = 120;

export async function POST(req: Request) {
  let body: { boardName?: unknown; coverIds?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid request body" },
      { status: 400 },
    );
  }

  const boardName =
    typeof body.boardName === "string" && body.boardName.trim()
      ? body.boardName.trim().slice(0, 120)
      : "Untitled board";

  const coverIds = Array.isArray(body.coverIds)
    ? body.coverIds
        .filter((id): id is string => typeof id === "string")
        .slice(0, MAX_COVERS)
    : [];

  if (coverIds.length === 0) {
    return NextResponse.json({ error: "board is empty" }, { status: 400 });
  }

  const supabase = createCoverlyPublicClient();
  if (!supabase) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("covers")
    .select("id, title, author, imprint, year, designer_credit, image_url")
    .in("id", coverIds)
    .eq("delisted", false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byId = new Map(
    (data ?? []).map((row) => [row.id, row as DeckCover & { id: string }]),
  );
  const covers: DeckCover[] = coverIds
    .map((id) => byId.get(id))
    .filter((row): row is DeckCover & { id: string } => Boolean(row));

  if (covers.length === 0) {
    return NextResponse.json(
      { error: "every cover on this board is unavailable" },
      { status: 400 },
    );
  }

  try {
    const buffer = await renderDeck({ boardName, covers });
    const slug = boardName
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    const filename = `${/comps?$/.test(slug) ? slug : `${slug}-comps`}.pdf`;
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("coverly deck render failed", err);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 },
    );
  }
}
