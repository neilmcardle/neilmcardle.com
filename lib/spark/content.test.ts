import { describe, it, expect } from 'vitest';
import { loadModule } from './content';

describe('loadModule', () => {
  it('parses frontmatter correctly', async () => {
    const result = await loadModule('m0-make-a-real-file-yours');
    expect(result.frontmatter).toBeDefined();
    expect(result.frontmatter.title).toBeTruthy();
    expect(result.frontmatter.module).toBe(0);
    expect(result.frontmatter.phase).toBeDefined();
  });

  it('returns raw mdx body for next-mdx-remote', async () => {
    const result = await loadModule('m0-make-a-real-file-yours');
    expect(typeof result.mdxSource).toBe('string');
    expect(result.mdxSource.length).toBeGreaterThan(0);
  });

  it('extracts sections in order', async () => {
    const result = await loadModule('m0-make-a-real-file-yours');
    expect(result.sections).toBeInstanceOf(Array);
    expect(result.sections.length).toBeGreaterThan(0);
    result.sections.forEach((section) => {
      expect(section.title).toBeTruthy();
      expect(typeof section.index).toBe('number');
    });
  });

  it('throws on missing module', async () => {
    await expect(loadModule('nonexistent-module')).rejects.toThrow();
  });
});
