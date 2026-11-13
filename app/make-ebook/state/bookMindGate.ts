export function bookMindGate({
  tierKnown,
  isPro,
  freeQuestionUsed,
  busy,
  hasChapters,
}: {
  tierKnown: boolean;
  isPro: boolean;
  freeQuestionUsed: boolean;
  busy: boolean;
  hasChapters: boolean;
}): "send" | "upgrade" | "wait" {
  if (tierKnown && !isPro && freeQuestionUsed) return "upgrade";
  if (busy || !hasChapters) return "wait";
  return "send";
}
