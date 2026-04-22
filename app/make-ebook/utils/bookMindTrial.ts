// Per-book, per-user Book Mind trial state for Free users.
// Pro users bypass this entirely — the trial only applies to the Free tier
// "one analysis per book" sampling experience. Stored in localStorage so it
// survives reload but is client-only; no server truth, no way to enforce
// against a determined user. That's fine — the trial is a conversion
// mechanic, not a security boundary.

function key(userId: string, bookId: string) {
  return `mf_bm_trial_used_${userId}_${bookId}`;
}

export function hasUsedTrial(userId: string | undefined, bookId: string | undefined): boolean {
  if (!userId || !bookId || typeof window === "undefined") return false;
  return localStorage.getItem(key(userId, bookId)) === "1";
}

export function markTrialUsed(userId: string | undefined, bookId: string | undefined): void {
  if (!userId || !bookId || typeof window === "undefined") return;
  localStorage.setItem(key(userId, bookId), "1");
}
