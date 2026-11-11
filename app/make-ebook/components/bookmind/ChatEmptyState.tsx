"use client";

import type { BookMindAction } from "../../hooks/useBookMind";
import type { Chapter } from "../../types";
import BookMindMark from "./BookMindMark";
import { Suggestion, chapterLabel } from "./chatShared";
import styles from "../../styles/studio.module.css";

interface ChatEmptyStateProps {
  title?: string;
  chapters: Chapter[];
  selectedChapterIndex: number;
  isPro: boolean;
  trialMode: boolean;
  locked: boolean;
  onPreflight?: () => void;
  onRunAction: (action: BookMindAction, label: string) => void;
}

export default function ChatEmptyState({
  title,
  chapters,
  selectedChapterIndex,
  isPro,
  trialMode,
  locked,
  onPreflight,
  onRunAction,
}: ChatEmptyStateProps) {
  const suggestions: Suggestion[] = isPro
    ? [
        {
          label: "Walk me through this chapter",
          hint: chapterLabel(chapters, selectedChapterIndex),
          action: "summarize-chapter",
        },
        {
          label: "Summarise the book",
          hint: "The story, themes and arcs",
          action: "summarize-book",
        },
        {
          label: "Find inconsistencies",
          hint: "Plot holes, timeline, facts",
          action: "find-inconsistencies",
        },
        {
          label: "Who is in this book",
          hint: "Who appears where",
          action: "list-characters",
        },
        ...(onPreflight
          ? [
              {
                label: "Is it ready to publish?",
                hint: "Run the Amazon pre-flight",
                run: onPreflight,
              },
            ]
          : []),
      ]
    : [
        {
          label: "Summarise the book",
          hint: "The story, themes and arcs",
          action: "summarize-book",
        },
        {
          label: "Walk me through this chapter",
          hint: chapterLabel(chapters, selectedChapterIndex),
          action: "summarize-chapter",
        },
      ];

  return (
    <div className={styles.bmEmpty}>
      <BookMindMark className={styles.bmEmptyMark} />
      <h2 className={styles.bmEmptyTitle}>
        {chapters.length > 0
          ? "What shall we look at?"
          : "Open a book to begin"}
      </h2>
      {chapters.length > 0 && (
        <p className={styles.bmEmptySub}>
          {title?.trim() ? (
            <>
              Book Mind has read <em>{title.trim()}</em>. Ask anything, or start
              here.
            </>
          ) : (
            "Book Mind has read your book. Ask anything, or start here."
          )}
          {trialMode && !locked && " You have one free question."}
        </p>
      )}
      {chapters.length > 0 && !locked && (
        <ul className={styles.bmSuggest}>
          {suggestions.map((s) => (
            <li key={s.label}>
              <button
                type="button"
                onClick={() =>
                  s.run ? s.run() : s.action && onRunAction(s.action, s.label)
                }
              >
                <span>{s.label}</span>
                <span className={styles.bmSuggestHint}>{s.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
