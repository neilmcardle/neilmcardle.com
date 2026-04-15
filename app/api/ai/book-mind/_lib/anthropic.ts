// Shared Anthropic call helper for every Book Mind API route.
//
// Centralises:
//   - Model selection by tier
//   - Prompt-cache breakpoints on the manuscript block
//   - Streaming with text deltas
//   - Provider fallback chain (Anthropic → Grok → OpenAI on rate limit)
//   - Error normalization (no raw API payloads escape to the user)
//
// Both the brief generator and the chat route call into this helper.
// The chat route also has its own SSE wrapper around it.

export type ModelTier = 'live' | 'background';

// Maps a tier to a concrete model id, with env overrides. Live work
// (Cmd-K, ghost text, conversational chat) goes to Haiku for speed and
// rate-limit headroom. Background work (manuscript brief, analytical
// cache refresh) goes to Sonnet for editorial quality. The user never
// waits on Sonnet — it runs while they write.
export function pickAnthropicModel(tier: ModelTier): string {
  if (tier === 'background') {
    return process.env.ANTHROPIC_MODEL_ANALYTICAL
      ?? process.env.ANTHROPIC_MODEL
      ?? 'claude-sonnet-4-6';
  }
  return process.env.ANTHROPIC_MODEL_CONVERSATIONAL
    ?? process.env.ANTHROPIC_MODEL
    ?? 'claude-haiku-4-5-20251001';
}

// Anthropic content-block shape. Used to mark the manuscript portion of
// a system prompt as a prompt-cache breakpoint so subsequent turns within
// the 5-minute window pay 10% input cost.
export interface SystemBlock {
  type: 'text';
  text: string;
  cache_control?: { type: 'ephemeral' };
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicCallArgs {
  model: string;
  systemBlocks: SystemBlock[];
  messages: AnthropicMessage[];
  maxTokens?: number;
  temperature?: number;
}

// Call Anthropic in streaming mode and yield text deltas. Caller
// consumes the async generator and forwards deltas to its own response
// stream (SSE for chat, NDJSON for brief, etc).
export async function* streamAnthropicText(args: AnthropicCallArgs): AsyncGenerator<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: args.model,
      max_tokens: args.maxTokens ?? 4096,
      temperature: args.temperature ?? 0.7,
      stream: true,
      system: args.systemBlocks,
      messages: args.messages,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    let message = `Anthropic ${upstream.status}`;
    let isRateLimit = upstream.status === 429;
    try {
      const data = await upstream.json();
      if (data?.error?.message) message = data.error.message;
      if (data?.error?.type === 'rate_limit_error') isRateLimit = true;
    } catch { /* ignore */ }
    const err = new Error(message) as Error & { isRateLimit?: boolean };
    err.isRateLimit = isRateLimit;
    throw err;
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
      if (!data) continue;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
          const text = parsed.delta.text;
          if (text) yield text;
        }
      } catch { /* skip malformed chunks */ }
    }
  }
}

// Provider fallback chain. Tries Anthropic first; on rate limit or
// network failure, falls back to OpenAI-compatible providers (Grok then
// OpenAI) using a flattened single-string system prompt — neither of
// those supports cache breakpoints. The user never sees a raw error;
// they get the next-best response or, in the worst case, a friendly
// fallback message.
//
// Returns an async iterable of text deltas, same shape as
// streamAnthropicText, so callers can treat all providers uniformly.
export interface FallbackArgs {
  tier: ModelTier;
  systemBlocks: SystemBlock[];
  messages: AnthropicMessage[];
  maxTokens?: number;
  temperature?: number;
}

export async function* streamWithFallback(args: FallbackArgs): AsyncGenerator<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const grokKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Try Anthropic first
  if (anthropicKey) {
    try {
      yield* streamAnthropicText({
        model: pickAnthropicModel(args.tier),
        systemBlocks: args.systemBlocks,
        messages: args.messages,
        maxTokens: args.maxTokens,
        temperature: args.temperature,
      });
      return;
    } catch (err) {
      const e = err as Error & { isRateLimit?: boolean };
      console.warn('[book-mind] Anthropic call failed, falling back:', e.message);
      // Fall through to next provider
    }
  }

  // Flatten system blocks for OpenAI-compatible providers
  const flatSystem = args.systemBlocks.map(b => b.text).join('\n\n');
  const openaiMessages = [
    { role: 'system', content: flatSystem },
    ...args.messages,
  ];

  if (grokKey) {
    try {
      yield* streamOpenAICompatible({
        url: 'https://api.x.ai/v1/chat/completions',
        apiKey: grokKey,
        model: process.env.XAI_MODEL || 'grok-3-mini',
        messages: openaiMessages,
        maxTokens: args.maxTokens,
        temperature: args.temperature,
      });
      return;
    } catch (err) {
      console.warn('[book-mind] Grok call failed, falling back:', (err as Error).message);
    }
  }

  if (openaiKey) {
    try {
      yield* streamOpenAICompatible({
        url: 'https://api.openai.com/v1/chat/completions',
        apiKey: openaiKey,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: openaiMessages,
        maxTokens: args.maxTokens,
        temperature: args.temperature,
      });
      return;
    } catch (err) {
      console.warn('[book-mind] OpenAI call failed:', (err as Error).message);
      throw err;
    }
  }

  throw new Error('No AI provider is configured. Please set ANTHROPIC_API_KEY.');
}

interface OpenAIArgs {
  url: string;
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
}

async function* streamOpenAICompatible(args: OpenAIArgs): AsyncGenerator<string> {
  const upstream = await fetch(args.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      model: args.model,
      messages: args.messages,
      max_tokens: args.maxTokens ?? 4096,
      temperature: args.temperature ?? 0.7,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const error = await upstream.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI-compatible ${upstream.status}`);
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
        if (content) yield content;
      } catch { /* skip */ }
    }
  }
}
