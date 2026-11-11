import { loadBookById } from "../../utils/bookLibrary";
import {
  getMemory,
  formatMemoryForPrompt,
  isBriefFresh,
} from "../../utils/bookmindMemory";
import {
  buildSpotlightContext,
  renderContextForPrompt,
} from "../../utils/contextRetrieval";
import { readSseData } from "./readSse";

export interface InlineEditArgs {
  selectedText: string;
  surroundingParagraph?: string;
  instruction: string;
}

export function buildInlineEditBody(
  userId: string,
  bookId: string,
  args: InlineEditArgs,
) {
  const book = loadBookById(userId, bookId);
  const brief = book && isBriefFresh(book) ? book.bookmindMemory!.brief! : null;
  const ctx = buildSpotlightContext({
    brief,
    selectedText: args.selectedText,
    surroundingParagraph: args.surroundingParagraph,
  });
  const memoryBlock = book ? formatMemoryForPrompt(getMemory(book)) : "";
  const contextBlock = renderContextForPrompt(ctx);
  return {
    voice: "inline",
    memory: memoryBlock || undefined,
    context: contextBlock,
    messages: [{ role: "user" as const, content: args.instruction }],
    tier: "spotlight",
  };
}

export async function requestInlineEdit(
  body: ReturnType<typeof buildInlineEditBody>,
): Promise<string> {
  const response = await fetch("/api/ai/book-mind", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok || !response.body) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Inline edit failed");
  }
  let fullContent = "";
  await readSseData(response.body, (data) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.content) fullContent += parsed.content;
      if (parsed.error) throw new Error(parsed.error);
    } catch {}
  });
  if (!fullContent) {
    throw new Error("Book Mind returned no content. Try again.");
  }
  return fullContent;
}
