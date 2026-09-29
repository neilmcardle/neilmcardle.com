import { BASE_PATH } from "@/lib/base-path";
import { emptyDesign } from "@/lib/design/catalog";
import { changedIds } from "@/lib/design/ops";
import { TEMPLATES } from "@/lib/design/templates";
import type { Design, Mode } from "@/lib/design/types";
import { applyAnswers, type ClauseResult, type Command } from "./apply";
import { draftToDesign, type ComposeResponse } from "./compose";
import { costUsd, type JevResponse } from "./jev";
import { fastCommand, splitClauses } from "./parse";
import { buildJevRequest, type EvalContext } from "./questions";

const MAX_CLAUSES = 4;

export type EvalMeta = {
  jevMs: number;

  roundTripMs: number;
  questions: number;
  inputTokens: number;

  costUsd: number;
  model: string;

  compose?: {
    ms: number;
    model: string;
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
  };
};

export type EvalResult = {
  transcript: string;
  status: "applied" | "no_change" | "error" | "empty";
  design: Design;
  clauses: ClauseResult[];
  command: Command | null;
  commandMode?: Mode;

  deferred?: boolean;
  lastAddedId: string | null;
  changed: string[];
  meta: EvalMeta | null;
  error?: string;

  limit?: string;

  deferredCompose?: boolean;
};

export async function evaluate(
  transcript: string,
  committed: Design,
  ctx: EvalContext,
  signal?: AbortSignal,

  opts: { allowDraft?: boolean } = {},
): Promise<EvalResult> {
  const allowDraft = opts.allowDraft ?? true;
  const base = {
    transcript,
    design: committed,
    clauses: [],
    command: null,
    lastAddedId: ctx.lastAddedId,
    changed: [],
    meta: null,
  };

  const fast = fastCommand(transcript);
  if (fast) {
    return {
      ...base,
      status: "applied",
      command: fast,
      clauses: [
        {
          clause: transcript,
          action: fast,
          status: "applied",
          summary: fast === "undo" ? "Undo" : "Redo",
          steps: [
            { label: "Read request", value: transcript, source: "Your words" },
            {
              label: "Choose action",
              value: fast === "undo" ? "Undo" : "Redo",
              detail: "Exact command, no model call",
              source: "Parser",
            },
          ],
        },
      ],
    };
  }

  const clauses = splitClauses(transcript).slice(0, MAX_CLAUSES);
  if (!clauses.length) return { ...base, status: "empty" };

  const body = buildJevRequest(transcript, clauses, committed, ctx);
  const started = performance.now();
  let res: Response;
  try {
    res = await fetch(`${BASE_PATH}/api/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    return {
      ...base,
      status: "error",
      error: "Couldn't reach the local server.",
    };
  }

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      limit?: string;
    };
    return {
      ...base,
      status: "error",
      error: data.error ?? `Jev request failed (${res.status})`,
      limit: data.limit,
    };
  }

  const jev = (await res.json()) as JevResponse;
  const outcome = applyAnswers(clauses, jev.answers, committed, {
    ...ctx,
    preview: !allowDraft,
  });

  let composeMeta: EvalMeta["compose"];
  let deferredCompose = false;
  if (outcome.command === "compose" && outcome.compose && !allowDraft) {
    deferredCompose = true;
    outcome.command = null;
    const last = outcome.clauses[outcome.clauses.length - 1];
    if (last)
      setResult(
        last,
        `Will draft a ${outcome.compose.mode === "hero" ? "hero section" : "card"} when you pause`,
      );
  } else if (outcome.command === "compose" && outcome.compose) {
    const drafted = await draft(transcript, outcome.compose.mode, signal);
    const last = outcome.clauses[outcome.clauses.length - 1];
    if (drafted.ok) {
      const { design, dropped } = draftToDesign(
        drafted.data.draft,
        outcome.compose.mode,
      );
      outcome.design = design;
      outcome.lastAddedId = null;
      composeMeta = {
        ms: drafted.data.ms,
        model: drafted.data.model,
        inputTokens: drafted.data.usage.input_tokens,
        outputTokens: drafted.data.usage.output_tokens,
        costUsd: drafted.data.costUsd,
      };
      last?.steps.splice(last.steps.length - 1, 0, {
        label: "Draft it",
        value: `${design.elements.length} components`,
        detail:
          [
            drafted.data.draft.note,
            dropped
              ? `${dropped} off-catalog part${dropped > 1 ? "s" : ""} removed by code`
              : "",
          ]
            .filter(Boolean)
            .join(" · ") || undefined,
        source: "Claude",
      });
      if (last) setResult(last, `Drafted “${design.name}”`);
    } else {
      const fb =
        outcome.compose.fallback ??
        (outcome.compose.mode === "hero" ? "hero_product" : null);
      outcome.design = fb
        ? TEMPLATES[fb].build()
        : emptyDesign(outcome.compose.mode);
      last?.steps.splice(last.steps.length - 1, 0, {
        label: "Draft it",
        value: fb
          ? `Used the “${TEMPLATES[fb].describe.split(":")[0]}” pattern instead`
          : "Started empty",
        detail: drafted.message,
        source: "Code",
      });
      if (last) {
        setResult(
          last,
          fb
            ? `Started from a pattern (${drafted.reason})`
            : "Started an empty canvas",
        );
        last.status = "applied";
      }
    }
    outcome.command = null;
  }

  const roundTripMs = Math.round(performance.now() - started);
  const changed = changedIds(committed, outcome.design);
  const designChanged =
    JSON.stringify(outcome.design) !== JSON.stringify(committed);

  return {
    transcript,
    status: designChanged || outcome.command ? "applied" : "no_change",
    design: outcome.design,
    clauses: outcome.clauses,
    command: outcome.command,
    commandMode: outcome.commandMode,
    deferred: outcome.deferred,
    lastAddedId: outcome.lastAddedId,
    changed,
    ...(deferredCompose && { deferredCompose }),
    meta: {
      jevMs: jev.ms,
      roundTripMs,
      questions: Object.keys(body.questions).length,
      inputTokens: jev.usage?.input_tokens ?? 0,
      costUsd:
        costUsd(jev.usage?.input_tokens ?? 0) + (composeMeta?.costUsd ?? 0),
      model: jev.model,
      ...(composeMeta && { compose: composeMeta }),
    },
  };
}

type Drafted =
  | { ok: true; data: ComposeResponse }
  | { ok: false; reason: string; message: string };

async function draft(
  description: string,
  mode: Mode,
  signal?: AbortSignal,
): Promise<Drafted> {
  try {
    const res = await fetch(`${BASE_PATH}/api/compose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, mode }),
      signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const reason =
        data.error === "no_key" ? "drafting isn't set up" : "drafting failed";
      return {
        ok: false,
        reason,
        message: data.message ?? `Drafting failed (${res.status}).`,
      };
    }
    return { ok: true, data: data as ComposeResponse };
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    return {
      ok: false,
      reason: "drafting failed",
      message: "Couldn't reach the drafting service.",
    };
  }
}

function setResult(clause: ClauseResult, summary: string) {
  clause.summary = summary;
  const step = clause.steps.findLast((st) => st.label === "Result");
  if (step) step.value = summary;
}
