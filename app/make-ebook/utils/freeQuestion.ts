import { keys, removeLocal, writeLocal } from "../storage/keys";
import { useLocalValue } from "../storage/useLocalValue";

export function useFreeQuestionUsed(userId: string | undefined): boolean {
  return useLocalValue(userId ? keys.freeQuestionUsed(userId) : null) === "1";
}

export function markFreeQuestionUsed(userId: string | undefined): void {
  if (!userId || typeof window === "undefined") return;
  writeLocal(keys.freeQuestionUsed(userId), "1");
}

export function clearFreeQuestionUsed(userId: string | undefined): void {
  if (!userId || typeof window === "undefined") return;
  removeLocal(keys.freeQuestionUsed(userId));
}
