import { and, eq, inArray, lt, type SQL } from "drizzle-orm";
import type { PgUpdateSetSource } from "drizzle-orm/pg-core";
import { db, suggestions } from "@/lib/db";
import {
  STALE_BUILD_MINUTES,
  SUGGESTION_TRANSITIONS,
  type SuggestionEvent,
} from "./buildState";

type SuggestionValues = Omit<
  PgUpdateSetSource<typeof suggestions>,
  "status" | "id"
>;

export async function transitionSuggestion(
  id: string,
  event: SuggestionEvent,
  values: SuggestionValues = {},
  extra?: SQL,
) {
  const { from, to } = SUGGESTION_TRANSITIONS[event];
  const [row] = await db
    .update(suggestions)
    .set({ ...values, status: to, updatedAt: new Date() })
    .where(
      and(
        eq(suggestions.id, id),
        inArray(suggestions.status, [...from]),
        extra,
      ),
    )
    .returning({
      id: suggestions.id,
      request: suggestions.request,
      buildStartedAt: suggestions.buildStartedAt,
    });
  return row ?? null;
}

export async function expireStaleBuilds() {
  const { from, to } = SUGGESTION_TRANSITIONS.timeout;
  await db
    .update(suggestions)
    .set({
      status: to,
      note: "The build stopped reporting back.",
      updatedAt: new Date(),
    })
    .where(
      and(
        inArray(suggestions.status, [...from]),
        lt(
          suggestions.buildStartedAt,
          new Date(Date.now() - STALE_BUILD_MINUTES * 60 * 1000),
        ),
      ),
    );
}
