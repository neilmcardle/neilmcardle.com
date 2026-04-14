import type { PrototypeFileMap } from '@/lib/db/schema'
import {
  getAbgTemplateSeed,
  type AbgBrand,
  type AbgPlatform,
} from '@/lib/prototype-lab/abg-design-system'

export interface PrototypeTemplate {
  key: string
  name: string
  description: string
  files: PrototypeFileMap
}

const BLANK_NEXT_FILES: PrototypeFileMap = {
  'app/page.tsx': `export default function PrototypePage() {
  return (
    <main style={{ padding: 32, fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 40, marginBottom: 12 }}>New prototype</h1>
      <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 640 }}>
        Start shaping your idea here. Replace this screen, add routes, and wire
        in your real components as the prototype evolves.
      </p>
    </main>
  );
}
`,
  'app/layout.tsx': `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
  'preview/index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Prototype preview</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <main class="prototype-shell">
      <div class="prototype-card">
        <span class="prototype-kicker">Internal prototype</span>
        <h1>New prototype</h1>
        <p>Use this preview for quick internal sharing while the coded files evolve.</p>
      </div>
    </main>
  </body>
</html>
`,
  'preview/styles.css': `:root {
  font-family: Inter, Arial, sans-serif;
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f7f7f5;
  color: #111111;
}

.prototype-shell {
  min-height: 100vh;
  padding: 32px;
}

.prototype-card {
  max-width: 760px;
  border-radius: 24px;
  border: 1px solid rgba(0,0,0,0.08);
  background: white;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.06);
}

.prototype-kicker {
  display: inline-flex;
  width: fit-content;
  border-radius: 999px;
  padding: 10px 14px;
  background: #f3f4f6;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
`,
}

const EXPERIMENT_FILES: PrototypeFileMap = {
  'app/page.tsx': `const options = [
  {
    title: 'Variation A',
    body: 'Use this column to describe the control experience and what should stay consistent.',
  },
  {
    title: 'Variation B',
    body: 'Use this column to describe the proposed change and the behavior you expect to improve.',
  },
];

export default function ExperimentPrototype() {
  return (
    <main style={{ padding: 32, fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 36, marginBottom: 12 }}>Experiment prototype</h1>
      <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 720, marginBottom: 32 }}>
        Compare, discuss, and iterate on test ideas before handing them over for build.
      </p>

      <section
        style={{
          display: 'grid',
          gap: 24,
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        {options.map((option) => (
          <article
            key={option.title}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 20,
              padding: 24,
              background: '#fff',
            }}
          >
            <h2 style={{ fontSize: 24, marginBottom: 12 }}>{option.title}</h2>
            <p style={{ fontSize: 16, lineHeight: 1.7 }}>{option.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
`,
  'app/layout.tsx': BLANK_NEXT_FILES['app/layout.tsx'],
  'preview/index.html': BLANK_NEXT_FILES['preview/index.html'],
  'preview/styles.css': BLANK_NEXT_FILES['preview/styles.css'],
}

function buildAbgTemplate(brand: AbgBrand, platform: AbgPlatform): PrototypeTemplate {
  const label = brand === 'avis' ? 'Avis' : 'Budget'

  return {
    key: `${brand}-${platform}`,
    name: `${label} ${platform} starter`,
    description: `An ABG prototype seed informed by the local ${label} Figma MCP library.`,
    files: getAbgTemplateSeed(brand, platform),
  }
}

export const prototypeTemplates: PrototypeTemplate[] = [
  {
    key: 'blank-next',
    name: 'Blank Next.js canvas',
    description: 'A minimal React + App Router starting point for fresh concepts.',
    files: BLANK_NEXT_FILES,
  },
  {
    key: 'experiment-idea',
    name: 'Experiment concept',
    description: 'A lightweight starting point for A/B concepts and stakeholder reviews.',
    files: EXPERIMENT_FILES,
  },
  buildAbgTemplate('avis', 'desktop'),
  buildAbgTemplate('avis', 'mobile'),
  buildAbgTemplate('budget', 'desktop'),
  buildAbgTemplate('budget', 'mobile'),
]

export function getPrototypeTemplate(templateKey: string): PrototypeTemplate {
  return (
    prototypeTemplates.find((template) => template.key === templateKey) ??
    prototypeTemplates[0]
  )
}
