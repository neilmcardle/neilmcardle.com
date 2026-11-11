"use client";
import React from "react";
import PreflightExportDialog from "../PreflightExportDialog";
import { useSession } from "../../providers/SessionProvider";
import { useBook, useBookActions } from "../../providers/BookProvider";
import { useEditor, useEditorActions } from "../../providers/EditorProvider";
import { shallowEqual } from "../../providers/store";

function highlightField(field: string, mobile: boolean) {
  window.setTimeout(() => {
    const el = document.getElementById(`${mobile ? "mbd" : "bd"}-${field}`);
    if (!el) return;
    const target =
      field === "cover-image"
        ? ((el.previousElementSibling as HTMLElement | null) ?? el)
        : el;
    target.scrollIntoView({ block: "center", behavior: "smooth" });
    if (field !== "cover-image") el.focus({ preventScroll: true });
    target.animate(
      [
        { boxShadow: "0 0 0 2px var(--acid)" },
        { boxShadow: "0 0 0 2px transparent" },
      ],
      { duration: 1800, easing: "ease-out" },
    );
  }, 450);
}

export default function PreflightHost() {
  const isPro = useSession((s) => s.isPro);
  const preflightFormat = useEditor((s) => s.preflightFormat);
  const { title, author, chapters, coverUrl, language, genre } = useBook(
    (s) => ({
      title: s.title,
      author: s.author,
      chapters: s.chapters,
      coverUrl: s.coverUrl,
      language: s.language,
      genre: s.genre,
    }),
    shallowEqual,
  );
  const book = useBookActions();
  const actions = useEditorActions();

  return (
    <PreflightExportDialog
      open={preflightFormat !== null}
      format={preflightFormat ?? "epub"}
      input={{
        title,
        author,
        chapters,
        coverFile: coverUrl,
        language,
        genre,
      }}
      isPro={isPro}
      fixes={{
        setTitle: book.setTitle,
        setAuthor: book.setAuthor,
        setGenre: book.setGenre,
        setLanguage: book.setLanguage,
        onCoverChange: book.handleCoverChange,
        setCover: book.setCoverUrl,
        onShowField: (field) => {
          const mobile = window.innerWidth < 1024;
          if (mobile) {
            actions.setSidebarLibraryExpanded(false);
            actions.setSidebarChaptersExpanded(false);
            actions.setSidebarBookDetailsExpanded(true);
            actions.setMobileSidebarOpen(true);
          } else {
            actions.setSidebarView("book");
          }
          highlightField(field, mobile);
        },
        onShowChapters: () => {
          if (window.innerWidth < 1024) actions.setChaptersSheetOpen(true);
          else actions.setSidebarView("chapters");
        },
      }}
      onClose={() => actions.setPreflightFormat(null)}
      onDownload={() => {
        if (preflightFormat === "epub") actions.handleExportEPUB();
        else if (preflightFormat === "pdf") actions.handleExportPDF();
        else if (preflightFormat === "docx") actions.handleExportDocx();
      }}
      onUpgrade={() => actions.setExportUpgradeOpen(true)}
    />
  );
}
