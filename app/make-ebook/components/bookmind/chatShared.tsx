import type { BookMindAction } from "../../hooks/useBookMind";
import type { Chapter } from "../../types";

export interface Suggestion {
  label: string;
  hint: string;
  action?: BookMindAction;
  run?: () => void;
}

export const COMMANDS: {
  cmd: string;
  label: string;
  action: BookMindAction;
}[] = [
  {
    cmd: "/summarise",
    label: "Summarise the book",
    action: "summarize-book",
  },
  {
    cmd: "/chapter",
    label: "Walk me through this chapter",
    action: "summarize-chapter",
  },
  {
    cmd: "/characters",
    label: "Who appears where",
    action: "list-characters",
  },
  {
    cmd: "/issues",
    label: "Find inconsistencies and plot holes",
    action: "find-inconsistencies",
  },
  { cmd: "/themes", label: "The big ideas", action: "analyze-themes" },
  {
    cmd: "/timeline",
    label: "Review the chronology",
    action: "timeline-review",
  },
  {
    cmd: "/grammar",
    label: "Review grammar in this chapter",
    action: "check-grammar",
  },
  {
    cmd: "/words",
    label: "Overused words and phrases",
    action: "word-frequency",
  },
];

export const ICON = {
  plus: "M12 5v14M5 12h14",
  up: "M12 19V5M5 12l7-7 7 7",
  copy: "M9 9h11v11H9zM5 15V4h11",
  check: "M5 12.5l4.5 4.5L19 7",
  retry: "M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5",
  read: "M4 5.5C6 4.5 9 4.5 12 6c3-1.5 6-1.5 8-.5V19c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5z M12 6v13.5",
  remember: "M7 4h10v16l-5-3.5L7 20z",
  chevron: "M9 6l6 6-6 6",
  close: "M6 6l12 12M18 6L6 18",
  deep: "M4 12h3l2-6 3 12 3-9 2 3h3",
  chapter: "M6 4h9l3 3v13H6zM9 11h6M9 15h6",
};

export function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export function chapterLabel(chapters: Chapter[], index: number) {
  const title = chapters[index]?.title?.trim();
  return title || `Chapter ${index + 1}`;
}

export function matchCommands(input: string, isPro: boolean) {
  const slashQuery = input.startsWith("/")
    ? input.slice(1).toLowerCase()
    : null;
  return slashQuery === null || slashQuery.includes(" ")
    ? []
    : COMMANDS.filter(
        (c) =>
          c.cmd.slice(1).startsWith(slashQuery) ||
          (slashQuery.length > 2 && c.label.toLowerCase().includes(slashQuery)),
      ).filter((c) => isPro || c.action !== "word-frequency");
}
