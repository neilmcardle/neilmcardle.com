import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'
import { getUserSubscriptionTier } from '@/lib/db/users'

export const runtime = "nodejs";
export const maxDuration = 60;

// Book Mind AI API endpoint — streaming SSE
// Supports OpenAI, Anthropic, Grok/xAI via environment variables
// GATED: Pro subscription required

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface BookMindRequest {
  messages: Message[];
  context?: {
    selectedText?: string;
    chapterContent?: string;
    action?: string;
  };
}

const encoder = new TextEncoder();

function sseChunk(content: string): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify({ content })}\n\n`);
}

function sseDone(): Uint8Array {
  return encoder.encode('data: [DONE]\n\n');
}

async function streamOpenAICompatible(
  url: string,
  apiKey: string,
  model: string,
  messages: Message[],
  controller: ReadableStreamDefaultController
) {
  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, max_tokens: 700, temperature: 0.7, stream: true }),
  });

  if (!upstream.ok || !upstream.body) {
    const error = await upstream.json().catch(() => ({}));
    throw new Error(error.error?.message || 'API request failed');
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) controller.enqueue(sseChunk(content));
      } catch { /* skip malformed chunks */ }
    }
  }
}

async function streamAnthropic(
  apiKey: string,
  model: string,
  messages: Message[],
  controller: ReadableStreamDefaultController
) {
  const systemMessage = messages.find(m => m.role === 'system')?.content ?? '';
  const userMessages = messages.filter(m => m.role !== 'system');

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      stream: true,
      system: systemMessage,
      messages: userMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const error = await upstream.json().catch(() => ({}));
    throw new Error(error.error?.message ?? 'Anthropic API request failed');
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
          const content = parsed.delta.text;
          if (content) controller.enqueue(sseChunk(content));
        }
      } catch { /* skip malformed chunks */ }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: BookMindRequest = await req.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // ===== SUBSCRIPTION CHECK: Book Mind AI is Pro-only =====
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return req.cookies.get(name)?.value },
          set(_name: string, _value: string, _options: CookieOptions) { /* handled by middleware */ },
          remove(_name: string, _options: CookieOptions) { /* handled by middleware */ },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to use Book Mind AI.' },
        { status: 401 }
      );
    }

    const tier = await getUserSubscriptionTier(user.id);

    if (tier !== 'pro') {
      return NextResponse.json(
        { error: 'Book Mind AI is a Pro feature. Upgrade to access AI-powered book analysis.', requiresUpgrade: true, feature: 'book_mind_ai' },
        { status: 403 }
      );
    }
    // ===== END SUBSCRIPTION CHECK =====

    const grokKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!grokKey && !openaiKey && !anthropicKey) {
      return NextResponse.json(
        { error: 'Book Mind AI is not configured. Please add an API key to your environment variables.' },
        { status: 503 }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (grokKey) {
            await streamOpenAICompatible(
              'https://api.x.ai/v1/chat/completions',
              grokKey,
              process.env.XAI_MODEL || 'grok-3-mini',
              messages,
              controller
            );
          } else if (openaiKey) {
            await streamOpenAICompatible(
              'https://api.openai.com/v1/chat/completions',
              openaiKey,
              process.env.OPENAI_MODEL || 'gpt-4o-mini',
              messages,
              controller
            );
          } else if (anthropicKey) {
            await streamAnthropic(
              anthropicKey,
              process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
              messages,
              controller
            );
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Stream error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        } finally {
          controller.enqueue(sseDone());
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Book Mind API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
