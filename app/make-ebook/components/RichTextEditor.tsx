'use client';

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  MouseEvent,
  HTMLAttributes,
  useLayoutEffect,
} from 'react';

interface RichTextEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: number;
  showWordCount?: boolean;
  onFocusStateChange?: (focused: boolean) => void;
  className?: string;
  externalVersion?: number;
}

type FormatState = Record<string, boolean>;

const BTN =
  'w-full px-2 py-1 text-[11px] font-medium rounded border border-gray-300 bg-white hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed';
const BTN_ACTIVE = 'bg-gray-200 shadow-inner';

const INLINE = [
  { cmd: 'bold', label: 'B', title: 'Bold' },
  { cmd: 'italic', label: 'I', title: 'Italic', className: 'italic' },
  { cmd: 'underline', label: 'U', title: 'Underline', className: 'underline' },
  { cmd: 'strikeThrough', label: 'S', title: 'Strikethrough', className: 'line-through' },
];

const BLOCKS = [
  { block: 'p', label: 'P', title: 'Paragraph' },
  { block: 'h1', label: 'H1', title: 'Heading 1' },
  { block: 'h2', label: 'H2', title: 'Heading 2' },
  { block: 'h3', label: 'H3', title: 'Heading 3' },
  { block: 'pre', label: '</>', title: 'Code Block' },
];

const LISTS = [
  { cmd: 'insertUnorderedList', label: '•', title: 'Bullet List' },
  { cmd: 'insertOrderedList', label: '1.', title: 'Numbered List' },
];

const ALIGN = [
  { cmd: 'justifyLeft', label: 'L', title: 'Align Left' },
  { cmd: 'justifyCenter', label: 'C', title: 'Align Center' },
  { cmd: 'justifyRight', label: 'R', title: 'Align Right' },
  { cmd: 'justifyFull', label: 'J', title: 'Justify' },
];

// execCommand requires angle bracket versions for formatBlock on some browsers
const FORMAT_BLOCK_VALUE: Record<string, string> = {
  p: '<p>',
  h1: '<h1>',
  h2: '<h2>',
  h3: '<h3>',
  pre: '<pre>',
};

