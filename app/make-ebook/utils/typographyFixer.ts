/**
 * Typography Fixer Utilities
 * Fixes common typography issues for professional eBook quality
 */

// Unicode constants for typography
const CHARS = {
  LEFT_DOUBLE_QUOTE: '\u201C',  // "
  RIGHT_DOUBLE_QUOTE: '\u201D', // "
  LEFT_SINGLE_QUOTE: '\u2018',  // '
  RIGHT_SINGLE_QUOTE: '\u2019', // ' (also apostrophe)
  EM_DASH: '\u2014',            // —
  ELLIPSIS: '\u2026',           // …
} as const;

// Smart quotes conversion
export function smartQuotes(text: string): string {
  let result = text;
  
  // Double quotes - opening and closing
  // Opening quote after space, newline, or start
  result = result.replace(/(^|[\s\n>])"/g, `$1${CHARS.LEFT_DOUBLE_QUOTE}`);
  // Closing quote before space, punctuation, or end
  result = result.replace(/"([\s\n,.<!\?;:\)\]\}]|$)/g, `${CHARS.RIGHT_DOUBLE_QUOTE}$1`);
  
  // Single quotes / apostrophes
  // Apostrophe within words (it's, don't, etc.)
  result = result.replace(/(\w)'(\w)/g, `$1${CHARS.RIGHT_SINGLE_QUOTE}$2`);
  // Opening single quote after space
  result = result.replace(/(^|[\s\n>])'/g, `$1${CHARS.LEFT_SINGLE_QUOTE}`);
  // Closing single quote
  result = result.replace(/'([\s\n,.<!\?;:\)\]\}]|$)/g, `${CHARS.RIGHT_SINGLE_QUOTE}$1`);
  
  return result;
}

// Fix dashes - convert double hyphens to em-dashes
export function fixDashes(text: string): string {
  return text
    .replace(/--/g, CHARS.EM_DASH)
    .replace(/ - /g, ` ${CHARS.EM_DASH} `)
    .replace(/(\S)-{2,3}(\S)/g, `$1${CHARS.EM_DASH}$2`);
}

// Fix ellipsis - convert three dots to proper ellipsis character
export function fixEllipsis(text: string): string {
  return text.replace(/\.{3}/g, CHARS.ELLIPSIS);
}

// Remove extra spaces (multiple consecutive spaces)
export function removeExtraSpaces(text: string): string {
  return text.replace(/  +/g, ' ');
}

// Remove excessive line breaks (more than 2 consecutive)
export function fixExcessiveBreaks(html: string): string {
  // Replace more than 2 consecutive <br> tags with 2
  return html.replace(/(<br\s*\/?>\s*){3,}/gi, '<br /><br />');
}

// Fix common punctuation spacing issues
export function fixPunctuationSpacing(text: string): string {
  return text
    // Remove space before punctuation
    .replace(/\s+([,.\?!;:])/g, '$1')
    // Add space after punctuation if missing (except before closing quotes/parens)
    .replace(/([,.\?!;:])([^\s"'"\)\]\}0-9])/g, '$1 $2');
}

// Apply all typography fixes to text content (not HTML tags)
export function fixTypography(html: string): string {
  let result = html;
  
  // Only process text content, not HTML tags
  // This regex captures text between > and <
  result = result.replace(/>([^<]+)</g, (match, text) => {
    let fixed = text;
    fixed = smartQuotes(fixed);
    fixed = fixDashes(fixed);
    fixed = fixEllipsis(fixed);
    fixed = removeExtraSpaces(fixed);
    fixed = fixPunctuationSpacing(fixed);
    return `>${fixed}<`;
  });
  
  // Fix excessive breaks (operates on HTML structure)
  result = fixExcessiveBreaks(result);
  
  return result;
}

// Auto-fix a chapter and return what was changed
export function autoFixChapter(content: string): { 
  fixed: string; 
  changes: string[];
} {
  const changes: string[] = [];
  let fixed = content;
  
  // Check what needs to be fixed before applying
  const textContent = content.replace(/<[^>]+>/g, ' ');
  
  // Check for straight quotes
  if (/["']/.test(textContent)) {
    changes.push('Converted straight quotes to curly quotes');
  }
  
  // Check for double hyphens
  if (/--/.test(textContent)) {
    changes.push('Converted double hyphens to em-dashes');
  }
  
  // Check for three dots
  if (/\.{3}/.test(textContent)) {
    changes.push('Converted three dots to ellipsis character');
  }
  
  // Check for extra spaces
  if (/  +/.test(textContent)) {
    changes.push('Removed extra spaces');
  }
  
  // Check for excessive breaks
  if (/(<br\s*\/?>\s*){3,}/i.test(content)) {
    changes.push('Fixed excessive line breaks');
  }
  
  // Apply all fixes
  fixed = fixTypography(fixed);
  
  return { fixed, changes };
}

// Auto-fix all chapters and return summary
export function autoFixAllChapters(chapters: { content: string }[]): {
  fixedChapters: { content: string }[];
  totalChanges: number;
  summary: { chapterIndex: number; changes: string[] }[];
} {
  const summary: { chapterIndex: number; changes: string[] }[] = [];
  let totalChanges = 0;
  
  const fixedChapters = chapters.map((chapter, index) => {
    const { fixed, changes } = autoFixChapter(chapter.content);
    if (changes.length > 0) {
      summary.push({ chapterIndex: index, changes });
      totalChanges += changes.length;
    }
    return { ...chapter, content: fixed };
  });
  
  return { fixedChapters, totalChanges, summary };
}
