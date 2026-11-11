"use client";
import React from "react";
import FloatingBookMindWindow from "../components/FloatingBookMindWindow";
import InlineEditPopover from "../components/bookmind/InlineEditPopover";
import ComposePalette from "../components/bookmind/ComposePalette";
import GhostTextOverlay from "../components/bookmind/GhostTextOverlay";
import EPUBReaderModal from "../components/EPUBReaderModal";
import ConfirmDialog from "../components/ConfirmDialog";
import OnboardingTour from "../components/OnboardingTour";
import { FocusModePanel } from "../components/FocusModePanel";
import { AmbientPlayer } from "../components/AmbientPlayer";
import FindReplacePanel from "../components/FindReplacePanel";
import UpgradeModal from "../components/UpgradeModal";
import HistoryPanel from "../components/HistoryPanel";
import CmdkHint from "../components/modals/CmdkHint";
import PreflightHost from "../components/modals/PreflightHost";
import { useSession } from "../providers/SessionProvider";
import { useBook, useBookActions } from "../providers/BookProvider";
import { useEditor, useEditorActions } from "../providers/EditorProvider";
import { shallowEqual } from "../providers/store";

export function HistoryModal() {
  const historyModal = useEditor((s) => s.historyModal);
  const { versions, exportHistory, exportHistoryLoading, totalWords } =
    useEditor(
      (s) => ({
        versions: s.versions,
        exportHistory: s.exportHistory,
        exportHistoryLoading: s.exportHistoryLoading,
        totalWords: s.bookStats.totalWords,
      }),
      shallowEqual,
    );
  const actions = useEditorActions();
  if (!historyModal) return null;
  return (
    <HistoryPanel
      initialTab={historyModal}
      onClose={() => actions.setHistoryModal(null)}
      versions={versions}
      currentWordCount={totalWords}
      onRestoreVersion={actions.handleRestoreVersion}
      onDeleteVersion={actions.deleteVersion}
      onClearAllVersions={actions.clearVersions}
      exports={exportHistory}
      exportsLoading={exportHistoryLoading}
      onPreviewExport={actions.handlePreviewExport}
      onDownloadExport={actions.handleDownloadExport}
      onDeleteExport={actions.deleteExport}
      onClearAllExports={actions.clearExports}
    />
  );
}

function useBookMindWindowProps() {
  const { userId, isPro, tierKnown } = useSession(
    (s) => ({ userId: s.user?.id, isPro: s.isPro, tierKnown: s.tierKnown }),
    shallowEqual,
  );
  const { chapters, selectedChapter, bookId, title } = useBook(
    (s) => ({
      chapters: s.chapters,
      selectedChapter: s.selectedChapter,
      bookId: s.currentBookId,
      title: s.title,
    }),
    shallowEqual,
  );
  const { selectedText, mind } = useEditor(
    (s) => ({ selectedText: s.selectedEditorText, mind: s.bookMind }),
    shallowEqual,
  );
  return {
    chapters,
    selectedChapter,
    bookId,
    userId,
    title,
    selectedText,
    mind,
    isPro,
    tierKnown,
  };
}

export function MobileBookMindSheet() {
  const props = useBookMindWindowProps();
  const open = useEditor((s) => s.mobileBookMindOpen);
  const actions = useEditorActions();
  const { setSelectedChapter } = useBookActions();
  return (
    <FloatingBookMindWindow
      variant="sheet"
      isOpen={open}
      onClose={() => actions.setMobileBookMindOpen(false)}
      chapters={props.chapters}
      selectedChapter={props.selectedChapter}
      onChapterSelect={(idx) => {
        setSelectedChapter(idx);
        actions.setMobileBookMindOpen(false);
      }}
      bookId={props.bookId}
      userId={props.userId}
      title={props.title}
      selectedText={props.selectedText}
      onPreflight={() => {
        actions.setMobileBookMindOpen(false);
        actions.setPreflightFormat("epub");
      }}
      mind={props.mind}
      isPro={props.isPro}
      tierKnown={props.tierKnown}
      onUpgrade={() => actions.setExportUpgradeOpen(true)}
    />
  );
}

function DesktopBookMindWindow() {
  const props = useBookMindWindowProps();
  const open = useEditor((s) => s.bookMindOpen);
  const actions = useEditorActions();
  const { setSelectedChapter } = useBookActions();
  return (
    <FloatingBookMindWindow
      isOpen={open}
      onClose={() => actions.setBookMindOpen(false)}
      chapters={props.chapters}
      selectedChapter={props.selectedChapter}
      onChapterSelect={setSelectedChapter}
      bookId={props.bookId}
      userId={props.userId}
      title={props.title}
      selectedText={props.selectedText}
      onPreflight={() => actions.setPreflightFormat("epub")}
      mind={props.mind}
      isPro={props.isPro}
      tierKnown={props.tierKnown}
      onUpgrade={() => actions.setExportUpgradeOpen(true)}
      onExpandedChange={actions.setBookMindDocked}
      onBusyChange={actions.setBookMindBusy}
    />
  );
}