export default function RichTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder = 'Start writing...',
  minHeight = 300,
  showWordCount = false,
  onFocusStateChange,
  className = '',
  externalVersion,
  ...rest
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [focused, setFocused] = useState(false);
  const [formats, setFormats] = useState<FormatState>({});
  const lastExternalValueRef = useRef<string>(value);

  // Initial mount populate
  useLayoutEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || '';
      lastExternalValueRef.current = value;
      if (!value) ensureInitialParagraph();
    }
  }, []);

  // Sync external changes when not focused
  useEffect(() => {
    if (focused) return;
    if (value !== lastExternalValueRef.current && editorRef.current) {
      editorRef.current.innerHTML = value || '';
      lastExternalValueRef.current = value;
      if (!value) ensureInitialParagraph();
    }
  }, [value, focused]);

  // Force reset if externalVersion bump
  useEffect(() => {
    if (externalVersion !== undefined && editorRef.current && !focused) {
      editorRef.current.innerHTML = value || '';
      lastExternalValueRef.current = value;
      if (!value) ensureInitialParagraph();
    }
  }, [externalVersion, value, focused]);

  const ensureInitialParagraph = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML.replace(/\s+/g, '');
    if (!html) {
      editorRef.current.innerHTML = '<p><br></p>';
    }
  };

  const emitChange = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastExternalValueRef.current = html;
    onChange(html);
  }, [onChange]);

  const focusEditor = () => {
    if (!editorRef.current) return;
    if (document.activeElement !== editorRef.current) {
      editorRef.current.focus();
      // Move selection to end if empty
      const sel = window.getSelection();
      if (sel && sel.rangeCount === 0) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  const apply = useCallback(
    (command: string, arg?: string) => {
      if (disabled) return;
      focusEditor();
      const success = document.execCommand(command, false, arg);
      if (!success && command === 'formatBlock' && arg) {
        // Fallback manual block change
        manualSetBlock(arg.replace(/[<>]/g, ''));
      }
      emitChange();
      refreshStates();
    },
    [disabled, emitChange]
  );

  const manualSetBlock = (tag: string) => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    let node: Node | null = range.startContainer;
    // Find current block container
    while (
      node &&
      node !== editorRef.current &&
      !(node instanceof HTMLElement && /^(P|H1|H2|H3|PRE|DIV)$/.test(node.tagName))
    ) {
      node = node.parentNode;
    }
    if (node && node !== editorRef.current && node instanceof HTMLElement) {
      if (node.tagName.toLowerCase() === tag) return;
      const newEl = document.createElement(tag);
      if (tag === 'pre') {
        newEl.textContent = node.textContent || '';
      } else {
        newEl.innerHTML = node.innerHTML;
      }
      node.replaceWith(newEl);
      // Reselect
      const newRange = document.createRange();
      newRange.selectNodeContents(newEl);
      newRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } else if (!node || node === editorRef.current) {
      // Wrap selection contents
      const wrapper = document.createElement(tag);
      wrapper.appendChild(range.extractContents());
      range.insertNode(wrapper);
      const newRange = document.createRange();
      newRange.selectNodeContents(wrapper);
      newRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
  };

  const applyBlock = (block: string) => {
    const arg = FORMAT_BLOCK_VALUE[block] || `<${block}>`;
    apply('formatBlock', arg);
  };

  const refreshStates = useCallback(() => {
    const s: FormatState = {};
    try {
      s.bold = document.queryCommandState('bold');
      s.italic = document.queryCommandState('italic');
      s.underline = document.queryCommandState('underline');
      s.strikeThrough = document.queryCommandState('strikeThrough');
      s.insertOrderedList = document.queryCommandState('insertOrderedList');
      s.insertUnorderedList = document.queryCommandState('insertUnorderedList');
      s.justifyLeft = document.queryCommandState('justifyLeft');
      s.justifyCenter = document.queryCommandState('justifyCenter');
      s.justifyRight = document.queryCommandState('justifyRight');
      s.justifyFull = document.queryCommandState('justifyFull');
      // Manual block detection for reliability
      const sel = window.getSelection();
      let blockTag = '';
      if (sel && sel.rangeCount > 0) {
        let node: Node | null = sel.getRangeAt(0).startContainer;
        while (node && node !== editorRef.current) {
          if (
            node instanceof HTMLElement &&
            /^(P|H1|H2|H3|PRE)$/.test(node.tagName)
          ) {
            blockTag = node.tagName.toLowerCase();
            break;
          }
          node = node.parentNode;
        }
      }
      s.block_p = blockTag === 'p' || blockTag === '';
      s.block_h1 = blockTag === 'h1';
      s.block_h2 = blockTag === 'h2';
      s.block_h3 = blockTag === 'h3';
      s.block_pre = blockTag === 'pre';
    } catch {
      // ignore
    }
    setFormats(s);
  }, []);

  useEffect(() => {
    const listener = () => {
      if (focused) refreshStates();
    };
    document.addEventListener('selectionchange', listener);
    return () => document.removeEventListener('selectionchange', listener);
  }, [focused, refreshStates]);

  const handleInput = () => {
    emitChange();
  };

  const handleFocus = () => {
    setFocused(true);
    onFocusStateChange?.(true);
    refreshStates();
    if (editorRef.current && editorRef.current.innerHTML.trim() === '') {
      ensureInitialParagraph();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (
        editorRef.current &&
        document.activeElement !== editorRef.current
      ) {
        if (editorRef.current.innerHTML.replace(/<[^>]*>/g, '').trim() === '') {
          ensureInitialParagraph();
          emitChange();
        }
        setFocused(false);
        onFocusStateChange?.(false);
      }
    }, 70);
  };

  const toolbarMouseDown = (e: MouseEvent) => {
    // Keep selection
    e.preventDefault();
  };

  // Plain text metrics
  const currentHtml = editorRef.current?.innerHTML || value || '';
  const plain = currentHtml
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = plain ? plain.split(' ').length : 0;
  const charCount = plain.length;

  return (
    <div
      className={`relative border border-[#ececec] rounded-lg bg-[#fafbfc] focus-within:bg-white transition-colors flex ${className}`}
      {...rest}
    >
      {/* Editable area */}
      <div className="flex-1 min-w-0">
        <div
          ref={editorRef}
          className="p-4 text-base leading-6 focus:outline-none whitespace-pre-wrap break-word"
          style={{ minHeight }}
          contentEditable={!disabled}
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-disabled={disabled}
        />
        <style jsx>{`
          [contenteditable='true'][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #b0b3b8;
            pointer-events: none;
            display: block;
          }
          h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 1rem 0 0.6rem;
          }
          h2 {
            font-size: 1.3rem;
            font-weight: 600;
            margin: 0.9rem 0 0.5rem;
          }
          h3 {
            font-size: 1.15rem;
            font-weight: 600;
            margin: 0.8rem 0 0.5rem;
          }
          p {
            margin: 0.5rem 0;
          }
          ul,
          ol {
            margin: 0.6rem 0 0.6rem 1.4rem;
            padding-left: 1.2rem;
          }
          pre {
            background: #f2f3f5;
            padding: 0.75rem 0.9rem;
            border-radius: 6px;
            font-size: 0.85rem;
            line-height: 1.4;
            overflow-x: auto;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
              'Liberation Mono', 'Courier New', monospace;
            white-space: pre;
          }
        `}</style>
        {showWordCount && (
          <div className="px-4 pb-2 text-[11px] text-[#86868B] flex justify-end select-none">
            Words: {wordCount} | Characters: {charCount}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div
        onMouseDown={toolbarMouseDown}
        className={`w-32 border-l bg-[#f4f4f5] flex flex-col gap-4 p-2 overflow-y-auto ${
          focused ? 'opacity-100' : 'opacity-70'
        } transition`}
      >
        <Section label="Text">
          <div className="grid grid-cols-4 gap-1">
            {INLINE.map(b => (
              <button
                key={b.cmd}
                onMouseDown={e => e.preventDefault()}
                title={b.title}
                type="button"
                className={`${BTN} ${formats[b.cmd] ? BTN_ACTIVE : ''} ${b.className || ''}`}
                onClick={() => apply(b.cmd)}
                disabled={disabled}
              >
                {b.label}
              </button>
            ))}
          </div>
        </Section>

        <Section label="Block">
          <div className="grid grid-cols-3 gap-1">
            {BLOCKS.map(b => {
              const active = formats[`block_${b.block}`];
              return (
                <button
                  key={b.block}
                  onMouseDown={e => e.preventDefault()}
                  title={b.title}
                  type="button"
                  className={`${BTN} ${active ? BTN_ACTIVE : ''}`}
                  onClick={() => applyBlock(b.block)}
                  disabled={disabled}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </Section>

        <Section label="Lists">
          <div className="grid grid-cols-2 gap-1">
            {LISTS.map(b => (
              <button
                key={b.cmd}
                onMouseDown={e => e.preventDefault()}
                title={b.title}
                type="button"
                className={`${BTN} ${formats[b.cmd] ? BTN_ACTIVE : ''}`}
                onClick={() => {
                  apply(b.cmd);
                  // Slight delay to ensure state updates after browser mutates DOM
                  setTimeout(refreshStates, 30);
                }}
                disabled={disabled}
              >
                {b.label}
              </button>
            ))}
          </div>
        </Section>

        <Section label="Align">
          <div className="grid grid-cols-4 gap-1">
            {ALIGN.map(b => (
              <button
                key={b.cmd}
                onMouseDown={e => e.preventDefault()}
                title={b.title}
                type="button"
                className={`${BTN} ${formats[b.cmd] ? BTN_ACTIVE : ''}`}
                onClick={() => apply(b.cmd)}
                disabled={disabled}
              >
                {b.label}
              </button>
            ))}
          </div>
        </Section>

        <Section label="Misc">
          <button
            onMouseDown={e => e.preventDefault()}
            title="Remove formatting"
            type="button"
            className={BTN}
            onClick={() => apply('removeFormat')}
            disabled={disabled}
          >
            Clear
          </button>
        </Section>
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-semibold tracking-wide uppercase text-[#86868B] select-none">
        {label}
      </div>
      {children}
    </div>
  );
}