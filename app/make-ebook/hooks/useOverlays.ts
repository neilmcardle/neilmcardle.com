import { useCallback, useState, type SetStateAction } from "react";
import type { ExportFormat } from "../components/PreflightExportDialog";
import {
  closePanel,
  closePopup,
  closeSheet,
  noOverlays,
  openPanel,
  openPopup,
  openSheet,
  type DialogConfig,
  type Overlays,
  type Sheet,
} from "../state/overlays";

const CLOSED_DIALOG: DialogConfig = {
  open: false,
  title: "",
  message: "",
  variant: "alert",
  onConfirm: () => {},
};

function resolve<T>(action: SetStateAction<T>, current: T): T {
  return typeof action === "function"
    ? (action as (prev: T) => T)(current)
    : action;
}

export function useOverlays() {
  const [overlays, setOverlays] = useState<Overlays>(noOverlays);

  const setSheet = useCallback(
    (sheet: Sheet, action: SetStateAction<boolean>) =>
      setOverlays((prev) =>
        resolve(action, prev.sheet === sheet)
          ? openSheet(prev, sheet)
          : closeSheet(prev, sheet),
      ),
    [],
  );
  const setMobileSidebarOpen = useCallback(
    (action: SetStateAction<boolean>) => setSheet("mobileSidebar", action),
    [setSheet],
  );
  const setMobileBookMindOpen = useCallback(
    (action: SetStateAction<boolean>) => setSheet("mobileBookMind", action),
    [setSheet],
  );
  const setChaptersSheetOpen = useCallback(
    (action: SetStateAction<boolean>) => setSheet("chapters", action),
    [setSheet],
  );

  const setNewBookConfirmOpen = useCallback(
    (action: SetStateAction<boolean>) =>
      setOverlays((prev) =>
        resolve(action, prev.panel?.kind === "newBook")
          ? openPanel(prev, { kind: "newBook" })
          : closePanel(prev, "newBook"),
      ),
    [],
  );

  const setExportUpgradeOpen = useCallback(
    (action: SetStateAction<boolean>) =>
      setOverlays((prev) =>
        resolve(action, prev.popup?.kind === "upgrade")
          ? openPopup(prev, { kind: "upgrade" })
          : closePopup(prev, "upgrade"),
      ),
    [],
  );

  const setShowEPUBReader = useCallback(
    (action: SetStateAction<boolean>) =>
      setOverlays((prev) =>
        resolve(action, prev.popup?.kind === "epubReader")
          ? openPopup(prev, { kind: "epubReader" })
          : closePopup(prev, "epubReader"),
      ),
    [],
  );

  const setHistoryModal = useCallback(
    (action: SetStateAction<"versions" | "exports" | null>) =>
      setOverlays((prev) => {
        const current = prev.panel?.kind === "history" ? prev.panel.view : null;
        const view = resolve(action, current);
        return view
          ? openPanel(prev, { kind: "history", view })
          : closePanel(prev, "history");
      }),
    [],
  );

  const setPreflightFormat = useCallback(
    (action: SetStateAction<ExportFormat | null>) =>
      setOverlays((prev) => {
        const current =
          prev.panel?.kind === "preflight" ? prev.panel.format : null;
        const format = resolve(action, current);
        return format
          ? openPanel(prev, { kind: "preflight", format })
          : closePanel(prev, "preflight");
      }),
    [],
  );

  const setDialogState = useCallback(
    (action: SetStateAction<DialogConfig>) =>
      setOverlays((prev) => {
        const current =
          prev.popup?.kind === "dialog" ? prev.popup.dialog : CLOSED_DIALOG;
        const dialog = resolve(action, current);
        return dialog.open
          ? openPopup(prev, { kind: "dialog", dialog })
          : closePopup(prev, "dialog");
      }),
    [],
  );

  const { sheet, panel, popup } = overlays;

  return {
    overlays,
    mobileSidebarOpen: sheet === "mobileSidebar",
    setMobileSidebarOpen,
    mobileBookMindOpen: sheet === "mobileBookMind",
    setMobileBookMindOpen,
    chaptersSheetOpen: sheet === "chapters",
    setChaptersSheetOpen,
    newBookConfirmOpen: panel?.kind === "newBook",
    setNewBookConfirmOpen,
    exportUpgradeOpen: popup?.kind === "upgrade",
    setExportUpgradeOpen,
    showEPUBReader: popup?.kind === "epubReader",
    setShowEPUBReader,
    historyModal: panel?.kind === "history" ? panel.view : null,
    setHistoryModal,
    preflightFormat: panel?.kind === "preflight" ? panel.format : null,
    setPreflightFormat,
    dialogState: popup?.kind === "dialog" ? popup.dialog : CLOSED_DIALOG,
    setDialogState,
  };
}
