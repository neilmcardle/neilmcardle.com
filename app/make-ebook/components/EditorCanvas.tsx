'use client';

// Desktop editor canvas: chapter title header, undo/redo rail, RichTextEditor,
// and the word-stats footer. Everything between EditorHeader above and
// EditorRightPanel to the side. Extracted from page.tsx so the main writing
// surface can iterate without re-rendering the entire monolith on every
// keystroke.

import React from 'react';
import Image from 'next/image';
import { LockIcon } from './icons';
import RichTextEditor from './RichTextEditor';
import type { FocusModeSettings } from '../hooks/useFocusMode';

interface Chapter {
  id: string;
  type: 'frontmatter' | 'content' | 'backmatter';
  title: string;
  content: string;
  locked?: boolean;
}

interface ChapterStats {
  wordCount: number;
}

interface BookStats {
  totalWords: number;
  chapterStats?: ChapterStats[];
}

interface SessionStats {
  wordsThisSession: number;
}

interface FocusState {
  active: boolean;
  settings: FocusModeSettings;
}

interface EditorCanvasProps {
  chapters: Chapter[];
  selectedChapter: number;
  onChapterTitleChange: (index: number, title: string) => void;
  onChapterContentChange: (index: number, html: string) => void;

  onCreateEndnote: (chapterId: string) => void;
  endnotesCount: number;

  bookStats: BookStats;
  sessionStats: SessionStats;
  todayWords: number;

  focus: FocusState;

  // Book Mind inline edit (⌘K). Threaded from page.tsx through this
  // canvas into RichTextEditor. When the user presses ⌘K with a
  // non-empty selection the handler fires with the selected text, the
  // Range (for later replacement), and the bounding rect (for anchoring
  // the popover). Optional — if not provided, ⌘K is a no-op.
  onInlineEditRequest?: (args: {
    selectedText: string;
    range: Range;
    rect: DOMRect;
  }) => void;
  onComposeRequest?: (args: {
    range: Range;
    rect: DOMRect;
  }) => void;
}

// Run the document.execCommand-based undo/redo on the active contentEditable.
// Lives as a module-scope helper so the JSX stays readable and both buttons
// share one implementation.
function runEditorCommand(command: 'undo' | 'redo') {
  const el = document.querySelector('[contenteditable="true"]') as HTMLElement | null;
  if (!el) return;
  el.focus();
  document.execCommand(command);
}

export default function EditorCanvas({
  chapters,
  selectedChapter,
  onChapterTitleChange,
  onChapterContentChange,
  onCreateEndnote,
  endnotesCount,
  bookStats,
  sessionStats,
  todayWords,
  focus,
  onInlineEditRequest,
  onComposeRequest,
}: EditorCanvasProps) {
  const chapter = chapters[selectedChapter];
  const sectionLabel =
    chapter?.type === 'frontmatter' ? 'Front Matter'
    : chapter?.type === 'backmatter' ? 'Back Matter'
    : 'Chapter';

  const chapterWordCount = bookStats.chapterStats?.[selectedChapter]?.wordCount ?? 0;

  return (
    <>
      {/* Chapter title */}
      <div className="flex-shrink-0 px-6 pt-5 pb-3 bg-white dark:bg-[#1e1e1e] dark:border-b dark:border-[#2f2f2f]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-white/30 mb-2 select-none">
          {sectionLabel}
        </div>
        <input
          className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none min-w-0 text-gray-900 dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-white/20"
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            padding: 0,
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '1.375rem',
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}
          placeholder="Chapter title..."
          value={chapter?.title ?? ''}
          onChange={(e) => onChapterTitleChange(selectedChapter, e.target.value)}
        />
      </div>

      {/* Rich text editor + undo/redo rail + word stats footer */}
      <div
        data-tour="editor"
        className={[
          'w-full flex-1 min-h-0 flex flex-col transition-all duration-300',
          focus.active && focus.settings.columnWidth === 'narrow' ? 'focus-col-narrow' : '',
          focus.active && focus.settings.columnWidth === 'normal' ? 'focus-col-normal' : '',
          focus.active && focus.settings.paragraphFocus ? 'paragraph-focus' : '',
          focus.active && focus.settings.typewriterMode ? 'typewriter-mode' : '',
        ].filter(Boolean).join(' ')}
      >
        {/* Undo/redo rail */}
        <div className="mt-2 mb-3 flex-shrink-0 flex items-start justify-between px-6">
          <div className="flex items-start gap-2">
            <UndoRedoButton label="Undo" iconSrc="/undo-icon.svg" onClick={() => runEditorCommand('undo')} />
            <UndoRedoButton label="Redo" iconSrc="/redo-icon.svg" onClick={() => runEditorCommand('redo')} />
          </div>
        </div>

        {/* Editor + locked banner */}
        <div className="flex-1 min-h-0">
          {chapter?.locked && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#262626] border-b border-gray-200 dark:border-[#2f2f2f] text-xs text-gray-500 dark:text-gray-400">
              <LockIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>This chapter is locked. Click the lock icon in the chapter list to edit.</span>
            </div>
          )}
          <RichTextEditor
            value={chapter?.content || ''}
            onChange={(html) => onChapterContentChange(selectedChapter, html)}
            minHeight={400}
            placeholder={selectedChapter === 0 ? 'Write your first chapter here...' : 'Now add some content to your chapter...'}
            className="h-full text-lg placeholder:text-[#a0a0a0] placeholder:text-lg"
            onCreateEndnote={onCreateEndnote}
            chapterId={chapter?.id}
            hasEndnotes={endnotesCount > 0}
            disabled={!!chapter?.locked}
            hideToolbar={focus.active && focus.settings.hideToolbar}
            onInlineEditRequest={onInlineEditRequest}
            onComposeRequest={onComposeRequest}
          />
        </div>

        {/* Word stats footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-2 border-t border-gray-100 dark:border-gray-800/50">
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="text-gray-300 dark:text-gray-600">Chapter:</span>
              <span>{chapterWordCount.toLocaleString()} words</span>
            </span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span className="flex items-center gap-1.5">
              <span className="text-gray-300 dark:text-gray-600">Book:</span>
              <span>{bookStats.totalWords.toLocaleString()} words</span>
            </span>
            {sessionStats.wordsThisSession > 0 && (
              <>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <span className="text-green-500/70 dark:text-green-500/50">
                  +{sessionStats.wordsThisSession.toLocaleString()} this session
                </span>
              </>
            )}
          </div>
          {/* Quiet "words today" nudge. No streak, no flame, no grind. */}
          {todayWords > 0 && (
            <span className="text-xs text-gray-500 dark:text-[#888] tabular-nums">
              {todayWords.toLocaleString()} words today
            </span>
          )}
        </div>
      </div>
    </>
  );
}

function UndoRedoButton({ label, iconSrc, onClick }: { label: string; iconSrc: string; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center">
      <button title={`${label} content changes`} type="button" className="hover:opacity-70 transition-opacity" onClick={onClick}>
        <div className="bg-white dark:bg-[#262626] rounded-full p-2">
          <Image
            src={iconSrc}
            alt={label}
            width={16}
            height={16}
            className="w-4 h-4 dark:invert"
            style={{ borderRadius: '0', boxShadow: 'none' }}
          />
        </div>
      </button>
      <span className="text-xs font-medium text-[#050505] dark:text-[#e5e5e5] mt-1">{label}</span>
    </div>
  );
}
