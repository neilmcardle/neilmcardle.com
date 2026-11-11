"use client";
import React from "react";
import Image from "next/image";
import DrawerSection from "../components/mobile/DrawerSection";
import SyncConflictBanner from "../components/sidebar/SyncConflictBanner";
import LibraryPanel from "../components/sidebar/LibraryPanel";
import BookDetailsPanel from "../components/sidebar/BookDetailsPanel";
import ChaptersPanel from "../components/sidebar/ChaptersPanel";
import { UserDropdownMobile } from "../components/UserDropdownMobile";
import studio from "../styles/studio.module.css";
import { useSession } from "../providers/SessionProvider";
import { useBook, useBookActions } from "../providers/BookProvider";
import { useEditor, useEditorActions } from "../providers/EditorProvider";
import { shallowEqual } from "../providers/store";

function SectionIcon({ d }: { d: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export default function MobileDrawer() {
  const hasConflicts = useSession((s) => s.cloudSync.syncConflicts.length > 0);
  const { libraryCount, chaptersCount } = useBook(
    (s) => ({
      libraryCount: s.libraryBooks.length,
      chaptersCount: s.chapters.length,
    }),
    shallowEqual,
  );
  const ui = useEditor(
    (s) => ({
      open: s.mobileSidebarOpen,
      library: s.sidebarLibraryExpanded,
      book: s.sidebarBookDetailsExpanded,
      chapters: s.sidebarChaptersExpanded,
    }),
    shallowEqual,
  );
  const book = useBookActions();
  const actions = useEditorActions();
  const close = () => actions.setMobileSidebarOpen(false);

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 z-[100] lg:hidden transition-[visibility] duration-200 ease-out ${
        ui.open ? "visible" : "invisible"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/55 transition-opacity duration-200 ease-out ${
          ui.open ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />

      <div
        className={`${studio.drawer} transform transition-transform duration-200 ease-out ${
          ui.open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className={studio.drawerHead}>
            <button
              type="button"
              onClick={() => {
                book.goHome();
                close();
              }}
              className={studio.drawerBrand}
              aria-label="Go to home"
            >
              <Image
                src="/make-ebook/brand/mark.svg"
                alt=""
                width={38}
                height={14}
                className="h-[13px] w-auto"
                priority
              />
              <span>makeebook</span>
            </button>
            <button
              type="button"
              onClick={close}
              className={studio.mobileIconBtn}
              aria-label="Close menu"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <path d="M9 4v16" />
              </svg>
            </button>
          </div>

          <div className={studio.drawerBody}>
            <DrawerSection
              icon={<SectionIcon d="M4 4v16M10 7v13M16 5v15M3 20h18" />}
              label="Library"
              count={libraryCount}
              alert={hasConflicts}
              open={ui.library}
              onToggle={() => actions.expandMobileSection("library")}
            >
              <SyncConflictBanner />
              <LibraryPanel
                active={ui.open && ui.library}
                onNavigate={close}
                compact
              />
            </DrawerSection>

            <DrawerSection
              icon={
                <SectionIcon d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h11M9 8h6" />
              }
              label="Book details"
              open={ui.book}
              onToggle={() => actions.expandMobileSection("book")}
            >
              <BookDetailsPanel compact idPrefix="mbd" />
            </DrawerSection>

            <DrawerSection
              icon={
                <SectionIcon d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
              }
              label="Chapters"
              count={chaptersCount}
              open={ui.chapters}
              onToggle={() => actions.expandMobileSection("chapters")}
            >
              <ChaptersPanel onNavigate={close} compact />
            </DrawerSection>
          </div>

          <footer className={studio.drawerFoot}>
            <UserDropdownMobile
              onStartTour={() => {
                close();
                actions.startTour(400);
              }}
            />
          </footer>
        </div>
      </div>
    </div>
  );
}
