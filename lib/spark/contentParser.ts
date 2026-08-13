export interface ParsedSection {
  title: string;
  content: string;
}

export function parseContentIntoSections(mdxSource: string): ParsedSection[] {
  const sections: ParsedSection[] = [];

  const sectionRegex = /<Section\s+title=["']([^"']+)["'][^>]*>([\s\S]*?)<\/Section>/g;
  let match;

  while ((match = sectionRegex.exec(mdxSource)) !== null) {
    const title = match[1];
    const rawContent = match[2].trim();

    sections.push({
      title,
      content: rawContent,
    });
  }

  return sections;
}
