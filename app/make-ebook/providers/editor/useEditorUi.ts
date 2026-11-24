"use client";
import { useCallback, useRef, useState, type SetStateAction } from "react";
import { morph, morphSurface } from "../../utils/surfaceMorph";
import { keys, readLocal, writeLocal } from "../../storage/keys";
import { useKeyboardInset } from "../../hooks/useKeyboardInset";
import type { SidebarView } from "../types";

export function useEditorUi() {
  const [sidebarView, setSidebarViewNow] = useState<SidebarView>(null);
  const viewRef = useRef<SidebarView>(null);
  const setSidebarView = useCallback((next: SetStateAction<SidebarView>) => {
    const from = viewRef.current;
    const to = typeof next === "function" ? next(from) : next;
    if (to === from) return;
    viewRef.current = to;
    const kind = !from ? "panel-open" : !to ? "panel-close" : "panel-switch";
    morph(kind, () => setSidebarViewNow(to));
  }, []);
  const [surfaceMode, setSurfaceModeNow] = useState<"edit" | "preview">("edit");
  const surfaceRef = useRef<"edit" | "preview">("edit");
  const setSurfaceMode = useCallback(
    (next: SetStateAction<"edit" | "preview">) => {
      const target =
        typeof next === "function" ? next(surfaceRef.current) : next;
      if (target === surfaceRef.current) return;
      surfaceRef.current = target;
      morphSurface(target, () => setSurfaceModeNow(target));
    },
    [],
  );
  const [bookMindOpen, setBookMindOpen] = useState(false);
  const [bookMindDocked, setBookMindDockedNow] = useState(false);
  const dockedRef = useRef(false);
  const setBookMindDocked = useCallback((next: SetStateAction<boolean>) => {
    const to = typeof next === "function" ? next(dockedRef.current) : next;
    if (to === dockedRef.current) return;
    dockedRef.current = to;
    morph("dock", () => setBookMindDockedNow(to));
  }, []);
  const [bookMindBusy, setBookMindBusy] = useState(false);
  const [epubBlob, setEpubBlob] = useState<Blob | null>(null);

  const [flowMode, setFlowMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return readLocal(keys.flowMode()) === "1";
  });
  const handleToggleFlowMode = useCallback(() => {
    setFlowMode((prev) => {
      const next = !prev;
      writeLocal(keys.flowMode(), next ? "1" : "0");
      return next;
    });
  }, []);

  const [monoAccent, setMonoAccent] = useState(() => {
    if (typeof window === "undefined") return false;
    return readLocal(keys.accent()) === "mono";
  });
  const handleToggleMonoAccent = useCallback(() => {
    setMonoAccent((prev) => {
      const next = !prev;
      writeLocal(keys.accent(), next ? "mono" : "acid");
      return next;
    });
  }, []);

  const [mobileEditorFocused, setMobileEditorFocused] = useState(false);
  useKeyboardInset(mobileEditorFocused);

  const [sidebarLibraryExpanded, setSidebarLibraryExpanded] = useState(true);
  const [sidebarChaptersExpanded, setSidebarChaptersExpanded] = useState(true);
  const [sidebarBookDetailsExpanded, setSidebarBookDetailsExpanded] =
    useState(false);

  const expandMobileSection = (section: "library" | "book" | "chapters") =>
    morph("section", () => {
      setSidebarLibraryExpanded(
        section === "library" ? !sidebarLibraryExpanded : false,
      );
      setSidebarBookDetailsExpanded(
        section === "book" ? !sidebarBookDetailsExpanded : false,
      );
      setSidebarChaptersExpanded(
        section === "chapters" ? !sidebarChaptersExpanded : false,
      );
    });

  const [lastSidebarView, setLastSidebarView] = useState(sidebarView);
  if (sidebarView !== lastSidebarView) {
    setLastSidebarView(sidebarView);
    if (sidebarView === "library") setSidebarLibraryExpanded(true);
    if (sidebarView === "book") setSidebarBookDetailsExpanded(true);
    if (sidebarView === "chapters") setSidebarChaptersExpanded(true);
  }

  return {
    state: {
      sidebarView,
      isPanelOpen: sidebarView !== null,
      surfaceMode,
      bookMindOpen,
      bookMindDocked,
      bookMindBusy,
      epubBlob,
      flowMode,
      monoAccent,
      mobileEditorFocused,
      sidebarLibraryExpanded,
      sidebarChaptersExpanded,
      sidebarBookDetailsExpanded,
    },
    actions: {
      setSidebarView,
      setSurfaceMode,
      setBookMindOpen,
      setBookMindDocked,
      setBookMindBusy,
      setEpubBlob,
      handleToggleFlowMode,
      handleToggleMonoAccent,
      setMobileEditorFocused,
      setSidebarLibraryExpanded,
      setSidebarChaptersExpanded,
      setSidebarBookDetailsExpanded,
      expandMobileSection,
    },
  };
}
