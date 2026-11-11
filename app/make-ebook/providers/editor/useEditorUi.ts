"use client";
import { useCallback, useEffect, useState } from "react";
import { keys, readLocal, writeLocal } from "../../storage/keys";
import { useKeyboardInset } from "../../hooks/useKeyboardInset";
import type { SidebarView } from "../types";

export function useEditorUi() {
  const [sidebarView, setSidebarView] = useState<SidebarView>(null);
  const [surfaceMode, setSurfaceMode] = useState<"edit" | "preview">("edit");
  const [bookMindOpen, setBookMindOpen] = useState(false);
  const [bookMindDocked, setBookMindDocked] = useState(false);
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

  const [mobileEditorFocused, setMobileEditorFocused] = useState(false);
  useKeyboardInset(mobileEditorFocused);

  const [sidebarLibraryExpanded, setSidebarLibraryExpanded] = useState(true);
  const [sidebarChaptersExpanded, setSidebarChaptersExpanded] = useState(true);
  const [sidebarBookDetailsExpanded, setSidebarBookDetailsExpanded] =
    useState(false);

  const expandMobileSection = (section: "library" | "book" | "chapters") => {
    setSidebarLibraryExpanded(
      section === "library" ? !sidebarLibraryExpanded : false,
    );
    setSidebarBookDetailsExpanded(
      section === "book" ? !sidebarBookDetailsExpanded : false,
    );
    setSidebarChaptersExpanded(
      section === "chapters" ? !sidebarChaptersExpanded : false,
    );
  };

  useEffect(() => {
    if (!sidebarView) return;
    if (sidebarView === "library") setSidebarLibraryExpanded(true);
    if (sidebarView === "book") setSidebarBookDetailsExpanded(true);
    if (sidebarView === "chapters") setSidebarChaptersExpanded(true);
  }, [sidebarView]);

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
      setMobileEditorFocused,
      setSidebarLibraryExpanded,
      setSidebarChaptersExpanded,
      setSidebarBookDetailsExpanded,
      expandMobileSection,
    },
  };
}
