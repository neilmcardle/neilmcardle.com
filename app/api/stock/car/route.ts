import { NextResponse } from "next/server";

const FEED =
  "https://query1.finance.yahoo.com/v8/finance/chart/CAR?range=1d&interval=5m";

export async function GET() {
  try {
    const response = await fetch(FEED, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const meta = result?.meta;
    const closes: unknown[] = result?.indicators?.quote?.[0]?.close ?? [];
    const points = closes
      .filter((value): value is number => typeof value === "number")
      .map((value) => Math.round(value * 100) / 100);
    const price = Number(meta?.regularMarketPrice);
    const previous = Number(meta?.chartPreviousClose ?? meta?.previousClose);
    if (!Number.isFinite(price) || !Number.isFinite(previous)) {
      throw new Error("No price");
    }
    const change = price - previous;
    return NextResponse.json(
      {
        price,
        change,
        percent: (change / previous) * 100,
        time: Number(meta?.regularMarketTime) * 1000 || null,
        points,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
