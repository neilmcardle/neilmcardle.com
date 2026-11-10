function key(userId: string) {
  return `mf_bm_trial_used_${userId}`;
}

export function hasUsedTrial(userId: string | undefined): boolean {
  if (!userId || typeof window === "undefined") return false;
  try {
    return localStorage.getItem(key(userId)) === "1";
  } catch {
    return false;
  }
}

export function markTrialUsed(userId: string | undefined): void {
  if (!userId || typeof window === "undefined") return;
  try {
    localStorage.setItem(key(userId), "1");
  } catch {}
}

export function clearTrialUsed(userId: string | undefined): void {
  if (!userId || typeof window === "undefined") return;
  try {
    localStorage.removeItem(key(userId));
  } catch {}
}
