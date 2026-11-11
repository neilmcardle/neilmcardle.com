import type { BookMindAction } from "./types";

export const ACTION_PROMPTS: Record<BookMindAction, string> = {
  "summarize-book":
    "Give me a natural summary of what this book is about: the main story, the themes running through it, and how the characters develop. Keep it conversational and grounded in specific moments.",
  "summarize-chapter":
    "Walk me through what happens in the currently open chapter ONLY. What are the key moments, how do the characters change or react, and how does it fit into the bigger picture? Do not discuss other chapters.",
  "list-characters":
    "Who are all the people in this book? For each one, tell me where they appear and what role they play in the story. Be specific.",
  "find-inconsistencies":
    "Look through the book and flag anything that doesn't quite add up: plot holes, timeline issues, characters acting out of character, facts that contradict each other. Be specific about what you find and where.",
  "analyze-themes":
    "What are the big ideas running through this book? Point to specific moments that show these themes in action.",
  "check-grammar":
    "Go through the currently open chapter ONLY. Catch any grammar, spelling, or punctuation issues. Tell me where they are and how to fix them. Do not check other chapters.",
  "timeline-review":
    "Map out when everything happens in this book. Note any dates or time references, and flag anything that seems off with the chronology.",
  "word-frequency":
    "Look at the language patterns in this book. Are there words or phrases that keep coming up? Any habits the author might want to mix up?",
  "ask-question": "",
};

export const ANALYTICAL_ACTIONS: BookMindAction[] = [
  "summarize-book",
  "list-characters",
  "find-inconsistencies",
  "analyze-themes",
  "timeline-review",
  "word-frequency",
];

export const CHAPTER_SCOPED: BookMindAction[] = [
  "check-grammar",
  "summarize-chapter",
];

export const ACTION_LABELS: Record<BookMindAction, string> = {
  "summarize-book": "Summarize the entire book",
  "summarize-chapter": "Summarize this chapter",
  "list-characters": "List all characters",
  "find-inconsistencies": "Find inconsistencies",
  "analyze-themes": "Analyze themes",
  "check-grammar": "Check grammar",
  "timeline-review": "Review timeline",
  "word-frequency": "Analyze word frequency",
  "ask-question": "Ask a question",
};

export const generateId = () =>
  `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const generateSessionId = () =>
  `chat-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
