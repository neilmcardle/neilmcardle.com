export function bookMindGate({
  tierKnown,
  isPro,
  trialUsed,
  busy,
  hasChapters,
}: {
  tierKnown: boolean;
  isPro: boolean;
  trialUsed: boolean;
  busy: boolean;
  hasChapters: boolean;
}): "send" | "upgrade" | "wait" {
  if (tierKnown && !isPro && trialUsed) return "upgrade";
  if (busy || !hasChapters) return "wait";
  return "send";
}
