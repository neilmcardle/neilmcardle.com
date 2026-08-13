export interface ParsedSection {
  title: string;
  content: string;
}

export function parseContentIntoSections(mdxSource: string): ParsedSection[] {
  const sections: ParsedSection[] = [];

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

  return sections;
}
