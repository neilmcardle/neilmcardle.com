"use client";
import React, { Suspense } from "react";
import MarketingLandingPage from "./components/MarketingLandingPage";
import { BrandLoader } from "./components/marketing/brand/BrandLoader";
import EditorShell from "./layout/EditorShell";
import { SessionProvider } from "./providers/SessionProvider";
import {
  BookProvider,
  useBook,
  useBookActions,
} from "./providers/BookProvider";
import { EditorProvider } from "./providers/EditorProvider";
import { useSession } from "./providers/SessionProvider";
import { showsLanding } from "./state/appPhase";

function MakeEbookRoute() {
  const landing = useSession((s) => showsLanding(s.phase));
  const hasChapters = useBook((s) => s.chapters.length > 0);
  const libraryCount = useBook((s) => s.libraryBooks.length);
  const { startWriting } = useBookActions();

  if (landing && !hasChapters) {
    return (
      <MarketingLandingPage
        onStartWritingAction={startWriting}
        libraryCount={libraryCount}
      />
    );
  }

  return <EditorShell />;
}

export default function MakeEbookPage() {
  return (
    <Suspense fallback={<BrandLoader />}>
      <SessionProvider>
        <BookProvider>
          <EditorProvider>
            <MakeEbookRoute />
          </EditorProvider>
        </BookProvider>
      </SessionProvider>
    </Suspense>
  );
}
