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
