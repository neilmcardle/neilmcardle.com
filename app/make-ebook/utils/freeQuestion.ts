import { keys, readLocal, removeLocal, writeLocal } from "../storage/keys";

export const FREE_QUESTION_EVENT = "mb-free-question-change";

function announce(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(FREE_QUESTION_EVENT));
}

export function hasUsedFreeQuestion(userId: string | undefined): boolean {
  if (!userId || typeof window === "undefined") return false;
  return readLocal(keys.freeQuestionUsed(userId)) === "1";
}

export function markFreeQuestionUsed(userId: string | undefined): void {
  if (!userId || typeof window === "undefined") return;
  writeLocal(keys.freeQuestionUsed(userId), "1");
  announce();
}

export function clearFreeQuestionUsed(userId: string | undefined): void {
  if (!userId || typeof window === "undefined") return;
  removeLocal(keys.freeQuestionUsed(userId));
  announce();
}
