import DOMPurify from "dompurify";

export const EPUB_SAFE_CONFIG = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "sub",
    "sup",
    "h1",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "a",
    "img",
    "hr",
    "figure",
    "figcaption",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id"],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: [
    "script",
    "style",
    "object",
    "embed",
    "iframe",
    "form",
    "input",
  ],
  FORBID_ATTR: ["style", "onclick", "onload", "onerror", "data-*"],
  KEEP_CONTENT: true,
  USE_PROFILES: { html: true },
};

export function cleanPastedHtml(html: string): string {
  try {
    const preservedCodeBlocks = new Map<string, string>();
    let codeBlockCounter = 0;

    let cleaned = html;

    cleaned = cleaned.replace(
      /<span[^>]*style="[^"]*white-space:\s*pre[^"]*"[^>]*>\s*<\/span>/gi,
      "</p><p>",
    );

    cleaned = cleaned.replace(/(<br\s*\/?>\s*){2,}/gi, "</p><p>");

    cleaned = cleaned.replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, (match) => {
      const placeholder = `__SECURE_CODE_BLOCK_${Date.now()}_${codeBlockCounter++}__`;

      const safeCodeBlock = match.replace(/>([^<]*)</g, (textMatch, text) => {
        const escapedText = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;");
        return `>${escapedText}<`;
      });
      preservedCodeBlocks.set(placeholder, safeCodeBlock);
      return placeholder;
    });

    cleaned = cleaned.replace(/<code[^>]*>[\s\S]*?<\/code>/gi, (match) => {
      const placeholder = `__SECURE_CODE_BLOCK_${Date.now()}_${codeBlockCounter++}__`;

      const safeCodeBlock = match.replace(/>([^<]*)</g, (textMatch, text) => {
        const escapedText = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;");
        return `>${escapedText}<`;
      });
      preservedCodeBlocks.set(placeholder, safeCodeBlock);
      return placeholder;
    });

    cleaned = cleaned.replace(
      /```(\w*)\s*\n([\s\S]*?)\n```/g,
      (match, language, code) => {
        const placeholder = `__SECURE_CODE_BLOCK_${Date.now()}_${codeBlockCounter++}__`;

        const escapedCode = code
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;");
        const codeBlock = `<pre><code${language ? ` class="language-${language}"` : ""}>${escapedCode}</code></pre>`;
        preservedCodeBlocks.set(placeholder, codeBlock);
        return placeholder;
      },
    );

    cleaned = cleaned
      .replace(/<!--\[if [^>]*>[\s\S]*?<!\[endif\]-->/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi, "")
      .replace(/<\/o:p>/gi, "")
      .replace(/<o:[^>]*>/gi, "")
      .replace(/\s*mso-[^:]*:[^;"]*;?/gi, "")
      .replace(/\s*style\s*=\s*["'][^"']*["']/gi, "")
      .replace(/\s*class\s*=\s*["'][^"']*["']/gi, "")
      .replace(/<b\b[^>]*>/gi, "<strong>")
      .replace(/<\/b>/gi, "</strong>")
      .replace(/<i\b[^>]*>/gi, "<em>")
      .replace(/<\/i>/gi, "</em>")
      .replace(/<strike\b[^>]*>/gi, "<s>")
      .replace(/<\/strike>/gi, "</s>")
      .replace(/<div[^>]*>/gi, "<p>")
      .replace(/<\/div>/gi, "</p>")
      .replace(/<br[^>]*>\s*<br[^>]*>/gi, "</p><p>");

    cleaned = cleaned.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, "$1");

    cleaned = cleaned.replace(/\r\n|\r/g, "\n");

    cleaned = cleaned.replace(/>(\s*)\n(\s*)</g, ">$1 $2<");

    cleaned = cleaned.replace(
      /<p[^>]*>\s*(\s{4,}[^<]+|[^<]*font-family[^>]*monospace[^<]*)<\/p>/gi,
      "<pre><code>$1</code></pre>",
    );

    const purified = DOMPurify.sanitize(cleaned, EPUB_SAFE_CONFIG);

    let result = purified;
    preservedCodeBlocks.forEach((codeBlock, placeholder) => {
      const sanitizedCodeBlock = DOMPurify.sanitize(codeBlock, {
        ALLOWED_TAGS: ["pre", "code"],
        ALLOWED_ATTR: ["class"],
        KEEP_CONTENT: true,
        RETURN_DOM: false,
      });
      result = result.replace(placeholder, sanitizedCodeBlock);
    });

    result = result
      .replace(/<p>\s*<\/p>/g, "")
      .replace(/<p>\s*<br[^>]*>\s*<\/p>/g, "<p><br></p>")
      .replace(/<(pre|code)[^>]*>[\s\S]*?<\/\1>/g, (match) => {
        return "___CODE_PRESERVE___" + match + "___/CODE_PRESERVE___";
      });

    result = result.replace(/  +/g, " ");

    result = result.replace(
      /___CODE_PRESERVE___([\s\S]*?)___\/CODE_PRESERVE___/g,
      "$1",
    );

    result = result.replace(/(<\/p>\s*<p>){3,}/gi, "</p><p><br></p><p>");

    return result.trim();
  } catch (error) {
    console.warn("Error cleaning pasted content:", error);

    return DOMPurify.sanitize(html, EPUB_SAFE_CONFIG);
  }
}

function escapeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function plainTextToHtml(text: string): string {
  const parts: string[] = [];
  let consecutiveEmpty = 0;
  for (const line of text.split(/\r\n|\n|\r/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      consecutiveEmpty++;
      if (consecutiveEmpty === 1) parts.push("<p><br></p>");
    } else {
      consecutiveEmpty = 0;
      parts.push(`<p>${escapeText(trimmed)}</p>`);
    }
  }
  return cleanPastedHtml(parts.join(""));
}
