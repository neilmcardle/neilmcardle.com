// Extract a structured book profile from the manuscript brief.
// Input: brief chapter summaries (already computed). Returns a single JSON
// BookProfile object. Non-streaming — the output is compact and atomic.

import { NextRequest, NextResponse } from 'next/server';
import { requireProUser } from '../_lib/proAuth';
import { streamWithFallback, SystemBlock } from '../_lib/anthropic';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface ProfileRequest {
  title?: string;
  author?: string;
  genre?: string;
  chapterSummaries: Array<{
    title: string;
    type: string;
    summary: string;
    keyEntities: string[];
  }>;
  manuscriptHash: string;
}

export async function POST(req: NextRequest) {
  const auth = await requireProUser(req);
  if (!auth.ok) return auth.response!;

  let body: ProfileRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.chapterSummaries || body.chapterSummaries.length === 0) {
    return NextResponse.json({ error: 'No chapter summaries provided' }, { status: 400 });
  }

  const briefText = body.chapterSummaries
    .map((ch, i) => `Chapter ${i + 1} (${ch.type}): ${ch.title || 'Untitled'}\n${ch.summary}\nEntities: ${ch.keyEntities.join(', ')}`)
    .join('\n\n');

  const systemBlocks: SystemBlock[] = [
    {
      type: 'text',
      text: `You are Book Mind's profile extractor. Read a manuscript brief and return a single JSON object describing the book. Your output is consumed directly by code — it must be valid JSON with no surrounding text, no markdown fences.

Return exactly this shape:
{
  "characters": [
    { "id": "<unique short slug>", "name": "<full name>", "role": "<Protagonist|Antagonist|Supporting|Minor>", "description": "<one sentence>", "source": "auto" }
  ],
  "locations": [
    { "id": "<unique short slug>", "name": "<place name>", "description": "<one sentence>", "source": "auto" }
  ],
  "style": {
    "pov": "<First person|Third person limited|Third person omniscient|Second person>",
    "tense": "<Past tense|Present tense>",
    "tone": "<2-4 descriptive words, e.g. 'Tense, literary, darkly comic'>"
  },
  "keyFacts": ["<important world-building or plot fact>", ...],
  "writingRules": []
}

Rules:
- Include only characters who appear meaningfully in multiple chapters. Skip walk-ons.
- Locations: only named places that are significant settings, not passing mentions.
- keyFacts: 3-6 facts that a future editor would need to know (e.g. "Set in Dublin, 1916", "Told via unreliable narrator", "Protagonist is searching for her missing sister").
- writingRules: always return an empty array — this is user-curated and not extracted.
- Infer style from the summaries. If unsure of POV or tense, make your best judgment.
- Never use em dashes. Descriptions use full stops, not commas for run-ons.
- id fields: short hyphenated slugs from the name, e.g. "emma-chen", "old-house".
- Return ONLY the JSON object. No preamble, no explanation, no code fences.`,
    },
    {
      type: 'text',
      text: `Book: "${body.title || 'Untitled'}" by ${body.author || 'Unknown'} (${body.genre || 'genre unspecified'})

CHAPTER SUMMARIES:
${briefText}`,
      cache_control: { type: 'ephemeral' },
    },
  ];

  // Collect the full streaming response into a single string, then parse as JSON.
  let rawJson = '';
  try {
    for await (const delta of streamWithFallback({
      tier: 'background',
      systemBlocks,
      messages: [{ role: 'user', content: 'Extract the book profile now. Return only the JSON object.' }],
      maxTokens: 2048,
      temperature: 0.1,
      label: 'profile',
    })) {
      rawJson += delta;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Profile extraction failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Strip any accidental markdown fences before parsing.
  const cleaned = rawJson.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    const profile = JSON.parse(cleaned);
    return NextResponse.json({ ok: true, profile, manuscriptHash: body.manuscriptHash });
  } catch {
    return NextResponse.json({ error: 'Profile parse failed', raw: cleaned.slice(0, 500) }, { status: 500 });
  }
}
