// Generate a ManuscriptBrief in one streaming call.
//
// Called once per book per manuscript-edit cycle, in the background,
// while the author writes. The brief is the spine of every fast Book
// Mind interaction: it lets us answer chat questions and run inline
// edits without re-shipping the whole manuscript on every turn.
//
// Streams NDJSON: one JSON object per chapter, separated by newlines.
// Each line looks like:
//   {"type":"chapter","summary":{"summary":"...","keyEntities":["R.","Mars"]}}
// The client parses lines as they arrive so the Inspector status strip
// can show "indexed 12 of 38 chapters…" while the brief generates.

import { NextRequest, NextResponse } from 'next/server';
import { requireProUser } from '../_lib/proAuth';
import { streamWithFallback, SystemBlock } from '../_lib/anthropic';

export const runtime = 'nodejs';
// Hobby plan caps serverless functions at 60s. Haiku 4.5 completes a
// 200K-word brief in roughly 30-45s with streaming, so 60s leaves
// headroom without hitting the ceiling. If a genuinely huge manuscript
// ever runs over, we'll need to chunk the brief into per-chapter calls
// (each well under 60s) rather than raise this value.
export const maxDuration = 60;

interface BriefRequest {
  chapters: Array<{ id: string; title: string; content: string; type: string }>;
  title?: string;
  author?: string;
  genre?: string;
}

const encoder = new TextEncoder();

function ndjsonLine(obj: unknown): Uint8Array {
  return encoder.encode(JSON.stringify(obj) + '\n');
}

export async function POST(req: NextRequest) {
  const auth = await requireProUser(req);
  if (!auth.ok) return auth.response!;

  let body: BriefRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.chapters || body.chapters.length === 0) {
    return NextResponse.json({ error: 'No chapters provided' }, { status: 400 });
  }

  // Build the manuscript block. Marked as a prompt-cache breakpoint so a
  // partial-refresh re-call within 5 minutes pays 10% input cost.
  const manuscriptBlock = body.chapters
    .map((ch, i) => `[CHAPTER ${i + 1}] [${ch.type.toUpperCase()}] ${ch.title || `Chapter ${i + 1}`}\n${ch.content}`)
    .join('\n\n---\n\n');

  const systemBlocks: SystemBlock[] = [
    {
      type: 'text',
      text: `You are Book Mind's indexer. Your job is to read a complete manuscript and emit one structured summary per chapter, in order. The output is consumed by an editorial AI that uses these summaries to ground its answers without re-reading the whole book.

Output format: NDJSON, one chapter per line. Each line MUST be a single valid JSON object of exactly this shape:

{"type":"chapter","summary":{"summary":"<2-3 sentences, what happens>","keyEntities":["<character>","<place>","<distinctive object>",...]}}

Rules:
- One line per chapter, in the order chapters appear in the manuscript. Do not skip chapters. Do not emit anything else (no preamble, no closing remarks, no markdown, no code fences).
- summary: 2-3 plain sentences in the past tense, focused on what happens and what's at stake. No literary commentary, no themes, no opinion. Just the events.
- keyEntities: 3-10 distinct nouns that appear in the chapter and would help a future reader find this chapter again. Prefer character names, place names, distinctive objects, scene markers. Skip generic words ("man", "house", "day"). Capitalize as in the source.
- Never use em dashes. Use commas, colons, or full stops.
- If a chapter is empty or near-empty, emit a summary of "(empty)" and an empty keyEntities array.

Begin emitting NDJSON immediately. Do not include any text before the first JSON object.`,
    },
    {
      type: 'text',
      text: `Book metadata:
- Title: ${body.title || 'Untitled'}
- Author: ${body.author || 'Unknown'}
- Genre: ${body.genre || 'Not specified'}
- ${body.chapters.length} chapters total

=== MANUSCRIPT ===
${manuscriptBlock}
=== END ===`,
      cache_control: { type: 'ephemeral' },
    },
  ];

  const stream = new ReadableStream({
    async start(controller) {
      // Buffer text deltas across newlines: the model emits NDJSON one
      // chapter per line, and a single delta may span a line boundary
      // (or contain multiple lines). We accumulate, split on \n, parse
      // complete lines, and emit them to the client as they're ready.
      let buffer = '';
      try {
        for await (const delta of streamWithFallback({
          tier: 'live', // Haiku — brief is information extraction, not editorial judgment
          systemBlocks,
          messages: [
            { role: 'user', content: 'Index this manuscript now. Begin emitting one JSON line per chapter.' },
          ],
          maxTokens: 8192,
          temperature: 0.2,
          label: 'brief',
        })) {
          buffer += delta;
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            // Re-emit the line verbatim — the client parses NDJSON itself
            controller.enqueue(encoder.encode(trimmed + '\n'));
          }
        }
        // Flush any trailing line
        const trailing = buffer.trim();
        if (trailing) controller.enqueue(encoder.encode(trailing + '\n'));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Brief generation failed';
        controller.enqueue(ndjsonLine({ type: 'error', error: message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
