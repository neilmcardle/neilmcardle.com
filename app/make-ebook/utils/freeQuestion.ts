import { keys, readLocal, removeLocal, writeLocal } from "../storage/keys";

export function hasUsedFreeQuestion(userId: string | undefined): boolean {
  if (!userId || typeof window === "undefined") return false;
  return readLocal(keys.freeQuestionUsed(userId)) === "1";
}

export function markFreeQuestionUsed(userId: string | undefined): void {
  if (!userId || typeof window === "undefined") return;
  writeLocal(keys.freeQuestionUsed(userId), "1");
}

export function clearFreeQuestionUsed(userId: string | undefined): void {
  if (!userId || typeof window === "undefined") return;
  removeLocal(keys.freeQuestionUsed(userId));
}
