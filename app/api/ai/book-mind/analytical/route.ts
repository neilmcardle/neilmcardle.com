// Analytical endpoint — generates a single AnalyticalResponse for one
// analytical kind (themes, characters, inconsistencies, pacing,
// wordFrequency). Called in the background on book open (one call per
// kind), cached in bookmindMemory.analytical so the Inspector tabs
// open instantly on subsequent visits.
//
// Sonnet + prompt caching. The manuscript block is marked ephemeral so
// back-to-back calls for different kinds within a 5-minute window pay
// only 10% input cost on the second through fifth call.

import { NextRequest, NextResponse } from 'next/server';
import { requireProUser } from '../_lib/proAuth';
import { streamWithFallback, SystemBlock } from '../_lib/anthropic';

export const runtime = 'nodejs';
export const maxDuration = 60;

type AnalyticalKind = 'themes' | 'characters' | 'inconsistencies' | 'pacing' | 'wordFrequency';

interface AnalyticalRequest {
  kind: AnalyticalKind;
  chapters: Array<{ id: string; title: string; content: string; type: string }>;
  title?: string;
  author?: string;
  genre?: string;
}

const encoder = new TextEncoder();

const KIND_PROMPTS: Record<AnalyticalKind, string> = {
  themes: `Identify the major themes in this manuscript. For each theme, name it, state the claim (one sentence), quote a grounding passage (one sentence, verbatim from the text), and reference the chapter it appears in. Return 4-8 theme cards.`,

  characters: `List every named character in this manuscript. For each, state their role in one sentence, quote a characteristic moment (one sentence, verbatim), and reference the chapter where they first appear. Return one card per character.`,

  inconsistencies: `Find plot holes, character inconsistencies, timeline errors, factual contradictions, and repeated openings across the manuscript. For each issue, state the problem (one sentence), quote the conflicting passages if possible, and reference the chapters involved. Be specific and honest. If you find nothing, return an empty cards array. Return up to 10 issue cards.`,

  pacing: `Analyze the pacing of this manuscript chapter by chapter. Flag chapters that feel too rushed, too slow, or structurally imbalanced relative to their neighbours. For each observation, state the finding (one sentence), explain why it matters (one sentence in the body), and reference the chapter. Return 3-8 pacing cards.`,

  wordFrequency: `Analyze language patterns in this manuscript. Identify overused words, repeated phrases, crutch sentence openings, dialogue tag habits, and any linguistic tics the author might want to vary. For each finding, state the pattern (one sentence), give a verbatim example quote, and reference the chapter where it's most prominent. Return 5-10 cards.`,
};

const SYSTEM_BASE = `You are Book Mind's analytical engine. You read a complete manuscript and return structured findings as a single JSON object matching the AnalyticalResponse schema.

STRICT OUTPUT RULES
- Return exactly one JSON object. No preamble, no postamble, no code fences, no markdown.
- First character of your response is "{". Last character is "}".
- No em dashes anywhere. Use commas, colons, or full stops.
- Every quote must be verbatim from the manuscript (do not paraphrase).
- Chapter references use the format "Chapter N" where N is the 1-based content chapter index.

SCHEMA
{
  "headline": "<one-sentence literary summary of the findings>",
  "summary": "<optional 2-3 sentence overview>",
  "cards": [
    {
      "type": "<theme|character|inconsistency|pacing|note>",
      "title": "<short card title>",
      "claim": "<one-sentence finding>",
      "quote": "<verbatim passage from the manuscript, or omit if not applicable>",
      "chapterLabel": "<e.g. Chapter 3, or omit if cross-chapter>",
      "body": "<1-3 sentence elaboration>"
    }
  ]
}

Begin your JSON response immediately.`;

export async function POST(req: NextRequest) {
  const auth = await requireProUser(req);
  if (!auth.ok) return auth.response!;

  let body: AnalyticalRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const kind = body.kind;
  if (!kind || !KIND_PROMPTS[kind]) {
    return NextResponse.json({ error: `Invalid analytical kind: ${kind}` }, { status: 400 });
  }
  if (!body.chapters || body.chapters.length === 0) {
    return NextResponse.json({ error: 'No chapters provided' }, { status: 400 });
  }

  const manuscriptBlock = body.chapters
    .map((ch, i) => `[CHAPTER ${i + 1}] [${ch.type.toUpperCase()}] ${ch.title || `Chapter ${i + 1}`}\n${ch.content}`)
    .join('\n\n---\n\n');

  const systemBlocks: SystemBlock[] = [
    { type: 'text', text: SYSTEM_BASE },
    {
      type: 'text',
      text: `Book: ${body.title || 'Untitled'} by ${body.author || 'Unknown'}\nGenre: ${body.genre || 'Not specified'}\n${body.chapters.length} chapters\n\n=== MANUSCRIPT ===\n${manuscriptBlock}\n=== END ===`,
      cache_control: { type: 'ephemeral' },
    },
  ];

  // Stream the model's response as plain text. The client accumulates
  // and JSON.parses at the end, same as the refine endpoint. For
  // analytical calls the response is typically 2-8KB of JSON, so
  // end-of-stream parsing is fine.
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const delta of streamWithFallback({
          tier: 'background',
          systemBlocks,
          messages: [
            {
              role: 'user',
              content: `${KIND_PROMPTS[kind]}\n\nReturn the JSON now.`,
            },
          ],
          maxTokens: 8192,
          temperature: 0.3,
        })) {
          controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed';
        controller.enqueue(encoder.encode(`\n{"error":${JSON.stringify(message)}}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
