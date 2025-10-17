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
import Link from 'next/link';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import katex from 'katex';
import "../../../styles/vendor/katex.css";

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
  onCreateEndnote?: (selectedText: string, chapterId?: string) => string;
  chapterId?: string;
}

type FormatState = Record<string, boolean>;

const BTN =
  'w-full px-2 py-1 text-sm font-medium rounded border border-gray-300 bg-white hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed overflow-visible';
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

const HEADINGS = [
  { level: 0, label: 'P', title: 'Body Text' },
  { level: 1, label: 'H1', title: 'Heading 1' },
  { level: 2, label: 'H2', title: 'Heading 2' },
  { level: 3, label: 'H3', title: 'Heading 3' },
];

const ACTIONS = [
  { cmd: 'endnote', label: '¹', title: 'Insert Endnote' },
  { cmd: 'link', label: '🔗', title: 'Insert Link' },
];

// EPUB-safe DOMPurify configuration
const EPUB_SAFE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup',
    'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote',
    'pre', 'code', 'a', 'img', 'hr',
    // MathML tags for EPUB 3 compatibility
    'math', 'mrow', 'mi', 'mn', 'mo', 'mfrac', 'msup', 'msub',
    'msubsup', 'msqrt', 'mroot', 'mtext', 'mspace', 'mtable',
    'mtr', 'mtd', 'mover', 'munder', 'munderover', 'mfenced',
    'menclose', 'mstyle', 'mpadded', 'mphantom', 'mglyph'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id',
    // MathML attributes
    'xmlns', 'display', 'mathvariant', 'mathsize', 'mathcolor',
    'mathbackground', 'fence', 'separator', 'stretchy', 'symmetric',
    'maxsize', 'minsize', 'largeop', 'movablelimits', 'accent',
    'form', 'lspace', 'rspace'
  ],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'object', 'embed', 'iframe', 'form', 'input'],
  FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror', 'data-*'],
  KEEP_CONTENT: true,
  USE_PROFILES: { html: true }
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
  onCreateEndnote,
  chapterId,
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

  const applyHeading = (level: number) => {
    if (disabled) return;
    focusEditor();
    const tagName = level === 0 ? 'p' : `h${level}`;
    document.execCommand('formatBlock', false, tagName);
    emitChange();
    refreshStates();
  };

  const applyUndo = () => {
    if (disabled) return;
    focusEditor();
    document.execCommand('undo');
    emitChange();
    refreshStates();
  };

  const applyRedo = () => {
    if (disabled) return;
    focusEditor();
    document.execCommand('redo');
    emitChange();
    refreshStates();
  };

  const handleEndnoteClick = () => {
    if (disabled || !onCreateEndnote) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      alert('Please select some text to turn into an endnote.');
      return;
    }
    
    const selectedText = selection.toString().trim();
    if (!selectedText) {
      alert('Please select some text to turn into an endnote.');
      return;
    }
    
    // Get the range before calling the callback
    const range = selection.getRangeAt(0);
    
    // Call the callback to create endnote and get the link
    const endnoteLink = onCreateEndnote(selectedText, chapterId);
    
    if (endnoteLink && endnoteLink.trim()) {
      // Keep the selected text and add the endnote reference beside it
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = endnoteLink;
      const endnoteElement = tempDiv.firstChild;
      
      if (endnoteElement) {
        // Move cursor to end of selection and insert the reference
        range.collapse(false); // Collapse to end of selection
        range.insertNode(endnoteElement);
        
        // Clear the selection and position cursor after the inserted link
        selection.removeAllRanges();
        range.setStartAfter(endnoteElement);
        range.collapse(true);
        selection.addRange(range);
        
        // Trigger change event
        emitChange();
      }
    }
  };

  const handleLinkClick = () => {
    if (disabled) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      alert('Please select some text to turn into a link.');
      return;
    }
    
    const url = prompt('Enter the URL:');
    if (url) {
      focusEditor();
      document.execCommand('createLink', false, url);
      emitChange();
      refreshStates();
    }
  };

  // Convert LaTeX math to MathML for EPUB compatibility
  const convertMathToMathML = (latex: string, displayMode: boolean = false): string => {
    try {
      const mathmlString = katex.renderToString(latex, {
        output: 'mathml',
        displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        strict: false
      });
      return mathmlString;
    } catch (error) {
      console.warn('Error converting LaTeX to MathML:', error);
      // Fallback: wrap in a span with error styling
      return `<span style="color: #cc0000; font-style: italic;">Math Error: ${latex}</span>`;
    }
  };

  // Clean pasted content for EPUB compatibility
  const cleanPastedContent = (html: string): string => {
    try {
      // Preserve existing code blocks before any processing
      const preservedCodeBlocks = new Map<string, string>();
      let codeBlockCounter = 0;
      
      let cleaned = html;
      
      // Extract and preserve existing code blocks with HTML escaping
      // Handle <pre> blocks first (including nested <code>)
      cleaned = cleaned.replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, (match) => {
        const placeholder = `__SECURE_CODE_BLOCK_${Date.now()}_${codeBlockCounter++}__`;
        // For pre blocks, preserve structure but escape inner text content
        const safeCodeBlock = match.replace(/>([^<]*)</g, (textMatch, text) => {
          const escapedText = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
          return `>${escapedText}<`;
        });
        preservedCodeBlocks.set(placeholder, safeCodeBlock);
        return placeholder;
      });
      
      // Handle standalone <code> blocks
      cleaned = cleaned.replace(/<code[^>]*>[\s\S]*?<\/code>/gi, (match) => {
        const placeholder = `__SECURE_CODE_BLOCK_${Date.now()}_${codeBlockCounter++}__`;
        // Extract and escape the text content
        const safeCodeBlock = match.replace(/>([^<]*)</g, (textMatch, text) => {
          const escapedText = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
          return `>${escapedText}<`;
        });
        preservedCodeBlocks.set(placeholder, safeCodeBlock);
        return placeholder;
      });

      // Handle math code fences FIRST (```math...```) before general code fences
      cleaned = cleaned.replace(/```math\s*\n([\s\S]*?)\n```/gi, (match, latex) => {
        return convertMathToMathML(latex.trim(), true);
      });

      // Then detect other code fences (```...```)
      cleaned = cleaned.replace(/```(\w*)\s*\n([\s\S]*?)\n```/g, (match, language, code) => {
        const placeholder = `__SECURE_CODE_BLOCK_${Date.now()}_${codeBlockCounter++}__`;
        // HTML-escape the code content to preserve angle brackets and special chars
        const escapedCode = code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
        const codeBlock = `<pre><code${language ? ` class="language-${language}"` : ''}>${escapedCode}</code></pre>`;
        preservedCodeBlocks.set(placeholder, codeBlock);
        return placeholder;
      });

      // First pass: Remove Word-specific elements and attributes
      cleaned = cleaned
        // Remove Word namespace declarations and comments
        .replace(/<!--\[if [^>]*>[\s\S]*?<!\[endif\]-->/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi, '')
        .replace(/<\/o:p>/gi, '')
        .replace(/<o:[^>]*>/gi, '')
        // Remove mso-* CSS properties and styles
        .replace(/\s*mso-[^:]*:[^;"]*;?/gi, '')
        .replace(/\s*style\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\s*class\s*=\s*["'][^"']*["']/gi, '')
        // Convert common Word formatting to standard HTML
        .replace(/<b\b[^>]*>/gi, '<strong>')
        .replace(/<\/b>/gi, '</strong>')
        .replace(/<i\b[^>]*>/gi, '<em>')
        .replace(/<\/i>/gi, '</em>')
        .replace(/<strike\b[^>]*>/gi, '<s>')
        .replace(/<\/strike>/gi, '</s>')
        // Convert div-heavy structure to paragraphs
        .replace(/<div[^>]*>/gi, '<p>')
        .replace(/<\/div>/gi, '</p>')
        // Handle line breaks
        .replace(/<br[^>]*>\s*<br[^>]*>/gi, '</p><p>')
        .replace(/\r\n|\n|\r/g, ' ');

      // Detect and convert LaTeX math expressions
      // Block math: $$...$$
      cleaned = cleaned.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
        return convertMathToMathML(latex.trim(), true);
      });
      
      // Inline math: $...$
      cleaned = cleaned.replace(/\$([^$]+)\$/g, (match, latex) => {
        return convertMathToMathML(latex.trim(), false);
      });
      
      // Detect math code blocks: ```math...```
      cleaned = cleaned.replace(/```math\s*([\s\S]*?)```/gi, (match, latex) => {
        return convertMathToMathML(latex.trim(), true);
      });

      // Detect and wrap code blocks (indented text or monospace fonts)
      cleaned = cleaned.replace(
        /<p[^>]*>\s*(\s{4,}[^<]+|[^<]*font-family[^>]*monospace[^<]*)<\/p>/gi,
        '<pre><code>$1</code></pre>'
      );

      // Second pass: Use DOMPurify with EPUB-safe configuration
      const purified = DOMPurify.sanitize(cleaned, EPUB_SAFE_CONFIG);

      // Restore preserved code blocks with proper sanitization
      let result = purified;
      preservedCodeBlocks.forEach((codeBlock, placeholder) => {
        // Safely sanitize the code block content only
        const sanitizedCodeBlock = DOMPurify.sanitize(codeBlock, {
          ALLOWED_TAGS: ['pre', 'code'],
          ALLOWED_ATTR: ['class'], // Only allow class attribute for language highlighting
          KEEP_CONTENT: true,
          RETURN_DOM: false
        });
        result = result.replace(placeholder, sanitizedCodeBlock);
      });

      // Third pass: Clean up empty elements but preserve code block formatting
      return result
        .replace(/<p>\s*<\/p>/g, '')
        .replace(/<p>\s*<br[^>]*>\s*<\/p>/g, '<p><br></p>')
        // Use markers to preserve code blocks during whitespace normalization
        .replace(/<(pre|code)[^>]*>[\s\S]*?<\/\1>/g, (match) => {
          return '___CODE_PRESERVE___' + match + '___/CODE_PRESERVE___';
        })
        .replace(/\s+/g, ' ') // Normalize whitespace outside code blocks
        .replace(/___CODE_PRESERVE___([\s\S]*?)___\/CODE_PRESERVE___/g, '$1') // Restore code blocks
        .trim();
    } catch (error) {
      console.warn('Error cleaning pasted content:', error);
      // Fallback: just use DOMPurify with basic config
      return DOMPurify.sanitize(html, EPUB_SAFE_CONFIG);
    }
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
      
      // Detect current heading level or body text
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let element: Node | null = range.commonAncestorContainer;
        if (element.nodeType === Node.TEXT_NODE) {
          element = element.parentElement;
        }
        let isHeading = false;
        while (element && element !== editorRef.current) {
          if (element instanceof HTMLElement) {
            const tagName = element.tagName.toLowerCase();
            if (tagName.match(/^h[1-6]$/)) {
              const level = parseInt(tagName.charAt(1));
              s[`heading${level}`] = true;
              isHeading = true;
              break;
            } else if (tagName === 'p') {
              s['heading0'] = true;
              isHeading = true;
              break;
            }
          }
          element = element.parentElement;
        }
        // If no specific block element found, assume it's body text
        if (!isHeading) {
          s['heading0'] = true;
        }
      }
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
    
    // On mobile, scroll the editor to near the top of viewport for optimal writing space
    if (window.innerWidth < 1024 && editorRef.current) { // lg breakpoint is 1024px
      setTimeout(() => {
        if (editorRef.current) {
          const editorRect = editorRef.current.getBoundingClientRect();
          const scrollOffset = window.scrollY + editorRect.top - 4; // 4px from top as requested
          window.scrollTo({ top: scrollOffset, behavior: 'smooth' });
        }
      }, 100); // Small delay to ensure keyboard is starting to appear
    }
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
    if (disabled) return;
    
    const clipboardData = e.clipboardData;
    const items = clipboardData.items;
    
    // Check for images first (higher priority)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) insertImageFile(file);
        return;
      }
    }
    
    // Handle HTML content (Word documents, rich text)
    const htmlData = clipboardData.getData('text/html');
    if (htmlData && htmlData.trim()) {
      e.preventDefault();
      
      // Clean the HTML content for EPUB compatibility
      const cleanedHtml = cleanPastedContent(htmlData);
      
      // Insert cleaned HTML at cursor position
      focusEditor();
      if (cleanedHtml) {
        document.execCommand('insertHTML', false, cleanedHtml);
        emitChange();
        refreshStates();
      }
      return;
    }
    
    // Fallback to plain text
    const textData = clipboardData.getData('text/plain');
    if (textData && textData.trim()) {
      e.preventDefault();
      
      // Convert line breaks to paragraphs and clean
      const lines = textData.split(/\r\n|\n|\r/);
      const htmlContent = lines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${line}</p>`)
        .join('');
      
      const cleanedHtml = cleanPastedContent(htmlContent);
      
      focusEditor();
      if (cleanedHtml) {
        document.execCommand('insertHTML', false, cleanedHtml);
        emitChange();
        refreshStates();
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
      className={`relative border border-[#E8E8E8] rounded bg-[#F7F7F7] focus-within:bg-white hover:focus-within:bg-white hover:bg-[#F2F2F2] transition-colors flex flex-col editor-root h-full overflow-hidden ${className}`}
      {...rest}
    >
      {/* Toolbar - Always visible on desktop, focus-triggered on mobile */}
      <div className={`border-b border-[#E8E8E8] bg-white ${focused ? 'block' : 'hidden lg:block'}`}>
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
                      className={`w-8 h-8 rounded border text-xs font-bold transition-colors touch-manipulation ${
                        formats[b.cmd] 
                          ? 'bg-[#181a1d] text-white border-[#181a1d]' 
                          : 'bg-white text-[#6a6c72] border-[#E8E8E8] hover:bg-[#F7F7F7]'
                      } ${b.className || ''}`}
                      onClick={() => applyInlineOrAlign(b.cmd)}
                      disabled={disabled}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Headings section */}
              <div className="flex flex-col gap-1">
                <div className="text-[9px] font-semibold tracking-wide uppercase text-[#86868B] select-none px-1">Headings</div>
                <div className="flex gap-1">
                  {HEADINGS.map(h => (
                    <button
                      key={h.level}
                      onMouseDown={e => e.preventDefault()}
                      title={h.title}
                      type="button"
                      className={`w-8 h-8 rounded border text-xs font-bold transition-colors touch-manipulation ${
                        formats[`heading${h.level}`] 
                          ? 'bg-[#181a1d] text-white border-[#181a1d]' 
                          : 'bg-white text-[#6a6c72] border-[#E8E8E8] hover:bg-[#F7F7F7]'
                      }`}
                      onClick={() => applyHeading(h.level)}
                      disabled={disabled}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Actions section */}
              <div className="flex flex-col gap-1">
                <div className="text-[9px] font-semibold tracking-wide uppercase text-[#86868B] select-none px-1">Actions</div>
                <div className="flex gap-1">
                  {ACTIONS.map(action => (
                    <button
                      key={action.cmd}
                      onMouseDown={e => e.preventDefault()}
                      title={action.title}
                      type="button"
                      className="w-8 h-8 rounded border transition-colors touch-manipulation bg-white text-[#6a6c72] border-[#E8E8E8] hover:bg-[#F7F7F7] flex items-center justify-center overflow-visible"
                      onClick={() => {
                        if (action.cmd === 'endnote') {
                          handleEndnoteClick();
                        } else if (action.cmd === 'link') {
                          handleLinkClick();
                        }
                      }}
                      disabled={disabled || (action.cmd === 'endnote' && !onCreateEndnote)}
                    >
                      <Image
                        src={action.cmd === 'endnote' ? '/endnote-icon.svg' : '/link-icon.svg'}
                        alt={action.title}
                        width={12}
                        height={12}
                        className="w-3 h-3"
                        style={{ borderRadius: '0', boxShadow: 'none' }}
                      />
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
                      className={`w-8 h-8 rounded border text-xs font-bold transition-colors touch-manipulation ${
                        formats[a.cmd] 
                          ? 'bg-[#181a1d] text-white border-[#181a1d]' 
                          : 'bg-white text-[#6a6c72] border-[#E8E8E8] hover:bg-[#F7F7F7]'
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
                    title="Undo"
                    type="button"
                    className="w-8 h-8 rounded border bg-white text-[#6a6c72] border-[#E8E8E8] hover:bg-[#F7F7F7] transition-colors touch-manipulation flex items-center justify-center overflow-visible"
                    onClick={applyUndo}
                    disabled={disabled}
                  >
                    <Image
                      src="/undo-icon.svg"
                      alt="Undo"
                      width={12}
                      height={12}
                      className="w-3 h-3"
                      style={{ borderRadius: '0', boxShadow: 'none' }}
                    />
                  </button>
                  <button
                    onMouseDown={e => e.preventDefault()}
                    title="Redo"
                    type="button"
                    className="w-8 h-8 rounded border bg-white text-[#6a6c72] border-[#E8E8E8] hover:bg-[#F7F7F7] transition-colors touch-manipulation flex items-center justify-center overflow-visible"
                    onClick={applyRedo}
                    disabled={disabled}
                  >
                    <Image
                      src="/redo-icon.svg"
                      alt="Redo"
                      width={12}
                      height={12}
                      className="w-3 h-3"
                      style={{ borderRadius: '0', boxShadow: 'none' }}
                    />
                  </button>
                  <button
                    onMouseDown={e => e.preventDefault()}
                    title="Insert Image"
                    type="button"
                    className="w-8 h-8 rounded border bg-white text-[#6a6c72] border-[#E8E8E8] hover:bg-[#F7F7F7] text-[10px] font-medium transition-colors touch-manipulation"
                    onClick={handleImageButtonClick}
                    disabled={disabled}
                  >
                    IMG
                  </button>
                  <button
                    onMouseDown={e => e.preventDefault()}
                    title="Clear formatting"
                    type="button"
                    className="w-8 h-8 rounded border bg-white text-[#6a6c72] border-[#E8E8E8] hover:bg-[#F7F7F7] text-[10px] font-medium transition-colors touch-manipulation"
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
      
      {/* Editable area */}
      <div className="flex-1 min-w-0 relative flex flex-col min-h-0">
        {showPlaceholder && (
          <div
            className="absolute left-4 top-4 text-[#737373] text-sm pointer-events-none select-none z-10"
          >
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          className="editor-root p-4 text-base leading-6 focus:outline-none whitespace-pre-wrap break-words w-full max-w-full overflow-y-auto flex-1 min-h-0 overflow-x-hidden"
          style={{ 
            minHeight: Math.max(minHeight, 200),
            maxHeight: 'calc(100vh - 300px)',
            height: '100%',
            position: 'relative',
            contain: 'layout style'
          }}
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
        <style jsx global>{`
          .editor-root p {
            margin: 0.5rem 0;
          }
          .editor-root h1 {
            font-size: 2rem !important;
            font-weight: 700 !important;
            margin: 1.5rem 0 1rem 0 !important;
            line-height: 1.2 !important;
            color: inherit !important;
            display: block !important;
          }
          .editor-root h2 {
            font-size: 1.5rem !important;
            font-weight: 700 !important;
            margin: 1.25rem 0 0.75rem 0 !important;
            line-height: 1.3 !important;
            color: inherit !important;
            display: block !important;
          }
          .editor-root h3 {
            font-size: 1.25rem !important;
            font-weight: 700 !important;
            margin: 1rem 0 0.5rem 0 !important;
            line-height: 1.4 !important;
            color: inherit !important;
            display: block !important;
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
          <div className="px-4 pb-2 text-[11px] text-[#86868B] flex justify-between items-center select-none">
            {/* Terms/Privacy links - only on mobile */}
            <div className="lg:hidden flex items-center space-x-2">
              <Link href="/terms" className="hover:underline" target="_blank">
                Terms
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/privacy" className="hover:underline" target="_blank">
                Privacy
              </Link>
            </div>
            {/* Spacer for desktop when links are hidden */}
            <div className="hidden lg:block"></div>
            {/* Word count - always on the right */}
            <div>
              Words: {wordCount} | Characters: {charCount}
            </div>
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

      {/* Desktop Toolbar - Hidden (now using top toolbar for all devices) */}
      <div
        onMouseDown={toolbarMouseDown}
        className={`hidden w-32 border-l bg-[#F7F7F7] flex-col gap-4 p-2 overflow-y-auto ${
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

        <Section label="Headings">
          <div className="grid grid-cols-3 gap-1">
            {HEADINGS.map(h => (
              <button
                key={h.level}
                onMouseDown={e => e.preventDefault()}
                title={h.title}
                type="button"
                className={`${BTN} ${formats[`heading${h.level}`] ? BTN_ACTIVE : ''}`}
                onClick={() => applyHeading(h.level)}
                disabled={disabled}
              >
                {h.label}
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

        <Section label="History">
          <div className="grid grid-cols-2 gap-1">
            <button
              onMouseDown={e => e.preventDefault()}
              title="Undo"
              type="button"
              className="w-full px-2 py-1 text-sm font-medium rounded border border-gray-300 bg-white hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed overflow-visible flex items-center justify-center"
              onClick={applyUndo}
              disabled={disabled}
            >
              <Image
                src="/undo-icon.svg"
                alt="Undo"
                width={12}
                height={12}
                className="w-3 h-3"
                style={{ borderRadius: '0', boxShadow: 'none' }}
              />
            </button>
            <button
              onMouseDown={e => e.preventDefault()}
              title="Redo"
              type="button"
              className="w-full px-2 py-1 text-sm font-medium rounded border border-gray-300 bg-white hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed overflow-visible flex items-center justify-center"
              onClick={applyRedo}
              disabled={disabled}
            >
              <Image
                src="/redo-icon.svg"
                alt="Redo"
                width={12}
                height={12}
                className="w-3 h-3"
              />
            </button>
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

        <Section label="Actions">
          <div className="grid grid-cols-2 gap-1">
            {ACTIONS.map(action => (
              <button
                key={action.cmd}
                onMouseDown={e => e.preventDefault()}
                title={action.title}
                type="button"
                className="w-full px-2 py-1 text-sm font-medium rounded border border-gray-300 bg-white hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed overflow-visible flex items-center justify-center"
                onClick={() => {
                  if (action.cmd === 'endnote') {
                    handleEndnoteClick();
                  } else if (action.cmd === 'link') {
                    handleLinkClick();
                  }
                }}
                disabled={disabled || (action.cmd === 'endnote' && !onCreateEndnote)}
              >
                <Image
                  src={action.cmd === 'endnote' ? '/endnote-icon.svg' : '/link-icon.svg'}
                  alt={action.title}
                  width={12}
                  height={12}
                  className="w-3 h-3"
                />
              </button>
            ))}
          </div>
        </Section>

        <Section label="Clear formatting">
          <button
            onMouseDown={e => e.preventDefault()}
            title="Clear formatting"
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