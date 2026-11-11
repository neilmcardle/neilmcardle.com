import { keys, readLocal, removeLocal, writeLocal } from "../storage/keys";

export function hasUsedTrial(userId: string | undefined): boolean {
  if (!userId || typeof window === "undefined") return false;
  return readLocal(keys.bookMindTrialUsed(userId)) === "1";
}

export function markTrialUsed(userId: string | undefined): void {
  if (!userId || typeof window === "undefined") return;
  writeLocal(keys.bookMindTrialUsed(userId), "1");
}

export function clearTrialUsed(userId: string | undefined): void {
  if (!userId || typeof window === "undefined") return;
  removeLocal(keys.bookMindTrialUsed(userId));
}
