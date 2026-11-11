import type { Dispatch, SetStateAction } from "react";
import type { DialogConfig } from "../state/overlays";

export type SidebarView = "library" | "book" | "chapters" | null;

export type SetDialog = Dispatch<SetStateAction<DialogConfig>>;

export interface BookUi {
  setDialogState: SetDialog;
  setSidebarView: (view: SidebarView) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  markDirty: () => void;
  isDirty: () => boolean;
  flushSave: () => Promise<unknown>;
  reloadOpenBook: (id: string) => void;
  afterBlankBook: () => void;
}

export const BOOK_UI_FALLBACK: BookUi = {
  setDialogState: () => {},
  setSidebarView: () => {},
  setMobileSidebarOpen: () => {},
  markDirty: () => {},
  isDirty: () => false,
  flushSave: async () => {},
  reloadOpenBook: () => {},
  afterBlankBook: () => {},
};
