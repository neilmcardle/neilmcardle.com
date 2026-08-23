import { describe, it, expect } from "vitest";
import { getCurriculum, loadModule } from "./content";
import { PHASES, phaseForModule } from "./curriculum";

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
});

describe("section titles", () => {
  it("keeps apostrophes inside double-quoted titles", async () => {
    const result = await loadModule("m8-react-fundamentals");
    expect(result.sections[0].title).toBe("What's a component?");
  });
});

describe("slug handling", () => {
  it("refuses to read outside the content directory", async () => {
    await expect(loadModule("../../package")).rejects.toThrow();
    await expect(loadModule("..%2F..%2Fpackage")).rejects.toThrow();
    await expect(loadModule("/etc/passwd")).rejects.toThrow();
  });

  it("still loads real slugs", async () => {
    const result = await loadModule("m8-react-fundamentals");
    expect(result.meta.module).toBe(9);
  });
});
