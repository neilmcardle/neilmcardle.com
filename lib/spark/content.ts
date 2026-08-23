import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { parseContentIntoSections, type ParsedSection } from "./contentParser";
import {
  phaseForModule,
  readingMinutes,
  resolveThreads,
  type Phase,
  type Thread,
} from "./curriculum";

export interface ModuleMeta {
  slug: string;
  title: string;
  module: number;
  promise: string;
  phase: Phase;
  threads: Thread[];
  sectionCount: number;
  minutes: number;
}

export interface LoadModuleResult {
  meta: ModuleMeta;
  mdxSource: string;
  sections: ParsedSection[];
}

function firstString(...candidates: unknown[]): string {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim())
      return candidate.trim();
  }
  return "";
}

function stripFences(source: string): string {
  return source.replace(/```[\s\S]*?```/g, " ");
}

export function moduleNumberFromSlug(slug: string): number {
  const match = slug.match(/^m(\d+)/);
  return match ? parseInt(match[1], 10) + 1 : 0;
}

export async function loadModule(slug: string): Promise<LoadModuleResult> {
  const modulePath = path.join(
    process.cwd(),
    "content",
    "spark",
    `${slug}.mdx`,
  );

  let raw: string;
  try {
    raw = await fs.readFile(modulePath, "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Module not found: ${slug}`);
    }
    throw error;
  }

  const { data, content: mdxSource } = matter(raw);
  const sections = parseContentIntoSections(mdxSource);

  const moduleNumber =
    typeof data.module === "number" ? data.module : moduleNumberFromSlug(slug);

  const meta: ModuleMeta = {
    slug,
    title: firstString(data.title) || slug,
    module: moduleNumber,
    promise: firstString(data.promise, data.objective, data.subtitle),
    phase: phaseForModule(moduleNumber),
    threads: resolveThreads(data.threads),
    sectionCount: sections.length,
    minutes: readingMinutes(stripFences(mdxSource)),
  };

  return { meta, mdxSource, sections };
}

export async function getAllModules(): Promise<string[]> {
  const contentDir = path.join(process.cwd(), "content", "spark");
  try {
    const files = await fs.readdir(contentDir);
    return files
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.replace(".mdx", ""))
      .sort((a, b) => moduleNumberFromSlug(a) - moduleNumberFromSlug(b));
  } catch {
    return [];
  }
}

export async function getCurriculum(): Promise<ModuleMeta[]> {
  const slugs = await getAllModules();
  const modules: ModuleMeta[] = [];

  for (const slug of slugs) {
    try {
      const loaded = await loadModule(slug);
      modules.push(loaded.meta);
    } catch (error) {
      console.error(`Failed to load module ${slug}:`, error);
    }
  }

  return modules.sort((a, b) => a.module - b.module);
}
