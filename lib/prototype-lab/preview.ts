import type { PrototypeFileMap } from '@/lib/db/schema'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function buildPrototypePreviewDocument(files: PrototypeFileMap) {
  const html = files['preview/index.html']
  const css = files['preview/styles.css'] || ''
  const js = files['preview/script.js'] || ''

  if (html) {
    return html
      .replace('</head>', `<style>${css}</style></head>`)
      .replace('</body>', `${js ? `<script>${js}</script>` : ''}</body>`)
  }

  const pageSource = files['app/page.tsx'] || '// No preview content available yet.'

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Prototype Preview</title>
    <style>
      body { margin: 0; padding: 32px; font-family: Inter, Arial, sans-serif; background: #f7f7f5; color: #111111; }
      .shell { display: grid; gap: 20px; }
      .card { border-radius: 24px; border: 1px solid rgba(0, 0, 0, 0.08); background: #fff; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.06); }
      pre { white-space: pre-wrap; line-height: 1.7; font-size: 13px; }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="card">
        <h1>Preview not generated yet</h1>
        <p>The latest version has code files, but no preview HTML. Showing the source for now.</p>
      </section>
      <section class="card">
        <pre><code>${escapeHtml(pageSource)}</code></pre>
      </section>
    </main>
  </body>
</html>`
}
