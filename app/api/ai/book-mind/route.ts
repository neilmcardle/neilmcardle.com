// Editorial chat endpoint. Client sends structured prompt sections; the
// server stitches them, picks a model for the tier, and streams deltas via SSE.

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
  // Voice → memory → context. Only context is marked as a cache breakpoint.
  voice: string;
  memory?: string;
  context: string;

  messages: AnthropicMessage[];

  tier: 'spotlight' | 'scene' | 'wide';

  // Escalate quality on wide-tier requests.
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

  // Voice + memory are small and per-surface (uncached). Context gets the
  // cache breakpoint because it is large and stable across a session.
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

  const tier: ModelTier = body.tier === 'wide' && body.deep ? 'background' : 'live';

  const modelUsed = pickAnthropicModel(tier);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Emit a one-shot meta line so the client knows what tier and model
        // this response is using.
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
