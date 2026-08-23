import { describe, it, expect } from "vitest";
import { getCurriculum, loadModule } from "./content";
import { PHASES, THREADS, phaseForModule, resolveThreads } from "./curriculum";

describe("loadModule", () => {
  it("normalises frontmatter into meta", async () => {
    const result = await loadModule("m0-make-a-real-file-yours");
    expect(result.meta.title).toBeTruthy();
    expect(result.meta.module).toBe(1);
    expect(result.meta.phase.id).toBe("foundations");
    expect(result.meta.minutes).toBeGreaterThan(0);
  });

  it("returns raw mdx body", async () => {
    const result = await loadModule("m0-make-a-real-file-yours");
    expect(typeof result.mdxSource).toBe("string");
    expect(result.mdxSource.length).toBeGreaterThan(0);
  });

  it("parses Section-tagged modules", async () => {
    const result = await loadModule("m8-react-fundamentals");
    expect(result.sections.length).toBeGreaterThan(0);
    result.sections.forEach((section) => {
      expect(section.title).toBeTruthy();
      expect(section.id).toBeTruthy();
    });
  });

  it("parses heading-tagged modules", async () => {
    const result = await loadModule("m10-design-systems-in-code");
    expect(result.sections.length).toBeGreaterThan(0);
    expect(result.sections[0].title).toBe("Premise");
  });

  it("falls back to objective when promise is absent", async () => {
    const result = await loadModule("m10-design-systems-in-code");
    expect(result.meta.promise).toBeTruthy();
  });

  it("throws on missing module", async () => {
    await expect(loadModule("nonexistent-module")).rejects.toThrow();
  });
});

describe("curriculum", () => {
  it("gives every module a phase", async () => {
    const modules = await getCurriculum();
    expect(modules.length).toBeGreaterThan(0);
    modules.forEach((mod) => {
      expect(PHASES.some((p) => p.id === mod.phase.id)).toBe(true);
    });
  });

  it("orders modules by number", async () => {
    const modules = await getCurriculum();
    const numbers = modules.map((m) => m.module);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  it("maps module numbers onto phases", () => {
    expect(phaseForModule(1).id).toBe("foundations");
    expect(phaseForModule(9).id).toBe("js-react");
    expect(phaseForModule(19).id).toBe("capstone");
  });

  it("resolves thread aliases and ignores unknown ones", () => {
    const threads = resolveThreads([
      "chosen-vs-fixed",
      "design-in-the-browser / Figma↔code",
      "not-a-real-thread",
    ]);
    expect(threads.map((t) => t.id)).toEqual([
      "chosen-vs-fixed",
      "design-in-the-browser",
    ]);
  });
});

describe("section titles", () => {
  it("keeps apostrophes inside double-quoted titles", async () => {
    const result = await loadModule("m8-react-fundamentals");
    expect(result.sections[0].title).toBe("What's a component?");
  });
});

describe("threads", () => {
  it("collapses the two names for the same idea into one thread", () => {
    const threads = resolveThreads([
      "your-code-vs-the-platform",
      "language-vs-framework",
    ]);
    expect(threads).toHaveLength(1);
    expect(threads[0].id).toBe("which-machine");
  });

  it("gives every thread a plain question and a concrete example", () => {
    THREADS.forEach((thread) => {
      expect(thread.question.endsWith("?")).toBe(true);
      expect(thread.example.length).toBeGreaterThan(20);
    });
  });

  it("keeps the old frontmatter spellings working", () => {
    expect(resolveThreads(["craft-is-the-differentiator"])[0].id).toBe(
      "where-craft-shows",
    );
    expect(resolveThreads(["chosen-vs-fixed"])[0].id).toBe("chosen-vs-fixed");
  });
});
