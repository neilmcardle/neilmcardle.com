"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  activeEditor,
  subscribeSelection,
  type EditorHandle,
  type EditorSelection,
} from "../../editor/registry";
import { domRangeAt } from "../../editor/dom";
import type { InlineEditRequest } from "../../components/bookmind/InlineEditPopover";
import type { ComposePaletteRequest } from "../../components/bookmind/ComposePalette";

type TrackedTarget = { current: { editor: EditorHandle; id: string } | null };

function trackRequest(target: TrackedTarget, range: Range, collapse: boolean) {
  if (target.current) target.current.editor.untrack(target.current.id);
  target.current = null;
  const editor = activeEditor();
  const pos = editor?.positionsOf(range);
  if (!editor || !pos) return;
  target.current = {
    editor,
    id: editor.track(pos.from, collapse ? pos.from : pos.to),
  };
}

interface Params {
  hasBookMind: boolean;
  selectedChapter: number;
  handleChapterContentChange: (index: number, content: string) => void;
}

export function useWritingAssist({
  hasBookMind,
  selectedChapter,
  handleChapterContentChange,
}: Params) {
  const [selectedEditorText, setSelectedEditorText] = useState<
    string | undefined
  >(undefined);
  const [cmdkHintRect, setCmdkHintRect] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const cmdkHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleSelection = (selection: EditorSelection | null) => {
      if (!selection || selection.text.length <= 10) {
        setCmdkHintRect(null);
        return;
      }
      setSelectedEditorText(selection.text);
      const view = selection.handle.view();
      const range = view
        ? domRangeAt(view, selection.from, selection.to)
        : null;
      if (!range) return;
      const rect = range.getBoundingClientRect();
      setCmdkHintRect({ top: rect.bottom + 6, left: rect.left });
      if (cmdkHintTimer.current) clearTimeout(cmdkHintTimer.current);
      cmdkHintTimer.current = setTimeout(() => setCmdkHintRect(null), 3000);
    };
    const unsubscribe = subscribeSelection(handleSelection);
    return () => {
      unsubscribe();
      if (cmdkHintTimer.current) clearTimeout(cmdkHintTimer.current);
    };
  }, []);

  const [inlineEditRequest, setInlineEditRequest] = useState<InlineEditRequest>(
    {
      open: false,
      anchorRect: null,
      selectedText: "",
      range: null,
    },
  );

  const handleGhostAccept = useCallback((text: string) => {
    const editor = activeEditor();
    if (!editor) return;
    editor.focus();
    editor.insertAtGhost(text);
  }, []);

  const composeTargetRef = useRef<{ editor: EditorHandle; id: string } | null>(
    null,
  );
  const inlineTargetRef = useRef<{ editor: EditorHandle; id: string } | null>(
    null,
  );

  const [composeRequest, setComposeRequest] = useState<ComposePaletteRequest>({
    open: false,
    anchorRect: null,
    range: null,
  });

  const handleComposeRequest = useCallback(
    (args: { range: Range; rect: DOMRect }) => {
      if (!hasBookMind) return;
      trackRequest(composeTargetRef, args.range, true);
      setComposeRequest({
        open: true,
        anchorRect: args.rect,
        range: args.range,
      });
    },
    [hasBookMind],
  );

  const handleComposeClose = useCallback(() => {
    setComposeRequest((prev) => ({ ...prev, open: false }));
  }, []);

  const handleComposeInsert = useCallback((text: string) => {
    const target = composeTargetRef.current;
    composeTargetRef.current = null;
    const editor = target?.editor.view() ? target.editor : activeEditor();
    if (!editor) return;
    const at = target ? (editor.tracked(target.id)?.from ?? null) : null;
    if (target) editor.untrack(target.id);
    editor.focus();
    editor.insertCompose(text, at);
  }, []);

  const handleInlineEditRequest = useCallback(
    (args: {
      selectedText: string;
      range: Range;
      rect: DOMRect;
      instruction?: string;
    }) => {
      if (!hasBookMind) return;
      trackRequest(inlineTargetRef, args.range, false);
      setInlineEditRequest({
        open: true,
        anchorRect: args.rect,
        selectedText: args.selectedText,
        range: args.range,
        initialInstruction: args.instruction,
      });
    },
    [hasBookMind],
  );

  const handleInlineEditClose = useCallback(() => {
    setInlineEditRequest((prev) => ({ ...prev, open: false }));
  }, []);

  const handleInlineEditAccept = useCallback(
    (newText: string) => {
      const target = inlineTargetRef.current;
      inlineTargetRef.current = null;
      if (!target || !target.editor.view()) return;
      const { editor, id } = target;
      const range = editor.tracked(id);
      editor.untrack(id);
      if (!range) return;

      const chapterIdx = selectedChapter;
      const preEditContent = editor.getHTML();
      editor.focus();
      editor.replaceRange(range.from, range.to, newText, { highlight: true });
      const applied = editor.docVersion();

      toast.success("Edit applied", {
        description: "The rewrite is highlighted in the text.",
        action: {
          label: "Undo",
          onClick: () => {
            if (editor.view() && editor.docVersion() === applied) {
              editor.undo();
              editor.flush();
            } else if (editor.view()) {
              editor.setHTML(preEditContent, { undoable: true });
            } else {
              handleChapterContentChange(chapterIdx, preEditContent);
            }
            toast("Edit undone");
          },
        },
      });
    },
    [selectedChapter, handleChapterContentChange],
  );

  return {
    state: {
      selectedEditorText,
      cmdkHintRect,
      inlineEditRequest,
      composeRequest,
    },
    actions: {
      handleGhostAccept,
      handleComposeRequest,
      handleComposeClose,
      handleComposeInsert,
      handleInlineEditRequest,
      handleInlineEditClose,
      handleInlineEditAccept,
    },
  };
}
