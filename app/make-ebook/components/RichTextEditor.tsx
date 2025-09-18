'use client';

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  HTMLAttributes,
  MouseEvent,
  ChangeEvent,
  KeyboardEvent,
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

const ALIGN = [
  { cmd: 'justifyLeft', label: 'L', title: 'Align Left' },
  { cmd: 'justifyCenter', label: 'C', title: 'Align Center' },
  { cmd: 'justifyRight', label: 'R', title: 'Align Right' },
  { cmd: 'justifyFull', label: 'J', title: 'Justify' },
];

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);
  const [formats, setFormats] = useState<FormatState>({});
  const lastExternalValueRef = useRef<string>(value);

  useLayoutEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || '';
      lastExternalValueRef.current = value;
      ensureInitialParagraph();
    }
  }, []);

  useEffect(() => {
    if (focused) return;
    if (value !== lastExternalValueRef.current && editorRef.current) {
      editorRef.current.innerHTML = value || '';
      lastExternalValueRef.current = value;
      ensureInitialParagraph();
    }
  }, [value, focused]);

  useEffect(() => {
    if (externalVersion !== undefined && editorRef.current && !focused) {
      editorRef.current.innerHTML = value || '';
      lastExternalValueRef.current = value;
      ensureInitialParagraph();
    }
  }, [externalVersion, value, focused]);

  const ensureInitialParagraph = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML.replace(/\s|&nbsp;|<br>/gi, '');
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
    }
  };

  const applyInlineOrAlign = (cmd: string) => {
    if (disabled) return;
    focusEditor();
    document.execCommand(cmd);
    emitChange();
    refreshStates();
  };

  const refreshStates = useCallback(() => {
    const s: FormatState = {};
    try {
      s.bold = document.queryCommandState('bold');
      s.italic = document.queryCommandState('italic');
      s.underline = document.queryCommandState('underline');
      s.strikeThrough = document.queryCommandState('strikeThrough');
      s.justifyLeft = document.queryCommandState('justifyLeft');
      s.justifyCenter = document.queryCommandState('justifyCenter');
      s.justifyRight = document.queryCommandState('justifyRight');
      s.justifyFull = document.queryCommandState('justifyFull');
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
    ensureInitialParagraph();
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (
        editorRef.current &&
        document.activeElement !== editorRef.current
      ) {
        ensureInitialParagraph();
        emitChange();
        setFocused(false);
        onFocusStateChange?.(false);
      }
    }, 60);
  };

  const toolbarMouseDown = (e: MouseEvent) => {
    e.preventDefault();
  };

  // Image insertion handlers
  const handleImageButtonClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      insertImageFile(file);
    }
    // reset value so same image can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const insertImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result;
      if (typeof src === 'string') {
        insertImageAtCaret(src);
      }
    };
    reader.readAsDataURL(file);
  };

  const insertImageAtCaret = (src: string) => {
    focusEditor();
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection) return;

    // Insert image at caret
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Image';
    img.style.maxWidth = '100%';
    img.style.display = 'block';
    img.style.margin = '1em 0';

    // Insert image node at caret
    const range = selection.getRangeAt(0);
    range.collapse(false);
    range.insertNode(img);

    // Move caret after the image
    range.setStartAfter(img);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    emitChange();
  };

  // Drag-and-drop support
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.type.startsWith('image/')
    );
    if (files.length > 0) {
      files.forEach(insertImageFile);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) insertImageFile(file);
      }
    }
  };

  // Metrics
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

  // --- Placeholder logic: show absolutely positioned placeholder when empty ---
  const showPlaceholder =
    (!focused && (value === '' || value === '<p><br></p>' || value === '<p></p>' || value === '<br>' || value === '<br/>'));

  return (
    <div
      className={`relative border border-[#ececec] rounded-lg bg-[#fafbfc] focus-within:bg-white transition-colors flex flex-col md:flex-row editor-root ${className}`}
      {...rest}
    >
      {/* Mobile Toolbar - Above content when focused */}
      {focused && (
        <div className="md:hidden border-b border-[#ececec] bg-white">
          <div className="p-2 overflow-x-auto">
            <div className="flex items-start gap-4 min-w-max">
              {/* Format section */}
              <div className="flex flex-col gap-1">
                <div className="text-[9px] font-semibold tracking-wide uppercase text-[#86868B] select-none px-1">Format</div>
                <div className="flex gap-1">
                  {INLINE.map(b => (
                    <button
                      key={b.cmd}
                      onMouseDown={e => e.preventDefault()}
                      title={b.title}
                      type="button"
                      className={`w-8 h-8 rounded-md border text-xs font-bold transition-colors touch-manipulation ${
                        formats[b.cmd] 
                          ? 'bg-[#181a1d] text-white border-[#181a1d]' 
                          : 'bg-white text-[#6a6c72] border-[#ececec] hover:bg-[#f4f4f5]'
                      } ${b.className || ''}`}
                      onClick={() => applyInlineOrAlign(b.cmd)}
                      disabled={disabled}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Align section */}
              <div className="flex flex-col gap-1">
                <div className="text-[9px] font-semibold tracking-wide uppercase text-[#86868B] select-none px-1">Align</div>
                <div className="flex gap-1">
                  {ALIGN.slice(0, 3).map(a => (
                    <button
                      key={a.cmd}
                      onMouseDown={e => e.preventDefault()}
                      title={a.title}
                      type="button"
                      className={`w-8 h-8 rounded-md border text-xs font-bold transition-colors touch-manipulation ${
                        formats[a.cmd] 
                          ? 'bg-[#181a1d] text-white border-[#181a1d]' 
                          : 'bg-white text-[#6a6c72] border-[#ececec] hover:bg-[#f4f4f5]'
                      }`}
                      onClick={() => applyInlineOrAlign(a.cmd)}
                      disabled={disabled}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tools section */}
              <div className="flex flex-col gap-1">
                <div className="text-[9px] font-semibold tracking-wide uppercase text-[#86868B] select-none px-1">Tools</div>
                <div className="flex gap-1">
                  <button
                    onMouseDown={e => e.preventDefault()}
                    title="Insert Image"
                    type="button"
                    className="w-8 h-8 rounded-md border bg-white text-[#6a6c72] border-[#ececec] hover:bg-[#f4f4f5] text-[10px] font-medium transition-colors touch-manipulation"
                    onClick={handleImageButtonClick}
                    disabled={disabled}
                  >
                    IMG
                  </button>
                  <button
                    onMouseDown={e => e.preventDefault()}
                    title="Clear formatting"
                    type="button"
                    className="w-8 h-8 rounded-md border bg-white text-[#6a6c72] border-[#ececec] hover:bg-[#f4f4f5] text-[10px] font-medium transition-colors touch-manipulation"
                    onClick={() => {
                      focusEditor();
                      document.execCommand('removeFormat');
                      emitChange();
                      refreshStates();
                    }}
                    disabled={disabled}
                  >
                    CLR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Editable area */}
      <div className="flex-1 min-w-0 relative">
        {showPlaceholder && (
          <div
            className="absolute left-4 top-4 text-[#b0b3b8] pointer-events-none select-none z-10"
            style={{ fontSize: 16 }}
          >
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          className="p-4 text-base leading-6 focus:outline-none whitespace-pre-wrap break-words"
          style={{ minHeight }}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-disabled={disabled}
          spellCheck
          onDrop={handleDrop}
          onPaste={handlePaste}
        />
        <style jsx>{`
          .editor-root p {
            margin: 0.5rem 0;
          }
          .editor-root pre {
            background: #f2f3f5;
            padding: 0.75rem 0.9rem;
            border-radius: 6px;
            font-size: 0.85rem;
            line-height: 1.4;
            overflow-x: auto;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
              'Liberation Mono', 'Courier New', monospace;
            white-space: pre;
            margin: 0.8rem 0;
          }
          .editor-root img {
            max-width: 100%;
            display: block;
            margin: 1em 0;
            border-radius: 6px;
            box-shadow: 0 1px 4px 0 rgba(0,0,0,0.07);
          }
        `}</style>
        {showWordCount && (
          <div className="px-4 pb-2 text-[11px] text-[#86868B] flex justify-end select-none">
            Words: {wordCount} | Characters: {charCount}
          </div>
        )}
        {/* Hidden image file picker */}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileInputChange}
          tabIndex={-1}
        />
      </div>

      {/* Desktop Toolbar */}
      <div
        onMouseDown={toolbarMouseDown}
        className={`hidden md:flex w-32 border-l bg-[#f4f4f5] flex-col gap-4 p-2 overflow-y-auto ${
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
                onClick={() => applyInlineOrAlign(b.cmd)}
                disabled={disabled}
              >
                {b.label}
              </button>
            ))}
          </div>
        </Section>

        <Section label="Align">
          <div className="grid grid-cols-4 gap-1">
            {ALIGN.map(a => (
              <button
                key={a.cmd}
                onMouseDown={e => e.preventDefault()}
                title={a.title}
                type="button"
                className={`${BTN} ${formats[a.cmd] ? BTN_ACTIVE : ''}`}
                onClick={() => applyInlineOrAlign(a.cmd)}
                disabled={disabled}
              >
                {a.label}
              </button>
            ))}
          </div>
        </Section>

        <Section label="Insert">
          <button
            onMouseDown={e => e.preventDefault()}
            title="Insert Image"
            type="button"
            className={BTN}
            onClick={handleImageButtonClick}
            disabled={disabled}
          >
            Image
          </button>
        </Section>

        <Section label="Misc">
          <button
            onMouseDown={e => e.preventDefault()}
            title="Remove formatting"
            type="button"
            className={BTN}
            onClick={() => {
              focusEditor();
              document.execCommand('removeFormat');
              emitChange();
              refreshStates();
            }}
            disabled={disabled}
          >
            Clear
          </button>
        </Section>
      </div>
      
    </div>
  ); 
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-semibold tracking-wide uppercase text-[#86868B] select-none">
        {label}
      </div>
      {children}
    </div>
  );
}