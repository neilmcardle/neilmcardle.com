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

  if (sections.length === 0) {
    const lines = mdxSource.split('\n');
    let currentSection: ParsedSection | null = null;
    let currentContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('## ')) {
        if (currentSection) {
          currentSection.content = currentContent.join('\n').trim();
          sections.push(currentSection);
        }

        const title = line.replace(/^## /, '').trim();
        currentSection = { title, content: '' };
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim();
      sections.push(currentSection);
    }
  }

  return sections;
}
