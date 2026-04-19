// Book Mind chat endpoint — speed-first.
//
// The client sends structured fields (voice block, memory block,
// retrieved-context block, messages) instead of a pre-built system
// prompt. The server reassembles those into Anthropic content blocks
// with a prompt-cache breakpoint on the manuscript portion, picks the
// right model for the tier, and streams text deltas back as SSE.
//
// Tiers map to models:
//   spotlight / scene → Haiku (live tier, sub-second)
//   wide              → Haiku by default; "deep" flag escalates to Sonnet
//
// Cache breakpoint sits on the retrieved-context block. First call in a
// 5-minute window pays full input cost; subsequent calls pay 10%.

import { NextRequest, NextResponse } from 'next/server';
import { requireProUser } from './_lib/proAuth';
import {
  streamWithFallback,
  pickAnthropicModel,
  SystemBlock,
  AnthropicMessage,
  ModelTier,
} from './_lib/anthropic';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface ChatRequest {
  // Caller-built sections of the system prompt. Server stitches them in
  // a fixed order: voice → memory → context. Only `context` is marked
  // as a cache breakpoint.
  voice: string;
  memory?: string;
  context: string;

  // Conversation so far. Server appends as-is, no rewriting.
  messages: AnthropicMessage[];

  // Tier picked by the client. Server uses it to choose the model.
  tier: 'spotlight' | 'scene' | 'wide';

  // If true, escalate wide-tier calls to Sonnet for editorial quality.
  // Otherwise wide stays on Haiku for speed. Spotlight and scene tiers
  // always use Haiku regardless.
  deep?: boolean;
}

const encoder = new TextEncoder();

function sseChunk(content: string): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify({ content })}\n\n`);
}

function sseError(error: string): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify({ error })}\n\n`);
}

function sseDone(): Uint8Array {
  return encoder.encode('data: [DONE]\n\n');
}

export async function POST(req: NextRequest) {
  const auth = await requireProUser(req);
  if (!auth.ok) return auth.response!;

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.messages || body.messages.length === 0) {
    return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
  }
  if (!body.voice || !body.context) {
    return NextResponse.json({ error: 'Missing system prompt sections' }, { status: 400 });
  }

  // Build the system blocks in order. Voice + memory are small and
  // change per surface, so they go uncached. Context (which contains
  // the brief and any retrieved chapters) is large and consistent
  // across a chat session, so it gets the cache breakpoint.
  const systemBlocks: SystemBlock[] = [
    { type: 'text', text: body.voice },
  ];
  if (body.memory && body.memory.trim()) {
    systemBlocks.push({ type: 'text', text: body.memory });
  }
  systemBlocks.push({
    type: 'text',
    text: body.context,
    cache_control: { type: 'ephemeral' },
  });

  // Tier → model. Spotlight and scene always Haiku. Wide is Haiku by
  // default; deep flag escalates to Sonnet.
  const tier: ModelTier = body.tier === 'wide' && body.deep ? 'background' : 'live';

  // Track which model we end up using, in case we want to return it in
  // metadata later (e.g. transparency strip "answered with Haiku").
  const modelUsed = pickAnthropicModel(tier);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Emit a one-shot meta line so the client knows what tier+model
        // this response is coming from. Useful for the transparency
        // strip and for debugging in DevTools.
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ meta: { tier: body.tier, deep: !!body.deep, model: modelUsed } })}\n\n`,
          ),
        );

        for await (const delta of streamWithFallback({
          tier,
          systemBlocks,
          messages: body.messages,
          maxTokens: 4096,
          temperature: 0.7,
          label: `chat:${body.tier ?? 'auto'}${body.deep ? ':deep' : ''}`,
        })) {
          controller.enqueue(sseChunk(delta));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Stream error';
        controller.enqueue(sseError(message));
      } finally {
        controller.enqueue(sseDone());
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
