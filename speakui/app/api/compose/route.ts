import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import {
  DraftSchema,
  kitDescription,
  type ComposeResponse,
} from "@/lib/engine/compose";

const MODEL = process.env.COMPOSE_MODEL ?? "claude-opus-5";

const USD_PER_M = { input: 5, output: 25 };

const SYSTEM = `You draft UI for speakui, a voice-driven design tool. The person describes a card or a hero section out loud; you return a first draft they will then edit by voice.

You can only use this kit. Every element's kind and section must come from it.

${kitDescription()}

How to draft:
- Build what they described, in the mode they asked for. Choose layout, background, theme and accent to suit it.
- Use their exact words for any text they dictated. Where they didn't give text, write short, plain, plausible copy that is obviously a placeholder to replace (for example "Your name"), never lorem ipsum.
- Add only what makes it read as finished: a hero needs a headline; a nav needs a logo if it has links. Don't pile on extras.
- Vocabulary: a "menu" or "navigation" is a few link elements in nav-right. A "chevron" or "arrow pointing down" at the bottom is a scroll element. A "trusted by" row is an eyebrow "Trusted by" in proof followed by brand elements. A "dock" is icon elements in bottom.
- Speech transcripts contain filler and false starts; ignore them.
- Copy style: sentence case, no em dashes, no exclamation marks, no emojis.
- If they asked for something the kit can't make (a video, a carousel, a pricing table), leave it out and say so in "note".`;

export async function POST(req: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error: "no_key",
        message:
          "Drafting from a description needs ANTHROPIC_API_KEY in .env.local.",
      },
      { status: 503 },
    );
  }

  let body: { description?: string; mode?: "card" | "hero" };
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "bad_request", message: "Invalid JSON." },
      { status: 400 },
    );
  }
  const description = (body.description ?? "").slice(0, 2000).trim();
  const mode = body.mode === "card" ? "card" : "hero";
  if (!description)
    return Response.json(
      { error: "bad_request", message: "Nothing to draft." },
      { status: 400 },
    );

  const client = new Anthropic();
  const started = performance.now();
  try {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,

      output_config: {
        effort: "low",
        format: betaZodOutputFormat(DraftSchema),
      },

      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Mode: ${mode}\n\nWhat they said:\n${description}`,
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return Response.json(
        {
          error: "refusal",
          message: "The drafting model declined this description.",
        },
        { status: 422 },
      );
    }
    const draft = response.parsed_output;
    if (!draft) {
      return Response.json(
        {
          error: "unparsed",
          message: "The draft didn't come back in the expected shape.",
        },
        { status: 502 },
      );
    }

    const usage = {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
    };
    const result: ComposeResponse = {
      draft,
      ms: Math.round(performance.now() - started),
      model: response.model,
      usage,
      costUsd:
        (usage.input_tokens * USD_PER_M.input +
          usage.output_tokens * USD_PER_M.output) /
        1_000_000,
    };
    return Response.json(result);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return Response.json(
        {
          error: "auth",
          message:
            "Anthropic rejected the API key. Check ANTHROPIC_API_KEY in .env.local.",
        },
        { status: 401 },
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json(
        {
          error: "rate_limited",
          message: "Rate limited by Anthropic. Try again in a moment.",
        },
        { status: 429 },
      );
    }
    if (err instanceof Anthropic.BadRequestError) {
      console.error("[compose] bad request", err.message);
      return Response.json(
        {
          error: "bad_request",
          message: `Anthropic rejected the request: ${err.message}`,
        },
        { status: 400 },
      );
    }
    if (err instanceof Anthropic.APIError) {
      console.error("[compose]", err.status, err.message);
      return Response.json(
        { error: "api", message: `Anthropic error ${err.status ?? ""}`.trim() },
        { status: 502 },
      );
    }
    console.error("[compose]", err);
    return Response.json(
      { error: "network", message: "Couldn't reach Anthropic." },
      { status: 502 },
    );
  }
}
