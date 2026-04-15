// Promptr score endpoint.
//
// POST { prompt: string } → NDJSON stream. One JSON line per rubric
// dimension, then one summary line. The client parses incrementally so
// the scorecard populates card-by-card as the model emits it, which is
// the main UX moment for the tool.
//
// Haiku, because this is the live path and must feel sub-second to
// first token. Prompt caching isn't useful here (no persistent context),
// so we just stream straight through.

import { NextRequest, NextResponse } from "next/server";
import { streamWithFallback, SystemBlock } from "@/app/api/ai/book-mind/_lib/anthropic";
import { checkPromptrRateLimit, getClientIp } from "../_lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ScoreRequest {
  prompt: string;
}

const encoder = new TextEncoder();

function ndjsonLine(obj: unknown): Uint8Array {
  return encoder.encode(JSON.stringify(obj) + "\n");
}

const SCORE_SYSTEM = `You are a prompt critic for Neil McArdle's Promptr workshop. The user pastes a prompt, and you score it against six dimensions on a 0–5 scale:

1. clarity: is the goal obvious in one read
2. specificity: are audience, tone, domain, and output shape named
3. role: is there a persona or frame of reference
4. constraints: is what's in and out bounded
5. output_format: is the response structure named
6. examples: is there a shot of what good looks like

For each dimension, return one sentence naming the gap ("explanation") and one sentence suggesting a concrete fix ("improvement"). Be specific, direct, and literary. Never hedge.

STRICT FORMAT RULES
- NO em dashes. Use commas, colons, or full stops.
- Every sentence ends with a full stop.
- Return NDJSON: one JSON object per line, no wrapping array, no code fences, no prose before or after.
- Emit dimensions in this exact order: clarity, specificity, role, constraints, output_format, examples.
- After the six dimension lines, emit exactly one summary line.
- Nothing else. No blank lines between objects.

SCHEMA
Dimension line:
  {"type":"dimension","key":"<key>","score":<0-5>,"explanation":"<one sentence>","improvement":"<one sentence>"}

Summary line:
  {"type":"summary","total":<sum 0-30>,"category":"weak"|"decent"|"strong"|"world-class","headline":"<one literary sentence>"}

CATEGORY THRESHOLDS
- 0–12 weak
- 13–20 decent
- 21–24 strong
- 25–30 world-class

Begin emitting NDJSON immediately. First character of your response must be "{".`;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = checkPromptrRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: rate.message ?? "Rate limit exceeded" },
      { status: 429 },
    );
  }

  let body: ScoreRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
  }
  if (prompt.length > 8000) {
    return NextResponse.json(
      { error: "Prompt is too long. Keep it under 8000 characters." },
      { status: 400 },
    );
  }

  const systemBlocks: SystemBlock[] = [{ type: "text", text: SCORE_SYSTEM }];
  const messages = [
    {
      role: "user" as const,
      content: `Score this prompt. Remember: one NDJSON line per dimension in canonical order, then one summary line. Nothing else.\n\nPROMPT:\n"""\n${prompt}\n"""`,
    },
  ];

  // Buffer text deltas across newlines: the model emits one JSON object
  // per line, but a single delta can span a line boundary. We accumulate
  // bytes, split on '\n', and re-emit complete lines only. The buffer
  // survives across reads until the stream ends or a final newline
  // arrives.
  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        for await (const delta of streamWithFallback({
          tier: "live",
          systemBlocks,
          messages,
          maxTokens: 2048,
          temperature: 0.3,
        })) {
          buffer += delta;
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            controller.enqueue(encoder.encode(trimmed + "\n"));
          }
        }
        // Flush any trailing line
        const trailing = buffer.trim();
        if (trailing) controller.enqueue(encoder.encode(trailing + "\n"));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Scoring failed";
        controller.enqueue(ndjsonLine({ type: "error", error: message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
