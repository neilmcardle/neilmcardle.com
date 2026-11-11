export interface Autosave {
  isDirty: boolean;
  isSaving: boolean;
  hasFailed: boolean;
  lastSaved: Date | null;
  firstDirtyAt: number;
  failures: number;
  attempt: number;
  edits: number;
}

export type AutosaveEvent =
  | { type: "edited"; at: number }
  | { type: "saveStarted" }
  | { type: "saveFinished"; ok: boolean }
  | { type: "saved"; at: number; current: boolean };

export const initialAutosave: Autosave = {
  isDirty: false,
  isSaving: false,
  hasFailed: false,
  lastSaved: null,
  firstDirtyAt: 0,
  failures: 0,
  attempt: 0,
  edits: 0,
};

export function autosave(state: Autosave, event: AutosaveEvent): Autosave {
  switch (event.type) {
    case "edited":
      return state.isDirty
        ? { ...state, edits: state.edits + 1 }
        : {
            ...state,
            isDirty: true,
            firstDirtyAt: event.at,
            edits: state.edits + 1,
          };
    case "saveStarted":
      return { ...state, isSaving: true };
    case "saveFinished":
      return event.ok
        ? { ...state, isSaving: false }
        : {
            ...state,
            isSaving: false,
            hasFailed: true,
            failures: state.failures + 1,
            attempt: state.attempt + 1,
          };
    case "saved":
      return event.current
        ? {
            ...state,
            isDirty: false,
            lastSaved: new Date(event.at),
            isSaving: false,
            hasFailed: false,
            failures: 0,
          }
        : {
            ...state,
            firstDirtyAt: event.at,
            lastSaved: new Date(event.at),
            isSaving: false,
            hasFailed: false,
            failures: 0,
            attempt: state.attempt + 1,
          };
  }
}

export function autosaveDelay(
  state: Pick<Autosave, "failures" | "firstDirtyAt">,
  now: number,
  interval: number,
  maxWait: number,
) {
  if (state.failures > 0)
    return Math.min(120000, 15000 * 2 ** (state.failures - 1));
  const waited = now - state.firstDirtyAt;
  return Math.max(0, Math.min(interval, maxWait - waited));
}

export function isSaveOk(result: unknown) {
  return result !== false && result !== "failed";
}
