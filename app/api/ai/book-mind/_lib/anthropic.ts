// Shared model-call helper. Centralises model selection, prompt-cache
// breakpoints, streaming, and provider fallback.

export type ModelTier = 'live' | 'background';

// Opt-in verbose logging via env flag.
const VERBOSE = process.env.BM_LOG_VERBOSE === '1';
const log: (...args: unknown[]) => void = VERBOSE ? console.log.bind(console) : () => {};

// Public pricing per million tokens. Update when prices change or a new model lands.
const MODEL_PRICES: Record<string, { input: number; output: number }> = {
  'claude-haiku-4-5': { input: 1.00, output: 5.00 },
  'claude-haiku-4-5-20251001': { input: 1.00, output: 5.00 },
  'claude-sonnet-4-6': { input: 3.00, output: 15.00 },
  'claude-sonnet-4-5': { input: 3.00, output: 15.00 },
  'claude-opus-4-7': { input: 15.00, output: 75.00 },
  'claude-opus-4-6': { input: 15.00, output: 75.00 },
};

function priceFor(model: string): { input: number; output: number } {
  if (MODEL_PRICES[model]) return MODEL_PRICES[model];
  if (model.includes('haiku')) return { input: 1.00, output: 5.00 };
  if (model.includes('opus'))  return { input: 15.00, output: 75.00 };
  return { input: 3.00, output: 15.00 };
}

interface UsageSnapshot {
  input: number;
  cacheRead: number;
  cacheWrite: number;
  output: number;
}

function computeCost(model: string, u: UsageSnapshot): { total: number; breakdown: Record<string, string> } {
  const p = priceFor(model);
  const inputCost      = (u.input      / 1_000_000) * p.input;
  const cacheReadCost  = (u.cacheRead  / 1_000_000) * p.input * 0.10;
  const cacheWriteCost = (u.cacheWrite / 1_000_000) * p.input * 1.25;
  const outputCost     = (u.output     / 1_000_000) * p.output;
  const total = inputCost + cacheReadCost + cacheWriteCost + outputCost;
  return {
    total,
    breakdown: {
      input:      `${u.input.toLocaleString()} tok × $${p.input}/M = $${inputCost.toFixed(6)}`,
      cacheRead:  `${u.cacheRead.toLocaleString()} tok × $${(p.input * 0.10).toFixed(3)}/M = $${cacheReadCost.toFixed(6)}`,
      cacheWrite: `${u.cacheWrite.toLocaleString()} tok × $${(p.input * 1.25).toFixed(3)}/M = $${cacheWriteCost.toFixed(6)}`,
      output:     `${u.output.toLocaleString()} tok × $${p.output}/M = $${outputCost.toFixed(6)}`,
    },
  };
}

function fmtUsd(n: number): string {
  if (n < 0.0001) return `$${(n * 100).toFixed(4)}¢ (${n.toExponential(2)})`;
  if (n < 0.01)   return `$${n.toFixed(6)}`;
  return `$${n.toFixed(4)}`;
}

// Map a tier to a concrete model id, with env overrides.
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

// System content block; cache_control flags an ephemeral prompt-cache breakpoint.
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
  // Free-text tag for log lines.
  label?: string;
}

/**
 * Stream text deltas from the upstream model.
 */
