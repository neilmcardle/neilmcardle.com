'use client';

import mammoth from 'mammoth';

export interface ParsedChapter {
  title: string;
  content: string;
  type: 'frontmatter' | 'content' | 'backmatter';
}

export interface ParsedBook {
  title: string;
  author: string;
  chapters: ParsedChapter[];
}

// Common chapter title patterns
const CHAPTER_PATTERNS = [
  /^chapter\s+(\d+|[ivxlcdm]+)[\s:.\-–—]*(.*)?$/i,
  /^part\s+(\d+|[ivxlcdm]+)[\s:.\-–—]*(.*)?$/i,
  /^section\s+(\d+|[ivxlcdm]+)[\s:.\-–—]*(.*)?$/i,
  /^prologue[\s:.\-–—]*(.*)?$/i,
  /^epilogue[\s:.\-–—]*(.*)?$/i,
  /^introduction[\s:.\-–—]*(.*)?$/i,
  /^foreword[\s:.\-–—]*(.*)?$/i,
  /^preface[\s:.\-–—]*(.*)?$/i,
  /^acknowledgements?[\s:.\-–—]*(.*)?$/i,
  /^dedication[\s:.\-–—]*(.*)?$/i,
  /^afterword[\s:.\-–—]*(.*)?$/i,
  /^appendix[\s:.\-–—]*([a-z]|\d+)?[\s:.\-–—]*(.*)?$/i,
  /^glossary[\s:.\-–—]*(.*)?$/i,
  /^bibliography[\s:.\-–—]*(.*)?$/i,
  /^about\s+the\s+author[\s:.\-–—]*(.*)?$/i,
  /^notes[\s:.\-–—]*(.*)?$/i,
];

// Front matter titles
const FRONTMATTER_TITLES = [
  'prologue', 'introduction', 'foreword', 'preface', 
  'acknowledgements', 'acknowledgments', 'dedication',
  'title page', 'copyright'
];

// Back matter titles
const BACKMATTER_TITLES = [
  'epilogue', 'afterword', 'appendix', 'glossary', 
  'bibliography', 'about the author', 'notes', 'index'
];

function determineChapterType(title: string): 'frontmatter' | 'content' | 'backmatter' {
  const lowerTitle = title.toLowerCase();
  
  if (FRONTMATTER_TITLES.some(fm => lowerTitle.includes(fm))) {
    return 'frontmatter';
  }
  
  if (BACKMATTER_TITLES.some(bm => lowerTitle.includes(bm))) {
    return 'backmatter';
  }
  
  return 'content';
}

function isChapterTitle(line: string): boolean {
  const trimmed = line.trim();
  return CHAPTER_PATTERNS.some(pattern => pattern.test(trimmed));
}

function extractChapterTitle(line: string): string {
  const trimmed = line.trim();
  
  // Try to match and format chapter titles
  for (const pattern of CHAPTER_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return trimmed;
    }
  }
  
  return trimmed;
}

function splitIntoChapters(text: string): ParsedChapter[] {
  const lines = text.split(/\n/);
  const chapters: ParsedChapter[] = [];
  let currentChapter: ParsedChapter | null = null;
  let contentLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (isChapterTitle(trimmed)) {
      // Save previous chapter
      if (currentChapter || contentLines.length > 0) {
        const content = contentLines.join('\n').trim();
        if (currentChapter) {
          currentChapter.content = formatContentAsHtml(content);
          chapters.push(currentChapter);
        } else if (content) {
          // Content before first chapter - could be front matter
          chapters.push({
            title: 'Introduction',
            content: formatContentAsHtml(content),
            type: 'frontmatter'
          });
        }
      }
      
      // Start new chapter
      const title = extractChapterTitle(trimmed);
      currentChapter = {
        title,
        content: '',
        type: determineChapterType(title)
      };
      contentLines = [];
    } else {
      contentLines.push(line);
    }
  }
  
  // Save last chapter
  if (currentChapter || contentLines.length > 0) {
    const content = contentLines.join('\n').trim();
    if (currentChapter) {
      currentChapter.content = formatContentAsHtml(content);
      chapters.push(currentChapter);
    } else if (content) {
      // Single chapter document
      chapters.push({
        title: 'Chapter 1',
        content: formatContentAsHtml(content),
        type: 'content'
      });
    }
  }
  
  return chapters;
}

function formatContentAsHtml(text: string): string {
  if (!text) return '';
  
  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  
  return paragraphs
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      
      // Convert single newlines within a paragraph to spaces
      const normalized = trimmed.replace(/\n/g, ' ').replace(/\s+/g, ' ');
      return `<p>${normalized}</p>`;
    })
    .filter(p => p)
    .join('\n');
}

export async function parseTextFile(file: File): Promise<ParsedBook> {
  const text = await file.text();
  const chapters = splitIntoChapters(text);
  
  // Try to extract title from first line or filename
  const lines = text.split('\n').filter(l => l.trim());
  const possibleTitle = lines[0]?.trim() || file.name.replace(/\.[^.]+$/, '');
  
  return {
    title: possibleTitle.length < 100 ? possibleTitle : file.name.replace(/\.[^.]+$/, ''),
    author: '',
    chapters: chapters.length > 0 ? chapters : [{
      title: 'Chapter 1',
      content: formatContentAsHtml(text),
      type: 'content'
    }]
  };
}

export async function parseDocxFile(file: File): Promise<ParsedBook> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Use mammoth to extract text and HTML
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value;
  
  // Also get HTML for potential formatting preservation
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
  const html = htmlResult.value;
  
  // Split into chapters
  const chapters = splitIntoChapters(text);
  
  // Try to extract title from first heading or filename
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const possibleTitle = titleMatch ? titleMatch[1].trim() : file.name.replace(/\.docx?$/i, '');
  
  return {
    title: possibleTitle,
    author: '',
    chapters: chapters.length > 0 ? chapters : [{
      title: 'Chapter 1',
      content: formatContentAsHtml(text),
      type: 'content'
    }]
  };
}

export async function parsePdfFile(file: File): Promise<ParsedBook> {
  // Dynamic import pdfjs-dist to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set up the worker - use CDN for reliability
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  // Extract text from each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }
  
  // Split into chapters
  const chapters = splitIntoChapters(fullText);
  
  return {
    title: file.name.replace(/\.pdf$/i, ''),
    author: '',
    chapters: chapters.length > 0 ? chapters : [{
      title: 'Chapter 1',
      content: formatContentAsHtml(fullText),
      type: 'content'
    }]
  };
}

export async function parseDocument(file: File): Promise<ParsedBook> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'txt':
      return parseTextFile(file);
    case 'doc':
    case 'docx':
      return parseDocxFile(file);
    case 'pdf':
      return parsePdfFile(file);
    default:
      throw new Error(`Unsupported file format: .${extension}`);
  }
}

export function getSupportedFormats(): string[] {
  return ['.txt', '.doc', '.docx', '.pdf'];
}
