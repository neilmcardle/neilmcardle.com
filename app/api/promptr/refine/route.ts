// Promptr refine endpoint.
//
// POST { prompt: string } → a single JSON object at the end of a
// streamed text response. The model is instructed to emit one valid
// JSON object (refined + changes). We stream raw text to the client,
// which accumulates and parses at the end. This is simpler and more
// robust than interleaving structured deltas — the refined text is
// typically short enough (< 1500 chars) that end-of-stream parsing
// doesn't lose any interactivity.
//
// Sonnet, because this is editorial rewriting where quality matters
// more than first-token latency.

import { NextRequest, NextResponse } from "next/server";
import { streamWithFallback, SystemBlock } from "@/app/api/ai/book-mind/_lib/anthropic";
import { checkPromptrRateLimit, getClientIp } from "../_lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RefineRequest {
  prompt: string;
}

const encoder = new TextEncoder();

const REFINE_SYSTEM = `You are a prompt editor for Neil McArdle's Promptr workshop. The user gives you a prompt and asks for a refined version. Your job: rewrite it so it would score at world-class on the rubric (clarity, specificity, role, constraints, output format, examples) while preserving the author's intent and voice.

STRICT OUTPUT RULES
- Return exactly one JSON object. No preamble, no postamble, no code fences, no comments.
- The first character of your response is "{".
- The last character is "}".
- No em dashes anywhere in the output.
- Do not narrate. The JSON is the entire response.

SCHEMA
{
  "refined": "<the rewritten prompt, a single string>",
  "changes": ["<bullet 1>", "<bullet 2>", "<bullet 3>"]
}

RULES FOR THE REWRITE
- Keep the author's goal and voice. Do not turn a casual brief into a corporate one.
- Add the missing specifics the rubric would flag: audience, tone, format, constraints, a role or frame if one fits, a brief example if one would anchor the style.
- Do not invent requirements the original did not imply.
- The rewritten prompt should be tighter than the original if possible, longer only if adding specifics demands it.
- Keep it readable as a single prompt someone could paste.

RULES FOR THE CHANGES BULLETS
- Maximum three bullets. Each is one sentence.
- Name what you added or cut, not how you felt about it.
- Do not use em dashes.
- Do not include bullet characters in the strings. The client renders them.

Begin your JSON response immediately.`;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = checkPromptrRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: rate.message ?? "Rate limit exceeded" },
      { status: 429 },
    );
  }

  let body: RefineRequest;
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

  const systemBlocks: SystemBlock[] = [{ type: "text", text: REFINE_SYSTEM }];
  const messages = [
    {
      role: "user" as const,
      content: `Refine this prompt. Return only the JSON object.\n\nORIGINAL PROMPT:\n"""\n${prompt}\n"""`,
    },
  ];

  // Stream raw text deltas to the client as plain text. The client
  // accumulates and JSON.parses at the end. We don't wrap in SSE
  // because there's no incremental structure to reveal, and plain text
  // avoids a second layer of framing.
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const delta of streamWithFallback({
          tier: "background",
          systemBlocks,
          messages,
          maxTokens: 2048,
          temperature: 0.5,
        })) {
          controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Refine failed";
        controller.enqueue(encoder.encode(`\n{"error":${JSON.stringify(message)}}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