export async function* streamAnthropicText(args: AnthropicCallArgs): AsyncGenerator<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const tag = args.label ? `[${args.label}]` : '[anthropic]';
  const systemChars = args.systemBlocks.reduce((n, b) => n + b.text.length, 0);
  const msgChars    = args.messages.reduce((n, m) => n + m.content.length, 0);
  const hasCacheBreakpoint = args.systemBlocks.some(b => b.cache_control?.type === 'ephemeral');
  const t0 = Date.now();

  log(
    `${tag} → Anthropic call | model=${args.model} | system=${systemChars.toLocaleString()} chars` +
    ` | messages=${args.messages.length} (${msgChars.toLocaleString()} chars)` +
    ` | cache=${hasCacheBreakpoint ? 'on' : 'off'}` +
    ` | maxTokens=${args.maxTokens ?? 4096}`
  );

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

  // High values here usually indicate upstream queueing rather than network latency.
  const headersMs = Date.now() - t0;

  if (!upstream.ok || !upstream.body) {
    let message = `Anthropic ${upstream.status}`;
    let isRateLimit = upstream.status === 429;
    try {
      const data = await upstream.json();
      if (data?.error?.message) message = data.error.message;
      if (data?.error?.type === 'rate_limit_error') isRateLimit = true;
    } catch { /* ignore */ }
    console.warn(`${tag} ✗ Anthropic error (${upstream.status}): ${message}`);
    const err = new Error(message) as Error & { isRateLimit?: boolean };
    err.isRateLimit = isRateLimit;
    throw err;
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const usage: UsageSnapshot = { input: 0, cacheRead: 0, cacheWrite: 0, output: 0 };
  let firstTokenMs = 0;
  let outputChars = 0;

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
        // Capture usage from message_start; overwrite output count on delta events.
        if (parsed.type === 'message_start' && parsed.message?.usage) {
          const u = parsed.message.usage;
          usage.input      = u.input_tokens ?? 0;
          usage.cacheRead  = u.cache_read_input_tokens ?? 0;
          usage.cacheWrite = u.cache_creation_input_tokens ?? 0;
          usage.output     = u.output_tokens ?? 0;
        } else if (parsed.type === 'message_delta' && parsed.usage?.output_tokens != null) {
          usage.output = parsed.usage.output_tokens;
        } else if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
          const text = parsed.delta.text;
          if (text) {
            if (!firstTokenMs) firstTokenMs = Date.now() - t0;
            outputChars += text.length;
            yield text;
          }
        }
      } catch { /* skip malformed chunks */ }
    }
  }

  const totalMs = Date.now() - t0;
  // Output throughput is measured from first to last token (excludes prefill).
  const streamMs = firstTokenMs ? Math.max(1, totalMs - firstTokenMs) : 0;
  const tokPerSec  = streamMs ? Math.round((usage.output / streamMs) * 1000) : 0;
  const charPerSec = streamMs ? Math.round((outputChars   / streamMs) * 1000) : 0;

  // Empirical slowness flags for quick log scanning.
  const flags: string[] = [];
  if (headersMs   > 1500)  flags.push(`slow-headers(${headersMs}ms)`);
  if (firstTokenMs > 4000) flags.push(`slow-ttft(${firstTokenMs}ms)`);
  if (totalMs     > 20000) flags.push(`slow-total(${totalMs}ms)`);
  if (tokPerSec && tokPerSec < 20) flags.push(`slow-throughput(${tokPerSec}tok/s)`);
  const flagStr = flags.length ? ` ⚠ ${flags.join(' ')}` : '';

  const cost = computeCost(args.model, usage);
  log(
    `${tag} ✓ done | total=${totalMs}ms headers=${headersMs}ms ttft=${firstTokenMs || '—'}ms stream=${streamMs || '—'}ms` +
    ` | throughput=${tokPerSec || '—'} tok/s (${charPerSec || '—'} ch/s)` +
    ` | in=${usage.input.toLocaleString()} cacheR=${usage.cacheRead.toLocaleString()} cacheW=${usage.cacheWrite.toLocaleString()} out=${usage.output.toLocaleString()}` +
    ` | cost=${fmtUsd(cost.total)}${flagStr}`
  );
  if (VERBOSE && usage.input + usage.cacheRead + usage.cacheWrite + usage.output > 0) {
    log(`${tag}   cost breakdown:`);
    log(`${tag}     input:       ${cost.breakdown.input}`);
    if (usage.cacheRead  > 0) log(`${tag}     cache read:  ${cost.breakdown.cacheRead}`);
    if (usage.cacheWrite > 0) log(`${tag}     cache write: ${cost.breakdown.cacheWrite}`);
    log(`${tag}     output:      ${cost.breakdown.output}`);
    const prefillMs = firstTokenMs ? firstTokenMs - headersMs : 0;
    log(`${tag}   phases:`);
    log(`${tag}     request → headers: ${headersMs}ms`);
    if (prefillMs > 0) log(`${tag}     headers → first tok: ${prefillMs}ms (model prefill)`);
    if (streamMs  > 0) log(`${tag}     first → last tok:    ${streamMs}ms (streamed ${usage.output} tok)`);
  }
}

