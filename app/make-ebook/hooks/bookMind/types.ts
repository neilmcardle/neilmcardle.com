import type { ContextTier } from "../../utils/contextRetrieval";

export type BookMindAction =
  | "summarize-book"
  | "summarize-chapter"
  | "list-characters"
  | "find-inconsistencies"
  | "analyze-themes"
  | "check-grammar"
  | "timeline-review"
  | "word-frequency"
  | "ask-question";

export interface BookMindMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  action?: BookMindAction;

  meta?: {
    tier?: ContextTier;
    deep?: boolean;
    model?: string;
    read?: string[];
  };
}

export interface BookMindContext {
  title: string;
  author: string;
  genre: string;
  chapterTitle: string;
  chapterContent: string;
  allChapters: { title: string; content: string; type: string }[];
  selectedText?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  bookId: string;
  messages: BookMindMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface SendMessageOpts {
  selectedChapterIndex?: number;
  selectedText?: string;
  action?: BookMindAction;

  deep?: boolean;
  chapterIds?: string[];
  replaceFrom?: string;
}

export interface BookMindActivity {
  read: string[];
  deep: boolean;
  startedAt: number;
}
