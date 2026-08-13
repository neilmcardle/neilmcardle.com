import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export interface ModuleFrontmatter {
  title: string;
  module: number;
  phase: string;
  promise: string;
  threads: string[];
}

export interface Section {
  title: string;
  index: number;
}

export interface LoadModuleResult {
  frontmatter: ModuleFrontmatter;
  mdxSource: string;
  sections: Section[];
}

export async function loadModule(slug: string): Promise<LoadModuleResult> {
  const modulePath = path.join(process.cwd(), 'content', 'spark', `${slug}.mdx`);

  try {
    const content = await fs.readFile(modulePath, 'utf-8');
    const { data, content: mdxContent } = matter(content);

    const frontmatter = data as ModuleFrontmatter;

    const sections = extractSections(mdxContent);

    return {
      frontmatter,
      mdxSource: mdxContent,
      sections,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Module not found: ${slug}`);
    }
    throw error;
  }
}

function extractSections(mdxContent: string): Section[] {
  const lines = mdxContent.split('\n');
  const sections: Section[] = [];
  let index = 0;

  for (const line of lines) {
    const match = line.match(/^<Section\s+title=["']([^"']+)["']/);
    if (match) {
      sections.push({
        title: match[1],
        index,
      });
      index++;
    }
  }

  return sections;
}

export async function getAllModules(): Promise<string[]> {
  const contentDir = path.join(process.cwd(), 'content', 'spark');
  try {
    const files = await fs.readdir(contentDir);
    return files
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => f.replace('.mdx', ''))
      .sort();
  } catch {
    return [];
  }
}