// Provider fallback chain. Returns an async iterable of text deltas.
export interface FallbackArgs {
  tier: ModelTier;
  systemBlocks: SystemBlock[];
  messages: AnthropicMessage[];
  maxTokens?: number;
  temperature?: number;
  label?: string;
}

export async function* streamWithFallback(args: FallbackArgs): AsyncGenerator<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const grokKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const tag = args.label ? `[${args.label}]` : '[book-mind]';

  if (anthropicKey) {
    try {
      yield* streamAnthropicText({
        model: pickAnthropicModel(args.tier),
        systemBlocks: args.systemBlocks,
        messages: args.messages,
        maxTokens: args.maxTokens,
        temperature: args.temperature,
        label: args.label,
      });
      return;
    } catch (err) {
      const e = err as Error & { isRateLimit?: boolean };
      console.warn(`${tag} Anthropic call failed, falling back:`, e.message);
    }
  }

  // Fallback providers don't accept structured cache breakpoints; flatten the prompt.
  const flatSystem = args.systemBlocks.map(b => b.text).join('\n\n');
  const openaiMessages = [
    { role: 'system', content: flatSystem },
    ...args.messages,
  ];

  if (grokKey) {
    try {
      log(`${tag} → Grok fallback | model=${process.env.XAI_MODEL || 'grok-3-mini'}`);
      yield* streamOpenAICompatible({
        url: 'https://api.x.ai/v1/chat/completions',
        apiKey: grokKey,
        model: process.env.XAI_MODEL || 'grok-3-mini',
        messages: openaiMessages,
        maxTokens: args.maxTokens,
        temperature: args.temperature,
        label: args.label ? `${args.label}:grok` : 'grok',
      });
      return;
    } catch (err) {
      console.warn(`${tag} Grok call failed, falling back:`, (err as Error).message);
    }
  }

  if (openaiKey) {
    try {
      log(`${tag} → OpenAI fallback | model=${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`);
      yield* streamOpenAICompatible({
        url: 'https://api.openai.com/v1/chat/completions',
        apiKey: openaiKey,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: openaiMessages,
        maxTokens: args.maxTokens,
        temperature: args.temperature,
        label: args.label ? `${args.label}:openai` : 'openai',
      });
      return;
    } catch (err) {
      console.warn(`${tag} OpenAI call failed:`, (err as Error).message);
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
  label?: string;
}

async function* streamOpenAICompatible(args: OpenAIArgs): AsyncGenerator<string> {
  const tag = args.label ? `[${args.label}]` : '[fallback]';
  const t0 = Date.now();

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
  const headersMs = Date.now() - t0;

  if (!upstream.ok || !upstream.body) {
    const error = await upstream.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI-compatible ${upstream.status}`);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let firstTokenMs = 0;
  let outputChars = 0;
  let outputTokens = 0; // approximated from chars when not reported

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') {
        logOpenAIDone();
        return;
      }
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          if (!firstTokenMs) firstTokenMs = Date.now() - t0;
          outputChars += content.length;
          outputTokens += Math.ceil(content.length / 4); // rough 4 chars ≈ 1 tok
          yield content;
        }
        if (parsed.usage?.completion_tokens != null) {
          outputTokens = parsed.usage.completion_tokens;
        }
      } catch { /* skip */ }
    }
  }
  logOpenAIDone();

  function logOpenAIDone() {
    const totalMs = Date.now() - t0;
    const streamMs = firstTokenMs ? Math.max(1, totalMs - firstTokenMs) : 0;
    const tokPerSec  = streamMs ? Math.round((outputTokens / streamMs) * 1000) : 0;
    const charPerSec = streamMs ? Math.round((outputChars   / streamMs) * 1000) : 0;
    log(
      `${tag} ✓ done (fallback) | model=${args.model} | total=${totalMs}ms headers=${headersMs}ms ttft=${firstTokenMs || '—'}ms` +
      ` | throughput=${tokPerSec || '—'} tok/s (${charPerSec || '—'} ch/s) | ~${outputTokens} out tok`
    );
  }
}
