export interface ParsedSection {
  id: string;
  title: string;
  content: string;
  components: string[];
}

function slugify(title: string, index: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${base}-${index + 1}` : `section-${index + 1}`;
}

function fromSectionTags(mdxSource: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const sectionRegex =
    /<Section\s+title=(["'])((?:(?!\1)[\s\S])*?)\1[^>]*>([\s\S]*?)<\/Section>/g;
  let match;

  while ((match = sectionRegex.exec(mdxSource)) !== null) {
    const content = match[3].trim();
    sections.push({
      id: slugify(match[2], sections.length),
      title: match[2],
      content,
      components: extractComponents(content),
    });
  }

  return sections;
}

const PREAMBLE_TITLE = "Before you start";

function fromHeadings(mdxSource: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = mdxSource.split("\n");

  let title: string | null = null;
  let buffer: string[] = [];
  let fenced = false;

  const push = (sectionTitle: string, body: string[]) => {
    const content = body.join("\n").trim();
    if (!content) return;
    sections.push({
      id: slugify(sectionTitle, sections.length),
      title: sectionTitle,
      content,
      components: extractComponents(content),
    });
  };

  const flush = () => push(title ?? PREAMBLE_TITLE, buffer);

  for (const line of lines) {
    if (line.trimStart().startsWith("```")) fenced = !fenced;

    if (!fenced && line.startsWith("## ")) {
      flush();
      title = line.replace(/^##\s+/, "").trim();
      buffer = [];
      continue;
    }

    if (!fenced && title === null && line.startsWith("# ")) continue;

    buffer.push(line);
  }

  flush();
  return sections;
}

export function parseContentIntoSections(mdxSource: string): ParsedSection[] {
  const tagged = fromSectionTags(mdxSource);
  if (tagged.length > 0) return tagged;
  return fromHeadings(mdxSource);
}

function extractComponents(content: string): string[] {
  const componentRegex = /<(\w+)[^>]*\/>/g;
  const components: string[] = [];
  let match;

  while ((match = componentRegex.exec(content)) !== null) {
    if (!components.includes(match[1])) components.push(match[1]);
  }

  return components;
}
