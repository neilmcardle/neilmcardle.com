import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'
import { getUserById, getUserByEmail } from '@/lib/db/users'

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
    // 'narrow' = current chapter + index (conversational, fast path).
    // 'full'   = whole manuscript (analytical, quality path).
    // The client decides which based on the action type; the server uses
    // it to pick the right model so quality and rate limits both hold.
    mode?: 'narrow' | 'full';
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
      max_tokens: 4096,
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
    const mode = body.context?.mode ?? 'full';

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

    // Defensive tier lookup: primary by auth UUID, fallback to email.
    // Mirrors the pattern in /api/subscription/route.ts. Avoids the failure
    // mode where getUserSubscriptionTier silently returns 'free' on any
    // DB error (drift, password, connection) — which would cause Book Mind
    // to 403 real Pro users. Computes tier inline from the dbUser we fetch
    // so there's no second round-trip that could reproduce the same bug.
    let { user: dbUser } = await getUserById(user.id);
    if (!dbUser && user.email) {
      const { user: fallbackUser } = await getUserByEmail(user.email);
      if (fallbackUser) {
        console.warn(
          `[book-mind] id lookup failed but email lookup succeeded for ${user.email}. ` +
          `auth.id=${user.id}, public.users.id=${fallbackUser.id}.`
        );
        dbUser = fallbackUser;
      }
    }

    let tier: 'free' | 'pro' = 'free';
    if (dbUser) {
      if (dbUser.isGrandfathered) tier = 'pro';
      else if (dbUser.hasLifetimeAccess) tier = 'pro';
      else if (dbUser.subscriptionStatus === 'active' && dbUser.subscriptionTier === 'pro') tier = 'pro';
    }

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

    // Model routing. Narrow mode (conversational, chapter-scoped) goes to
    // Haiku 4.5 — fast, cheap, and high per-minute rate-limit headroom for
    // the common case. Full mode (analytical, whole-manuscript) goes to
    // Sonnet 4.6 by default because Book Mind's moat is editorial quality
    // on literary analysis. Env overrides let the user swap models without
    // a code change (e.g. force Haiku on analytical when tier limits bite).
    const anthropicModel =
      mode === 'full'
        ? process.env.ANTHROPIC_MODEL_ANALYTICAL ||
          process.env.ANTHROPIC_MODEL ||
          'claude-sonnet-4-6'
        : process.env.ANTHROPIC_MODEL_CONVERSATIONAL ||
          process.env.ANTHROPIC_MODEL ||
          'claude-haiku-4-5-20251001';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (anthropicKey) {
            await streamAnthropic(
              anthropicKey,
              anthropicModel,
              messages,
              controller
            );
          } else if (grokKey) {
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
