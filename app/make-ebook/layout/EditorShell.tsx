"use client";
import React, { useEffect } from "react";
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
        className={`${studio.editorRoot} bg-white dark:bg-[var(--ink)] text-[var(--ink)] dark:text-[var(--paper)]`}
      >
        <NewBookConfirmDialog />

        <ImportDialog />

        <HistoryModal />

        <MobileBookMindSheet />

        <MobileDrawer />

        <div
          className={`flex flex-col lg:flex-row h-[100dvh] overflow-hidden transition-[padding] duration-300 ${docked ? "lg:pr-[520px]" : ""}`}
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
