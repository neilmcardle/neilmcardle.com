import { codeToHtml } from 'shiki';

export async function highlightCode(code: string, language: string = 'javascript'): Promise<string> {
  try {
    return await codeToHtml(code, {
      lang: language,
      theme: 'github-dark',
    });
  } catch (error) {
    console.error(`Failed to highlight ${language}:`, error);
    return `<pre><code>${code}</code></pre>`;
  }
}
