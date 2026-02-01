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
import { useTheme } from '../../../lib/contexts/ThemeContext';
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
  hasEndnotes?: boolean;
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
    'pre', 'code', 'a', 'img', 'hr', 'figure', 'figcaption',
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
  hasEndnotes = false,
  ...rest
}: RichTextEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);
  const [formats, setFormats] = useState<FormatState>({});
  const lastExternalValueRef = useRef<string>(value);
  
  // Mobile focus mode - collapses toolbar when keyboard is open
  const [isMobileKeyboardOpen, setIsMobileKeyboardOpen] = useState(false);
  const [showCompactToolbar, setShowCompactToolbar] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const initialViewportHeight = useRef<number | null>(null);

  // Endnote modal state
  const [showEndnoteModal, setShowEndnoteModal] = useState(false);
  const [endnoteContent, setEndnoteContent] = useState('');
  const savedCursorPosition = useRef<Range | null>(null);

  // Image caption modal state
  const [showImageCaptionModal, setShowImageCaptionModal] = useState(false);
  const [imageCaption, setImageCaption] = useState('');
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);

  // Detect mobile keyboard open/close using visualViewport API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Only apply on mobile (touch devices with small screens)
    const isMobile = window.matchMedia('(max-width: 1023px)').matches && 'ontouchstart' in window;
    if (!isMobile) return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    // Store initial viewport height
    if (initialViewportHeight.current === null) {
      initialViewportHeight.current = viewport.height;
    }

    const handleResize = () => {
      if (initialViewportHeight.current === null) return;
      
      // Keyboard is likely open if viewport shrinks significantly (>150px)
      const heightDiff = initialViewportHeight.current - viewport.height;
      const keyboardOpen = heightDiff > 150;
      
      setIsMobileKeyboardOpen(keyboardOpen);
      
      // Show compact toolbar when keyboard opens AND editor is focused
      if (keyboardOpen && focused) {
        setShowCompactToolbar(true);
        
        // Auto-scroll to ensure cursor is visible
        setTimeout(() => {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (rect.bottom > viewport.height - 60) {
              // Cursor is hidden behind keyboard, scroll it into view
              editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }, 100);
      } else {
        setShowCompactToolbar(false);
      }
    };

    viewport.addEventListener('resize', handleResize);
    return () => viewport.removeEventListener('resize', handleResize);
  }, [focused]);

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

    // Save current cursor position
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      alert('Please click in the editor to position your cursor.');
      return;
    }

    const range = selection.getRangeAt(0).cloneRange();
    savedCursorPosition.current = range;

    // Open modal for user to enter endnote content
    setEndnoteContent('');
    setShowEndnoteModal(true);
  };

  const handleAddEndnote = () => {
    if (!endnoteContent.trim() || !onCreateEndnote || !savedCursorPosition.current) return;

    // Call the callback to create endnote and get the link
    const endnoteLink = onCreateEndnote(endnoteContent.trim(), chapterId);

    if (endnoteLink && endnoteLink.trim()) {
      // Insert the endnote marker at the saved cursor position
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = endnoteLink;
      const endnoteElement = tempDiv.firstChild;

      if (endnoteElement) {
        const range = savedCursorPosition.current;
        range.insertNode(endnoteElement);

        // Position cursor after the inserted marker
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          range.setStartAfter(endnoteElement);
          range.collapse(true);
          selection.addRange(range);
        }

        // Trigger change event
        emitChange();
      }
    }

    // Close modal and reset
    setShowEndnoteModal(false);
    setEndnoteContent('');
    savedCursorPosition.current = null;

    // Refocus editor
    focusEditor();
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

  const handleAnchorClick = () => {
    if (disabled) return;
    
    const anchorId = prompt('Enter anchor ID (for linking from index):\n\nExample: chapter-introduction\n\nThis will create: <a id="chapter-introduction"></a>');
    if (anchorId && anchorId.trim()) {
      // Clean the anchor ID to be URL-safe
      const cleanId = anchorId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      
      if (cleanId) {
        const anchorHtml = `<a id="${cleanId}"></a>`;
        
        focusEditor();
        document.execCommand('insertHTML', false, anchorHtml);
        emitChange();
        refreshStates();
        
        alert(`Anchor created! You can now link to this location using: #${cleanId}\n\nFor example, in your index: <a href="#${cleanId}">Link text</a>`);
      }
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
      
      // GOOGLE DOCS SPECIFIC: Preserve paragraph structure
      // Google Docs uses <p> tags with inline styles, and <span> for formatting
      // Also uses <br> between paragraphs in some cases
      
      // Convert Google Docs paragraph separator spans to paragraph breaks
      cleaned = cleaned.replace(/<span[^>]*style="[^"]*white-space:\s*pre[^"]*"[^>]*>\s*<\/span>/gi, '</p><p>');
      
      // Preserve paragraph breaks from Google Docs (they use margin-bottom on p tags)
      // Convert consecutive <br> tags to paragraph breaks
      cleaned = cleaned.replace(/(<br\s*\/?>\s*){2,}/gi, '</p><p>');
      
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
        // Keep single br tags but convert double br to paragraph break
        .replace(/<br[^>]*>\s*<br[^>]*>/gi, '</p><p>');
      
      // Remove spans but keep their content (Google Docs uses lots of spans)
      cleaned = cleaned.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1');
      
      // Normalize line breaks - but keep paragraph structure
      cleaned = cleaned.replace(/\r\n|\r/g, '\n');
      
      // Convert standalone newlines inside content to spaces, but not between tags
      cleaned = cleaned.replace(/>(\s*)\n(\s*)</g, '>$1 $2<');

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
      // And preserve paragraph spacing
      result = result
        // Remove truly empty paragraphs (no content at all)
        .replace(/<p>\s*<\/p>/g, '')
        // Keep paragraph breaks with br tags
        .replace(/<p>\s*<br[^>]*>\s*<\/p>/g, '<p><br></p>')
        // Use markers to preserve code blocks during whitespace normalization
        .replace(/<(pre|code)[^>]*>[\s\S]*?<\/\1>/g, (match) => {
          return '___CODE_PRESERVE___' + match + '___/CODE_PRESERVE___';
        });
      
      // Normalize multiple spaces to single space (but not newlines)
      result = result.replace(/  +/g, ' ');
      
      // Restore code blocks
      result = result.replace(/___CODE_PRESERVE___([\s\S]*?)___\/CODE_PRESERVE___/g, '$1');
      
      // Clean up consecutive paragraph breaks (more than 2 becomes 2)
      result = result.replace(/(<\/p>\s*<p>){3,}/gi, '</p><p><br></p><p>');
      
      return result.trim();
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
        document.activeElement !== editorRef.current &&
        !editorRef.current.contains(document.activeElement)
      ) {
        ensureInitialParagraph();
        emitChange();
        setFocused(false);
        onFocusStateChange?.(false);
        
        // Reset viewport zoom on mobile after editing (fixes iOS zoom issue)
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          // Reset the initial viewport height reference so it's recalculated next time
          initialViewportHeight.current = null;
          
          // Force scroll to reset any iOS zoom artifacts
          setTimeout(() => {
            window.scrollTo(window.scrollX, window.scrollY);
          }, 100);
        }
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
    // Save the image source and open caption modal
    setPendingImageSrc(src);

    // Save current cursor position
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedCursorPosition.current = selection.getRangeAt(0).cloneRange();
    }

    setImageCaption('');
    setShowImageCaptionModal(true);
  };

  const handleAddImageWithCaption = () => {
    if (!pendingImageSrc) return;

    focusEditor();
    if (!editorRef.current) return;

    // Restore cursor position if saved
    const selection = window.getSelection();
    if (!selection) return;

    if (savedCursorPosition.current) {
      selection.removeAllRanges();
      selection.addRange(savedCursorPosition.current);
    }

    // Create figure element with image and optional caption
    const figure = document.createElement('figure');
    figure.style.margin = '1em 0';
    figure.style.textAlign = 'center';

    const img = document.createElement('img');
    img.src = pendingImageSrc;
    img.alt = imageCaption || 'Image';
    img.style.maxWidth = '100%';
    img.style.display = 'block';
    img.style.margin = '0 auto';

    figure.appendChild(img);

    // Add caption if provided
    if (imageCaption.trim()) {
      const figcaption = document.createElement('figcaption');
      figcaption.textContent = imageCaption.trim();
      figcaption.style.marginTop = '0.5em';
      figcaption.style.fontSize = '0.9em';
      figcaption.style.fontStyle = 'italic';
      figcaption.style.color = '#666';
      figure.appendChild(figcaption);
    }

    // Insert figure at caret
    const range = selection.getRangeAt(0);
    range.collapse(false);
    range.insertNode(figure);

    // Move caret after the figure
    range.setStartAfter(figure);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    emitChange();

    // Close modal and reset
    setShowImageCaptionModal(false);
    setImageCaption('');
    setPendingImageSrc(null);
    savedCursorPosition.current = null;

    // Refocus editor
    focusEditor();
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
      
      // Convert line breaks to paragraphs, preserving blank lines as paragraph spacing
      const lines = textData.split(/\r\n|\n|\r/);
      const htmlParts: string[] = [];
      let consecutiveEmpty = 0;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length === 0) {
          consecutiveEmpty++;
          // Add a spacing paragraph for consecutive empty lines (paragraph break)
          if (consecutiveEmpty === 1) {
            htmlParts.push('<p><br></p>');
          }
        } else {
          consecutiveEmpty = 0;
          htmlParts.push(`<p>${trimmed}</p>`);
        }
      }
      
      const htmlContent = htmlParts.join('');
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
      className={`relative border-none rounded bg-white dark:bg-[#1a1a1a] transition-colors flex flex-col editor-root h-full overflow-hidden ${className}`}
      {...rest}
    >
      {/* Full Toolbar - Hidden on mobile when keyboard is open */}
      <div className={`bg-white dark:bg-[#1a1a1a] transition-all duration-200 overflow-visible ${
        isMobileKeyboardOpen ? 'lg:block hidden' : ''
      }`}>
        {/* Sleek horizontal toolbar */}
        <div className="flex items-center px-2 py-2 gap-1 overflow-x-auto overflow-y-visible scrollbar-hide" style={{ paddingTop: '40px', marginTop: '-40px' }}>
          {/* Format buttons (B, I, U, S) */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {INLINE.map(b => (
              <button
                key={b.cmd}
                onMouseDown={e => e.preventDefault()}
                onClick={() => applyInlineOrAlign(b.cmd)}
                title={b.title}
                type="button"
                disabled={disabled}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold active:scale-95 transition-transform touch-manipulation ${
                  formats[b.cmd]
                    ? 'bg-[#181a1d] dark:bg-white text-white dark:text-[#181a1d]'
                    : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300'
                } ${b.className || ''}`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-[#444] flex-shrink-0" />

          {/* Headings (P, H1, H2, H3) */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {HEADINGS.map(h => (
              <button
                key={h.level}
                onMouseDown={e => e.preventDefault()}
                onClick={() => applyHeading(h.level)}
                title={h.title}
                type="button"
                disabled={disabled}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold active:scale-95 transition-transform touch-manipulation ${
                  formats[`heading${h.level}`]
                    ? 'bg-[#181a1d] dark:bg-white text-white dark:text-[#181a1d]'
                    : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-[#444] flex-shrink-0" />

          {/* Alignment buttons */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => applyInlineOrAlign('justifyLeft')}
              title="Left Align"
              type="button"
              disabled={disabled}
              className={`w-9 h-9 rounded-lg flex items-center justify-center active:scale-95 transition-transform touch-manipulation ${
                formats['justifyLeft']
                  ? 'bg-[#181a1d] dark:bg-white'
                  : 'bg-gray-100 dark:bg-[#2a2a2a]'
              }`}
            >
              <img src="/left-align-icon.svg" alt="Left" className="w-3.5 h-3.5" style={{ borderRadius: 0, boxShadow: 'none', filter: formats['justifyLeft'] ? (theme === 'dark' ? 'invert(0)' : 'invert(1)') : (theme === 'dark' ? 'invert(1)' : 'invert(0)') }} />
            </button>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => applyInlineOrAlign('justifyCenter')}
              title="Center Align"
              type="button"
              disabled={disabled}
              className={`w-9 h-9 rounded-lg flex items-center justify-center active:scale-95 transition-transform touch-manipulation ${
                formats['justifyCenter']
                  ? 'bg-[#181a1d] dark:bg-white'
                  : 'bg-gray-100 dark:bg-[#2a2a2a]'
              }`}
            >
              <img src="/centrally-align-icon.svg" alt="Center" className="w-3.5 h-3.5" style={{ borderRadius: 0, boxShadow: 'none', filter: formats['justifyCenter'] ? (theme === 'dark' ? 'invert(0)' : 'invert(1)') : (theme === 'dark' ? 'invert(1)' : 'invert(0)') }} />
            </button>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => applyInlineOrAlign('justifyRight')}
              title="Right Align"
              type="button"
              disabled={disabled}
              className={`w-9 h-9 rounded-lg flex items-center justify-center active:scale-95 transition-transform touch-manipulation ${
                formats['justifyRight']
                  ? 'bg-[#181a1d] dark:bg-white'
                  : 'bg-gray-100 dark:bg-[#2a2a2a]'
              }`}
            >
              <img src="/right-align-icon.svg" alt="Right" className="w-3.5 h-3.5" style={{ borderRadius: 0, boxShadow: 'none', filter: formats['justifyRight'] ? (theme === 'dark' ? 'invert(0)' : 'invert(1)') : (theme === 'dark' ? 'invert(1)' : 'invert(0)') }} />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-[#444] flex-shrink-0" />

          {/* Endnote, Link, Anchor buttons */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={handleEndnoteClick}
              title="Insert Endnote"
              type="button"
              disabled={disabled || !onCreateEndnote}
              className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center active:scale-95 transition-transform touch-manipulation disabled:opacity-40"
            >
              <Image src="/endnote-icon.svg" alt="Endnote" width={14} height={14} className="w-3.5 h-3.5 dark:invert" style={{ borderRadius: 0, boxShadow: 'none' }} />
            </button>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={handleLinkClick}
              title="Insert Link"
              type="button"
              disabled={disabled}
              className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
            >
              <Image src="/link-icon.svg" alt="Link" width={14} height={14} className="w-3.5 h-3.5 dark:invert" style={{ borderRadius: 0, boxShadow: 'none' }} />
            </button>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={handleAnchorClick}
              title="Insert Anchor"
              type="button"
              disabled={disabled}
              className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
            >
              <Image src="/anchor-icon.svg" alt="Anchor" width={14} height={14} className="w-3.5 h-3.5 dark:invert" style={{ borderRadius: 0, boxShadow: 'none' }} />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-[#444] flex-shrink-0" />

          {/* Insert Image button */}
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={handleImageButtonClick}
            title="Insert Image"
            type="button"
            disabled={disabled}
            className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center active:scale-95 transition-transform touch-manipulation flex-shrink-0"
          >
            <img src="/image-icon.svg" alt="Image" className="w-3.5 h-3.5 dark:invert" style={{ borderRadius: 0, boxShadow: 'none' }} />
          </button>

          {/* Clear formatting button */}
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => {
              focusEditor();
              document.execCommand('removeFormat');
              emitChange();
              refreshStates();
            }}
            title="Remove all formatting (bold, italic, etc.)"
            type="button"
            disabled={disabled}
            className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center active:scale-95 transition-transform touch-manipulation flex-shrink-0"
          >
            <img src="/clear-erase-icon.svg" alt="Clear" className="w-3.5 h-3.5 dark:invert" style={{ borderRadius: 0, boxShadow: 'none' }} />
          </button>
        </div>
      </div>

      {/* Compact Floating Toolbar - Appears on mobile when keyboard is open */}
      {showCompactToolbar && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[200] bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-[#333] shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {/* More menu popover */}
          {showMoreMenu && (
            <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-[#333] shadow-lg p-3">
              <div className="flex flex-wrap gap-2">
                {/* Endnote */}
                <button
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => {
                    handleEndnoteClick();
                    setShowMoreMenu(false);
                  }}
                  disabled={!onCreateEndnote}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-sm font-medium text-gray-700 dark:text-gray-300 active:bg-gray-200 disabled:opacity-40"
                >
                  <Image src="/endnote-icon.svg" alt="" width={14} height={14} className="w-3.5 h-3.5 dark:invert" style={{ borderRadius: 0, boxShadow: 'none' }} />
                  Endnote
                </button>
                {/* Anchor */}
                <button
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => {
                    handleAnchorClick();
                    setShowMoreMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-sm font-medium text-gray-700 dark:text-gray-300 active:bg-gray-200"
                >
                  <Image src="/anchor-icon.svg" alt="" width={14} height={14} className="w-3.5 h-3.5 dark:invert" style={{ borderRadius: 0, boxShadow: 'none' }} />
                  Anchor
                </button>
                {/* Insert Image */}
                <button
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => {
                    handleImageButtonClick();
                    setShowMoreMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-sm font-medium text-gray-700 dark:text-gray-300 active:bg-gray-200"
                >
                  <img src="/image-icon.svg" alt="" className="w-3.5 h-3.5 dark:invert" style={{ borderRadius: 0, boxShadow: 'none' }} />
                  Image
                </button>
                {/* H3 */}
                <button
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => {
                    applyHeading(3);
                    setShowMoreMenu(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium active:bg-gray-200 ${
                    formats['heading3']
                      ? 'bg-[#181a1d] dark:bg-white text-white dark:text-[#181a1d]'
                      : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300'
                  }`}
                >
                  H3
                </button>
              </div>
            </div>
          )}
          
          {/* Main toolbar - horizontally scrollable */}
          <div className="flex items-center px-2 py-1.5 gap-1 overflow-x-auto scrollbar-hide">
            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={() => {
                  focusEditor();
                  document.execCommand('undo');
                }}
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center active:bg-gray-200 dark:active:bg-[#3a3a3a]"
                title="Undo"
              >
                <Image src="/undo-icon.svg" alt="Undo" width={16} height={16} className="w-4 h-4 dark:invert" style={{ borderRadius: 0, boxShadow: 'none' }} />
              </button>
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={() => {
                  focusEditor();
                  document.execCommand('redo');
                }}
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center active:bg-gray-200 dark:active:bg-[#3a3a3a]"
                title="Redo"
              >
                <Image src="/redo-icon.svg" alt="Redo" width={16} height={16} className="w-4 h-4 dark:invert" style={{ borderRadius: 0, boxShadow: 'none' }} />
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-[#444] flex-shrink-0" />

            {/* Format buttons */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {INLINE.map(b => (
                <button
                  key={b.cmd}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => applyInlineOrAlign(b.cmd)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold active:scale-95 transition-transform ${
                    formats[b.cmd]
                      ? 'bg-[#181a1d] dark:bg-white text-white dark:text-[#181a1d]'
                      : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300'
                  } ${b.className || ''}`}
                  title={b.title}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-[#444] flex-shrink-0" />

            {/* Headings P, H1, H2 */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {HEADINGS.slice(0, 3).map(h => (
                <button
                  key={h.level}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => applyHeading(h.level)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold active:scale-95 transition-transform ${
                    formats[`heading${h.level}`]
                      ? 'bg-[#181a1d] dark:bg-white text-white dark:text-[#181a1d]'
                      : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300'
                  }`}
                  title={h.title}
                >
                  {h.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-[#444] flex-shrink-0" />

            {/* Alignment buttons */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={() => applyInlineOrAlign('justifyLeft')}
                className={`w-9 h-9 rounded-lg flex items-center justify-center active:scale-95 transition-transform ${
                  formats['justifyLeft']
                    ? 'bg-[#181a1d] dark:bg-white'
                    : 'bg-gray-100 dark:bg-[#2a2a2a]'
                }`}
                title="Align Left"
              >
                <img src="/left-align-icon.svg" alt="Left" className="w-3.5 h-3.5" style={{ borderRadius: 0, boxShadow: 'none', filter: formats['justifyLeft'] ? (theme === 'dark' ? 'invert(0)' : 'invert(1)') : (theme === 'dark' ? 'invert(1)' : 'invert(0)') }} />
              </button>
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={() => applyInlineOrAlign('justifyCenter')}
                className={`w-9 h-9 rounded-lg flex items-center justify-center active:scale-95 transition-transform ${
                  formats['justifyCenter']
                    ? 'bg-[#181a1d] dark:bg-white'
                    : 'bg-gray-100 dark:bg-[#2a2a2a]'
                }`}
                title="Align Center"
              >
                <img src="/centrally-align-icon.svg" alt="Center" className="w-3.5 h-3.5" style={{ borderRadius: 0, boxShadow: 'none', filter: formats['justifyCenter'] ? (theme === 'dark' ? 'invert(0)' : 'invert(1)') : (theme === 'dark' ? 'invert(1)' : 'invert(0)') }} />
              </button>
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={() => applyInlineOrAlign('justifyRight')}
                className={`w-9 h-9 rounded-lg flex items-center justify-center active:scale-95 transition-transform ${
                  formats['justifyRight']
                    ? 'bg-[#181a1d] dark:bg-white'
                    : 'bg-gray-100 dark:bg-[#2a2a2a]'
                }`}
                title="Align Right"
              >
                <img src="/right-align-icon.svg" alt="Right" className="w-3.5 h-3.5" style={{ borderRadius: 0, boxShadow: 'none', filter: formats['justifyRight'] ? (theme === 'dark' ? 'invert(0)' : 'invert(1)') : (theme === 'dark' ? 'invert(1)' : 'invert(0)') }} />
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-[#444] flex-shrink-0" />

            {/* Link button */}
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleLinkClick()}
              className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center active:bg-gray-200 dark:active:bg-[#3a3a3a] flex-shrink-0"
              title="Insert Link"
            >
              <Image src="/link-icon.svg" alt="Link" width={14} height={14} className="w-3.5 h-3.5 dark:invert" style={{ borderRadius: 0, boxShadow: 'none' }} />
            </button>

            {/* Clear formatting */}
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => {
                focusEditor();
                document.execCommand('removeFormat');
                emitChange();
                refreshStates();
              }}
              className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center active:bg-gray-200 dark:active:bg-[#3a3a3a] flex-shrink-0"
              title="Remove all formatting (bold, italic, etc.)"
            >
              <img src="/clear-erase-icon.svg" alt="Clear" className="w-3.5 h-3.5 dark:invert" style={{ borderRadius: 0, boxShadow: 'none' }} />
            </button>

            {/* More button */}
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center active:scale-95 transition-transform flex-shrink-0 ${
                showMoreMenu
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                  : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300'
              }`}
              title="More options"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-[#444] flex-shrink-0" />

            {/* Done button to dismiss keyboard */}
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => {
                editorRef.current?.blur();
                setShowCompactToolbar(false);
                setShowMoreMenu(false);
              }}
              className="flex-shrink-0 px-3 h-9 rounded-lg bg-violet-600 text-white text-sm font-medium active:bg-violet-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
      
      {/* Editable area */}
      <div className="flex-1 min-w-0 relative flex flex-col min-h-0">
        {showPlaceholder && (
          <div
            className="absolute left-4 top-4 text-[#737373] text-lg pointer-events-none select-none z-10"
          >
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          className="editor-root p-4 text-base leading-6 focus:outline-none whitespace-pre-wrap break-words w-full max-w-full overflow-y-auto flex-1 min-h-0 overflow-x-hidden text-gray-900 dark:text-gray-100"
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
          <div className="px-4 pb-2 text-[11px] text-[#86868B] dark:text-gray-400 flex justify-between items-center select-none">
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

      {/* Endnote Modal */}
      {showEndnoteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={() => setShowEndnoteModal(false)}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#333]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Endnote</h3>
            </div>
            <div className="px-6 py-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Endnote content
              </label>
              <textarea
                value={endnoteContent}
                onChange={(e) => setEndnoteContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleAddEndnote();
                  }
                  if (e.key === 'Escape') {
                    setShowEndnoteModal(false);
                  }
                }}
                placeholder="Enter your endnote text here..."
                autoFocus
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Press Cmd/Ctrl+Enter to add, or Esc to cancel
              </p>
              {!hasEndnotes && (
                <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  💡 Your first endnote will automatically create an Endnotes chapter at the end of your book.
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-[#333] flex justify-end gap-2">
              <button
                onClick={() => setShowEndnoteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEndnote}
                disabled={!endnoteContent.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Endnote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Caption Modal */}
      {showImageCaptionModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={() => setShowImageCaptionModal(false)}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#333]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Image Caption</h3>
            </div>
            <div className="px-6 py-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Caption (optional)
              </label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImageWithCaption();
                  }
                  if (e.key === 'Escape') {
                    setShowImageCaptionModal(false);
                    setPendingImageSrc(null);
                  }
                }}
                placeholder="E.g., Figure 1: Market trends in 2024"
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Press Enter to add image, or Esc to cancel
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-[#333] flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowImageCaptionModal(false);
                  setPendingImageSrc(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddImageWithCaption}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 rounded-lg transition-opacity"
              >
                Add Image
              </button>
            </div>
          </div>
        </div>
      )}

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