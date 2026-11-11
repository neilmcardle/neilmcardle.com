export const PREFIX = "makeebook:";

export type StorageKey = { key: string; legacy: string[] };

function scoped(userId: string | undefined) {
  return userId || "guest";
}

function userPrefix(userId: string | undefined) {
  return userId ? `${userId}_` : "";
}

export const keys = {
  bookPrefix: (userId: string) => `${PREFIX}book:${userId}:`,
  book: (userId: string, bookId: string) => `${PREFIX}book:${userId}:${bookId}`,
  legacyLibrary: (userId: string) => `makeebook_library_${userId}`,
  booksChannel: `${PREFIX}books`,
  booksDatabase: "makeebook",

  focusSettings: (): StorageKey => ({
    key: `${PREFIX}focus-settings`,
    legacy: ["makeebook-focus-settings"],
  }),
  panelWidth: (): StorageKey => ({
    key: `${PREFIX}left-panel-width`,
    legacy: ["me-left-panel-width"],
  }),
  flowMode: (): StorageKey => ({
    key: `${PREFIX}flow-mode`,
    legacy: ["me_flow_mode"],
  }),
  bookMindExpanded: (): StorageKey => ({
    key: `${PREFIX}bookmind-expanded`,
    legacy: ["bookmind_expanded"],
  }),
  onboardingComplete: (userId: string | undefined): StorageKey => ({
    key: `${PREFIX}onboarding-complete:${scoped(userId)}`,
    legacy: [`${userPrefix(userId)}makeebook_onboarding_complete`],
  }),
  wordsToday: (userId: string | undefined, date: string): StorageKey => ({
    key: `${PREFIX}words:${scoped(userId)}:${date}`,
    legacy: userId
      ? [`${userId}_makeebook-words-${date}`]
      : [`makeebook-words-${date}`, `_makeebook-words-${date}`],
  }),
  bookMindChats: (userId: string | undefined): StorageKey => ({
    key: `${PREFIX}bookmind-chats:${scoped(userId)}`,
    legacy: [`${userPrefix(userId)}bookmind_chats`],
  }),
  bookMindTrialUsed: (userId: string): StorageKey => ({
    key: `${PREFIX}bookmind-trial-used:${userId}`,
    legacy: [`mf_bm_trial_used_${userId}`],
  }),
  bookMindFirstSent: (userId: string): StorageKey => ({
    key: `${PREFIX}bookmind-first-sent:${userId}`,
    legacy: [`mf_bm_first_sent_${userId}`],
  }),
  firstExport: (userId: string): StorageKey => ({
    key: `${PREFIX}first-export:${userId}`,
    legacy: [`mf_first_export_${userId}`],
  }),
  editorOpened: (userId: string): StorageKey => ({
    key: `${PREFIX}editor-opened:${userId}`,
    legacy: [`mf_editor_opened_${userId}`],
  }),
  versions: (userId: string | undefined, bookId: string): StorageKey => ({
    key: `${PREFIX}versions:${scoped(userId)}:${bookId}`,
    legacy: [`${userPrefix(userId)}makeebook-versions-${bookId}`],
  }),
};

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readLocal(name: StorageKey): string | null {
  const store = storage();
  if (!store) return null;
  try {
    const value = store.getItem(name.key);
    if (value !== null) return value;
    for (const old of name.legacy) {
      const legacy = store.getItem(old);
      if (legacy === null) continue;
      store.setItem(name.key, legacy);
      store.removeItem(old);
      return legacy;
    }
  } catch {}
  return null;
}

export function writeLocal(name: StorageKey, value: string): boolean {
  const store = storage();
  if (!store) return false;
  try {
    store.setItem(name.key, value);
    for (const old of name.legacy) store.removeItem(old);
    return true;
  } catch {
    return false;
  }
}

export function removeLocal(name: StorageKey) {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(name.key);
    for (const old of name.legacy) store.removeItem(old);
  } catch {}
}
