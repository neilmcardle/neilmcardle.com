import { promises as fs } from 'fs'
import path from 'path'

export type AbgBrand = 'avis' | 'budget'
export type AbgPlatform = 'desktop' | 'mobile'

const DESIGN_SYSTEM_ROOT =
  process.env.ABG_FIGMA_LIBRARY_PATH || '/Users/abg-mac/Desktop/MCP Figma'

interface TokenRecord {
  name: string
  key: string
  value: string
  brand: string
  platform: string
  alias?: string
}

function titleCaseBrand(brand: AbgBrand) {
  return brand === 'avis' ? 'Avis' : 'Budget'
}

function brandGuidance(brand: AbgBrand) {
  if (brand === 'avis') {
    return [
      'Use the Avis red accent sparingly for key actions and selected states.',
      'Keep layouts premium, high-contrast, and editorial rather than playful.',
      'Prefer clean white, soft gray, and black foundations with one red focal signal.',
    ]
  }

  return [
    'Use the Budget blue accent to support clarity, trust, and practical actions.',
    'Keep layouts bright, direct, and utility-led rather than luxurious.',
    'Prefer open spacing, crisp cards, and a lighter blue-gray surface system.',
  ]
}

async function readComponentNames(brand: AbgBrand) {
  const componentsDir = path.join(DESIGN_SYSTEM_ROOT, 'packages', brand, 'src', 'components')
  const entries = await fs.readdir(componentsDir)

  return entries
    .filter((entry) => entry.endsWith('.tsx'))
    .map((entry) => entry.replace(/\.tsx$/, ''))
    .sort()
}

export async function getPrototypeGenerationContext(brand: AbgBrand, platform: AbgPlatform) {
  const tokensPath = path.join(
    DESIGN_SYSTEM_ROOT,
    'packages',
    brand,
    'src',
    'generated',
    `${platform}.tokens.ts`
  )

  const file = await fs.readFile(tokensPath, 'utf8')
  const match = file.match(/export const semanticTokens = (\[[\s\S]*?\]);/)

  if (!match) {
    throw new Error(`Unable to parse semantic tokens for ${brand} ${platform}.`)
  }

  const semanticTokens = JSON.parse(match[1]) as TokenRecord[]
  const componentNames = await readComponentNames(brand)

  const tokenSummary = semanticTokens.slice(0, 18).map((token) => ({
    name: token.name,
    key: token.key,
    value: token.value,
    alias: token.alias,
  }))

  return `
ABG design system reference:
- Brand: ${titleCaseBrand(brand)}
- Platform: ${platform}
- Source root: ${DESIGN_SYSTEM_ROOT}
- Available exported components: ${componentNames.join(', ')}
- Design guidance:
${brandGuidance(brand).map((item) => `  - ${item}`).join('\n')}

Reference semantic tokens:
${tokenSummary
  .map((token) => `- ${token.key}: ${token.value}${token.alias ? ` (${token.alias})` : ''}`)
  .join('\n')}
`.trim()
}

export function getAbgTemplateSeed(brand: AbgBrand, platform: AbgPlatform) {
  const brandName = titleCaseBrand(brand)
  const accent = brand === 'avis' ? '#D4002A' : '#006BBF'
  const surface = brand === 'avis' ? '#F4F4F4' : '#F2F5FA'
  const secondary = brand === 'avis' ? '#524D4D' : '#494E57'

  return {
    'app/page.tsx': `export default function PrototypePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 32,
        background: 'linear-gradient(180deg, #ffffff 0%, ${surface} 100%)',
        color: '#000000',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div style={{ display: 'grid', gap: 20, maxWidth: 920 }}>
        <span
          style={{
            width: 'fit-content',
            borderRadius: 999,
            padding: '10px 14px',
            border: '1px solid rgba(0,0,0,0.08)',
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.8)',
          }}
        >
          ${brandName} / ${platform}
        </span>
        <h1 style={{ fontSize: 48, lineHeight: 1, margin: 0 }}>
          ${brandName} design-system starter
        </h1>
        <p style={{ maxWidth: 720, fontSize: 18, lineHeight: 1.7, color: '${secondary}' }}>
          This starter is informed by the local ABG MCP Figma library so prototype work begins closer to the real brand system.
        </p>
      </div>
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
    <title>${brandName} prototype starter</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <main class="prototype-shell">
      <section class="prototype-hero">
        <span class="prototype-kicker">${brandName} / ${platform}</span>
        <h1>${brandName} prototype starter</h1>
        <p>Use this preview surface for quick internal review links while the coded prototype evolves.</p>
        <button class="prototype-button">Primary action</button>
      </section>
      <section class="prototype-grid">
        <article class="prototype-card">
          <h2>Component lane</h2>
          <p>Build around Button, AlertBanner, FilterChip, VehicleCard, and the ABG token rhythm.</p>
        </article>
        <article class="prototype-card">
          <h2>Token lane</h2>
          <p>Use semantic colors and spacing from the MCP Figma export instead of inventing new visual rules.</p>
        </article>
      </section>
    </main>
  </body>
</html>
`,
    'preview/styles.css': `:root {
  color-scheme: light;
  --brand-accent: ${accent};
  --surface-subtle: ${surface};
  --text-primary: #000000;
  --text-secondary: ${secondary};
  --card-radius: 24px;
  --page-padding: 32px;
  font-family: Inter, Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background: linear-gradient(180deg, #ffffff 0%, var(--surface-subtle) 100%);
  color: var(--text-primary);
}

.prototype-shell {
  min-height: 100vh;
  padding: var(--page-padding);
}

.prototype-hero {
  max-width: 920px;
  display: grid;
  gap: 20px;
}

.prototype-kicker {
  display: inline-flex;
  width: fit-content;
  border-radius: 999px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(0,0,0,0.08);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.prototype-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  margin-top: 24px;
}

.prototype-card {
  border-radius: var(--card-radius);
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.08);
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.06);
}

.prototype-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 48px;
  padding: 0 20px;
  border-radius: 999px;
  border: none;
  background: var(--brand-accent);
  color: white;
  font-weight: 600;
}
`,
  }
}
