import type { ExportFormat } from "../components/PreflightExportDialog";

export interface DialogConfig {
  open: boolean;
  title: string;
  message: string;
  variant: "confirm" | "alert" | "destructive";
  confirmLabel?: string;
  onConfirm: () => void;
}

export type Sheet = "mobileSidebar" | "mobileBookMind" | "chapters";

export type Panel =
  | { kind: "newBook" }
  | { kind: "history"; view: "versions" | "exports" }
  | { kind: "preflight"; format: ExportFormat };

export type Popup =
  | { kind: "dialog"; dialog: DialogConfig }
  | { kind: "upgrade" }
  | { kind: "epubReader" };

export interface Overlays {
  sheet: Sheet | null;
  panel: Panel | null;
  popup: Popup | null;
}

export const noOverlays: Overlays = { sheet: null, panel: null, popup: null };

export function openSheet(state: Overlays, sheet: Sheet): Overlays {
  return { ...state, sheet };
}

export function closeSheet(state: Overlays, sheet: Sheet): Overlays {
  return state.sheet === sheet ? { ...state, sheet: null } : state;
}

export function openPanel(state: Overlays, panel: Panel): Overlays {
  return { ...state, panel };
}

export function closePanel(state: Overlays, kind: Panel["kind"]): Overlays {
  return state.panel?.kind === kind ? { ...state, panel: null } : state;
}

export function openPopup(state: Overlays, popup: Popup): Overlays {
  return { ...state, popup };
}

export function closePopup(state: Overlays, kind: Popup["kind"]): Overlays {
  return state.popup?.kind === kind ? { ...state, popup: null } : state;
}

export function closeTop(state: Overlays): Overlays {
  if (state.popup) return { ...state, popup: null };
  if (state.panel) return { ...state, panel: null };
  if (state.sheet) return { ...state, sheet: null };
  return state;
}
