export interface ParsedContent {
  type: 'text' | 'component';
  value: string;
}

export interface ParsedSection {
  title: string;
  content: string;
  components: string[];
}

export function parseContentIntoSections(mdxSource: string): ParsedSection[] {
  const sections: ParsedSection[] = [];

  const sectionRegex = /<Section\s+title=["']([^"']+)["'][^>]*>([\s\S]*?)<\/Section>/g;
  let match;

  while ((match = sectionRegex.exec(mdxSource)) !== null) {
    const title = match[1];
    const rawContent = match[2].trim();

    const components = extractComponents(rawContent);

    sections.push({
      title,
      content: rawContent,
      components,
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
          currentSection.components = extractComponents(currentSection.content);
          sections.push(currentSection);
        }

        const title = line.replace(/^## /, '').trim();
        currentSection = { title, content: '', components: [] };
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim();
      currentSection.components = extractComponents(currentSection.content);
      sections.push(currentSection);
    }
  }

  return sections;
}

function extractComponents(content: string): string[] {
  const componentRegex = /<(\w+)\s*\/>/g;
  const components: string[] = [];
  let match;

  while ((match = componentRegex.exec(content)) !== null) {
    components.push(match[1]);
  }

  return components;
}
