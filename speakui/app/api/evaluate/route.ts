import { check, spentCookie, usedBy } from "@/lib/demo/limits";

const ENDPOINT = "https://api.typesafe.ai/v1/systemone";
const MODEL = process.env.JEV_MODEL ?? "jev-latest";
const MAX_BODY_BYTES = 200_000;

export async function POST(req: Request): Promise<Response> {
  const key = process.env.TYPESAFE_API_KEY;
  if (!key) {
    return Response.json(
      {
        error:
          "No TYPESAFE_API_KEY. Add it to .env.local and restart the dev server.",
      },
      { status: 503 },
    );
  }

  const verdict = check(req);
  if (!verdict.ok) {
    return Response.json(
      { error: verdict.message, limit: verdict.reason },
      { status: 429 },
    );
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ error: "Request too large." }, { status: 413 });
  }

  let body: { state?: unknown; questions?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const started = performance.now();
  let upstream: Response;
  try {
    upstream = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        state: body.state,
        questions: body.questions,
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    const timedOut = (err as Error).name === "TimeoutError";
    return Response.json(
      {
        error: timedOut
          ? "Jev timed out after 15s."
          : "Couldn't reach TypeSafe.",
      },
      { status: 502 },
    );
  }
  const ms = Math.round(performance.now() - started);

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    const reason: Record<number, string> = {
      401: "TypeSafe rejected the API key (401). Check TYPESAFE_API_KEY in .env.local.",
      402: "TypeSafe says billing or credits are needed (402). Check the Usage page in the console.",
      422: "TypeSafe rejected the request shape (422).",
      429: "Rate limited by TypeSafe (429). Wait a moment.",
      529: "TypeSafe is overloaded (529). Try again shortly.",
    };
    console.error("[jev]", upstream.status, detail.slice(0, 500));
    return Response.json(
      {
        error: reason[upstream.status] ?? `TypeSafe error ${upstream.status}.`,
        detail: detail.slice(0, 500),
      },
      { status: upstream.status },
    );
  }

  const data = await upstream.json();

  return Response.json(
    { ...data, ms },
    { headers: { "Set-Cookie": spentCookie(usedBy(req)) } },
  );
}
