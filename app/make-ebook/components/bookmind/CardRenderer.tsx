"use client";

// CardRenderer — renders a structured AnalyticalResponse as scannable
// cards instead of essay markdown. This is how analytical Book Mind
// actions (themes, characters, inconsistencies, pacing) display in the
// Inspector tabs: one card per finding, each with a claim, an optional
// grounding quote, and an optional chapter reference that resolves to
// a CitationPill.
//
// When the model returns plain text instead of a valid AnalyticalResponse
// (which is the current state until the route enforces structured JSON),
// the parent falls back to a markdown renderer. CardRenderer is only
// invoked when the content has successfully parsed into the schema.

import React from "react";
import { AnalyticalResponse, AnalyticalCard } from "../../types";
import CitationPill from "./CitationPill";

interface CardRendererProps {
  response: AnalyticalResponse;
  chapters: Array<{ id: string; title: string }>;
  onNavigate?: (chapterIndex: number, chapterId?: string) => void;
}

const CARD_TYPE_LABELS: Record<AnalyticalCard["type"], string> = {
  theme: "Theme",
  character: "Character",
  inconsistency: "Issue",
  pacing: "Pacing",
  note: "Note",
};

const CARD_TYPE_COLORS: Record<AnalyticalCard["type"], string> = {
  theme: "text-[#4070ff] bg-[#4070ff]/10 dark:bg-[#4070ff]/15",
  character: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/15",
  inconsistency: "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/15",
  pacing: "text-purple-600 bg-purple-500/10 dark:text-purple-400 dark:bg-purple-500/15",
  note: "text-gray-600 bg-gray-500/10 dark:text-gray-300 dark:bg-gray-500/15",
};

export default function CardRenderer({
  response,
  chapters,
  onNavigate,
}: CardRendererProps) {
  return (
    <div className="space-y-3">
      {response.headline && (
        <h3 className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
          {response.headline}
        </h3>
      )}
      {response.summary && (
        <p className="text-xs text-gray-600 dark:text-[#a3a3a3] leading-relaxed">
          {response.summary}
        </p>
      )}
      <ul className="space-y-2 list-none p-0 m-0">
        {response.cards.map((card, idx) => {
          const chapterIndex = card.chapterId
            ? chapters.findIndex(c => c.id === card.chapterId)
            : -1;
          return (
            <li
              key={idx}
              className="p-3 rounded-xl bg-gray-50 dark:bg-[#262626] border border-gray-100 dark:border-[#2f2f2f]"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${CARD_TYPE_COLORS[card.type]}`}
                >
                  {CARD_TYPE_LABELS[card.type]}
                </span>
                {card.chapterLabel && chapterIndex >= 0 && (
                  <CitationPill
                    label={card.chapterLabel}
                    chapterIndex={chapterIndex}
                    chapterId={card.chapterId}
                    onNavigate={onNavigate}
                  />
                )}
              </div>
              <p className="text-xs font-medium text-gray-900 dark:text-white leading-snug mb-1">
                {card.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-[#a3a3a3] leading-relaxed">
                {card.claim}
              </p>
              {card.quote && (
                <blockquote className="mt-2 pl-2 border-l-2 border-gray-200 dark:border-[#3a3a3a] text-xs italic text-gray-500 dark:text-[#888] leading-relaxed">
                  &ldquo;{card.quote}&rdquo;
                </blockquote>
              )}
              {card.body && card.body !== card.claim && (
                <p className="mt-2 text-xs text-gray-600 dark:text-[#a3a3a3] leading-relaxed">
                  {card.body}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Parse a string as an AnalyticalResponse. Defensive: returns null if the
// string isn't valid JSON or doesn't match the shape. Used by ChatTab to
// decide whether to render via CardRenderer or fall back to markdown.
export function tryParseAnalyticalResponse(text: string): AnalyticalResponse | null {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.headline === "string" &&
      Array.isArray(parsed.cards)
    ) {
      return parsed as AnalyticalResponse;
    }
  } catch {
    // Fall through — try a loose extract in case the model wrapped in prose
  }

  // Loose extract: grab the first {...} span that looks like our shape
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace <= firstBrace) return null;

  try {
    const sliced = JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    if (
      typeof sliced === "object" &&
      sliced !== null &&
      typeof sliced.headline === "string" &&
      Array.isArray(sliced.cards)
    ) {
      return sliced as AnalyticalResponse;
    }
  } catch {
    return null;
  }
  return null;
}
