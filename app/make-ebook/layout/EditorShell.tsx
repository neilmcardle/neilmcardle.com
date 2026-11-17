"use client";
import React, { useEffect, useRef } from "react";
import TrialBanner from "../components/TrialBanner";
import NewBookConfirmDialog from "../components/modals/NewBookConfirmDialog";
import ImportDialog from "../components/modals/ImportDialog";
import studio from "../styles/studio.module.css";
import { useEditor } from "../providers/EditorProvider";
import { DesktopNav, DesktopSurface } from "./DesktopEditor";
import { MobileChrome, MobileSurface, MobileTopBar } from "./MobileEditor";
import MobileDrawer from "./MobileDrawer";
import {
  EditorOverlays,
  HistoryModal,
  MobileBookMindSheet,
} from "./EditorOverlays";

export default function EditorShell() {
  const docked = useEditor((s) => s.bookMindDocked);
  const monoAccent = useEditor((s) => s.monoAccent);
  const accentSet = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;
    if (accentSet.current) {
      root.dataset.accentFade = "";
      timer = window.setTimeout(() => {
        delete root.dataset.accentFade;
      }, 320);
    }
    accentSet.current = true;
    if (monoAccent) root.dataset.accent = "mono";
    else delete root.dataset.accent;
    return () => window.clearTimeout(timer);
  }, [monoAccent]);

  useEffect(
    () => () => {
      delete document.documentElement.dataset.accent;
      delete document.documentElement.dataset.accentFade;
    },
    [],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = "fade";
    return () => {
      delete root.dataset.motion;
    };
  }, []);

  return (
    <>
      <TrialBanner />

      <div
        className={`${studio.editorRoot} me-boot bg-white dark:bg-[var(--ink)] text-[var(--ink)] dark:text-[var(--paper)]`}
      >
        <NewBookConfirmDialog />

        <ImportDialog />

        <HistoryModal />

        <MobileBookMindSheet />

        <MobileDrawer />

        <div
          className={`flex flex-col lg:flex-row h-[100dvh] overflow-hidden ${docked ? "lg:pr-[520px]" : ""}`}
        >
          <DesktopNav />

          <main
            data-editor-scroll
            className="flex-1 flex flex-col bg-white dark:bg-[var(--ink)] px-0 py-0 lg:pl-0 lg:pr-0 lg:py-0 min-w-0 overflow-x-hidden overflow-y-auto relative"
          >
            <MobileTopBar />

            <div className="hidden lg:block"></div>

            <MobileSurface />

            <DesktopSurface />
          </main>
        </div>
      </div>

      <MobileChrome />

      <EditorOverlays />
    </>
  );
}
