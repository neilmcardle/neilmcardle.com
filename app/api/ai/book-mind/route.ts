import { NextRequest, NextResponse } from "next/server";
import { requireBookMindAccess } from "@/lib/auth/requireBookMindAccess";
import { refundAllowance } from "@/lib/ai/allowances";
import { voiceFor } from "@/lib/ai/bookMindVoices";
import {
  streamWithFallback,
  pickAnthropicModel,
  SystemBlock,
  AnthropicMessage,
  ModelTier,
} from "./_lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatRequest {
  voice: unknown;
  memory?: unknown;
  context?: unknown;
  messages: unknown;
  tier: "spotlight" | "scene" | "wide";
  deep?: boolean;
}

const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 60_000;
const MAX_MEMORY_CHARS = 20_000;
const MAX_CONTEXT_CHARS = 600_000;

const encoder = new TextEncoder();

function sseChunk(content: string): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify({ content })}\n\n`);
}

function sseError(error: string): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify({ error })}\n\n`);
}

function sseDone(): Uint8Array {
  return encoder.encode("data: [DONE]\n\n");
}

function bad(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

function readMessages(raw: unknown): AnthropicMessage[] | string {
  if (!Array.isArray(raw) || raw.length === 0) return "No messages provided";
  if (raw.length > MAX_MESSAGES) return "Too many messages";
  const messages: AnthropicMessage[] = [];
  let total = 0;
  for (const m of raw) {
    const role = (m as { role?: unknown })?.role;
    const content = (m as { content?: unknown })?.content;
    if (
      (role !== "user" && role !== "assistant") ||
      typeof content !== "string"
    ) {
      return "Invalid message";
    }
    total += content.length;
    messages.push({ role, content });
  }
  if (total > MAX_MESSAGE_CHARS) return "Messages are too long";
  if (messages[messages.length - 1].role !== "user") return "Invalid message";
  return messages;
}

export async function POST(req: NextRequest) {
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request body");
  }

  const voice = voiceFor(body?.voice);
  if (!voice) return bad("Unknown voice");

  const messages = readMessages(body.messages);
  if (typeof messages === "string") return bad(messages);

  const memory = typeof body.memory === "string" ? body.memory : "";
  const context = typeof body.context === "string" ? body.context : "";
  if (memory.length > MAX_MEMORY_CHARS) return bad("Memory is too long");
  if (context.length > MAX_CONTEXT_CHARS)
    return bad("The book is too long to send in one go");

  const auth = await requireBookMindAccess(req, {
    allowFreeQuestion: body.voice === "chat",
  });
  if (!auth.ok) return auth.response!;

  const refundIfFree = async () => {
    if (auth.usedFreeQuestion && auth.user && auth.claimedAt)
      await refundAllowance("question", auth.user.id, auth.claimedAt);
  };

  if (auth.usedFreeQuestion) body.deep = false;

  const systemBlocks: SystemBlock[] = [{ type: "text", text: voice }];
  if (memory.trim()) {
    systemBlocks.push({ type: "text", text: memory });
  }
  if (context.trim()) {
    systemBlocks.push({
      type: "text",
      text: context,
      cache_control: { type: "ephemeral" },
    });
  }

  const tier: ModelTier =
    body.tier === "wide" && body.deep ? "background" : "live";

  const modelUsed = pickAnthropicModel(tier);

  let answered = false;
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ meta: { tier: body.tier, deep: !!body.deep, model: modelUsed } })}\n\n`,
          ),
        );

        for await (const delta of streamWithFallback({
          tier,
          systemBlocks,
          messages,
          maxTokens: 4096,
          temperature: 0.7,
          label: `chat:${body.tier ?? "auto"}${body.deep ? ":deep" : ""}`,
        })) {
          if (delta) answered = true;
          controller.enqueue(sseChunk(delta));
        }
      } catch (err) {
        if (!answered) await refundIfFree();
        console.error("[book mind] stream failed", err);
        controller.enqueue(
          sseError("Book Mind could not answer just now. Try again."),
        );
      } finally {
        controller.enqueue(sseDone());
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