function BookMindTools() {
  const userId = useSession((s) => s.user?.id);
  const { bookId, hasChapters } = useBook(
    (s) => ({ bookId: s.currentBookId, hasChapters: s.chapters.length > 0 }),
    shallowEqual,
  );
  const { inlineEditRequest, composeRequest, flowMode } = useEditor(
    (s) => ({
      inlineEditRequest: s.inlineEditRequest,
      composeRequest: s.composeRequest,
      flowMode: s.flowMode,
    }),
    shallowEqual,
  );
  const actions = useEditorActions();
  return (
    <>
      <InlineEditPopover
        request={inlineEditRequest}
        onClose={actions.handleInlineEditClose}
        onAccept={actions.handleInlineEditAccept}
        bookId={bookId}
        userId={userId}
      />
      <ComposePalette
        request={composeRequest}
        onClose={actions.handleComposeClose}
        onInsert={actions.handleComposeInsert}
        bookId={bookId}
        userId={userId}
      />

      <GhostTextOverlay
        enabled={flowMode && hasChapters}
        bookId={bookId}
        userId={userId}
        onAccept={actions.handleGhostAccept}
      />

      <CmdkHint />
    </>
  );
}

function FocusOverlays() {
  const focus = useEditor((s) => s.focus);
  const actions = useEditorActions();
  return (
    <>
      {focus.active && (
        <FocusModePanel
          settings={focus.settings}
          onChangeSetting={actions.setFocusSetting}
          onExit={actions.exitFocusMode}
        />
      )}

      <AmbientPlayer
        sound={focus.settings.ambientSound}
        volume={focus.settings.ambientVolume}
        active={focus.active && focus.settings.ambientSound !== "none"}
      />
    </>
  );
}

function FindReplaceHost() {
  const findReplace = useEditor((s) => s.findReplace);
  return (
    <FindReplacePanel
      isOpen={findReplace.isOpen}
      onClose={findReplace.close}
      searchTerm={findReplace.searchTerm}
      onSearchChange={findReplace.setSearchTerm}
      replaceTerm={findReplace.replaceTerm}
      onReplaceChange={findReplace.setReplaceTerm}
      caseSensitive={findReplace.caseSensitive}
      onCaseSensitiveChange={findReplace.setCaseSensitive}
      matches={findReplace.matches}
      totalMatches={findReplace.totalMatches}
      onReplaceInChapter={findReplace.replaceInChapter}
      onReplaceAll={findReplace.replaceAll}
      onGoToMatch={findReplace.goToMatch}
    />
  );
}

export function EditorOverlays() {
  const hasUser = useSession((s) => !!s.user);
  const hasBookMind = useSession((s) => s.hasBookMind);
  const title = useBook((s) => s.title);
  const { showEPUBReader, epubBlob, dialogState, onboarding, upgradeOpen } =
    useEditor(
      (s) => ({
        showEPUBReader: s.showEPUBReader,
        epubBlob: s.epubBlob,
        dialogState: s.dialogState,
        onboarding: s.onboarding,
        upgradeOpen: s.exportUpgradeOpen,
      }),
      shallowEqual,
    );
  const actions = useEditorActions();

  return (
    <>
      {hasUser && <DesktopBookMindWindow />}

      {hasBookMind && <BookMindTools />}

      <EPUBReaderModal
        isOpen={showEPUBReader}
        onClose={() => actions.setShowEPUBReader(false)}
        epubBlob={epubBlob}
        bookTitle={title}
      />

      <ConfirmDialog
        open={dialogState.open}
        title={dialogState.title}
        message={dialogState.message}
        variant={dialogState.variant}
        confirmLabel={dialogState.confirmLabel}
        onConfirm={dialogState.onConfirm}
        onCancel={() =>
          actions.setDialogState((prev) => ({ ...prev, open: false }))
        }
      />

      <OnboardingTour
        isTourActive={onboarding.isTourActive}
        currentStep={onboarding.currentStep}
        totalSteps={onboarding.totalSteps}
        stepData={onboarding.currentStepData}
        onNext={onboarding.nextStep}
        onPrev={onboarding.prevStep}
        onSkip={onboarding.skipTour}
      />

      <FocusOverlays />

      <FindReplaceHost />

      <PreflightHost />

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => actions.setExportUpgradeOpen(false)}
        feature="Amazon KDP pre-flight"
      />
    </>
  );
}
