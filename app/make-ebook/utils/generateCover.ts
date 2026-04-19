// Canvas-based cover generator. Produces covers that match the 12-book
// grid on the marketing landing page (BookGallerySection): solid background,
// left spine line, centered author surname / rule / serif-bold title / rule
// / "makeEbook" tag.
//
// Pure function. Given title, author, genre, and a color pair, returns a
// PNG data URL the editor can drop straight into the cover field.

export interface CoverPalette {
  name: string;      // human-friendly name shown in the swatch picker
  bg: string;
  fg: string;
}

// Mirrors the 12 palettes used on the marketing gallery, in the same order,
// so the in-editor picker feels like the same "shelf" a visitor saw on
// the landing page.
export const COVER_PALETTES: CoverPalette[] = [
  { name: 'Midnight',   bg: '#1a2540', fg: '#f5ecd5' },
  { name: 'Cinnabar',   bg: '#7a1a1a', fg: '#f5e8c7' },
  { name: 'Vellum',     bg: '#f0e9da', fg: '#3a2d14' },
  { name: 'Forest',     bg: '#0e3a2e', fg: '#e8d7a8' },
  { name: 'Charcoal',   bg: '#2a2a28', fg: '#d4c8a8' },
  { name: 'Rust',       bg: '#8a4d1a', fg: '#f5ecd5' },
  { name: 'Blush',      bg: '#e8d8c0', fg: '#5a2318' },
  { name: 'Slate',      bg: '#232a3d', fg: '#e8c4b0' },
  { name: 'Brass',      bg: '#c8a460', fg: '#1a1a1a' },
  { name: 'Aubergine',  bg: '#3a1a3a', fg: '#f5d9a8' },
  { name: 'Linen',      bg: '#e3ded0', fg: '#1a3a4a' },
  { name: 'Burgundy',   bg: '#5a1a2a', fg: '#f0dcc8' },
];

export interface GenerateCoverArgs {
  title: string;
  author: string;
  genre?: string;           // optional; falls back to "makeEbook" if missing
  palette: CoverPalette;
  width?: number;           // default 1200 — matches useCover's MAX_COVER_WIDTH
  height?: number;          // default 1800 — matches useCover's MAX_COVER_HEIGHT
}

// Render a cover to a canvas and return a PNG data URL. Sized to
// useCover's max dimensions so it slots straight into the editor's cover
// state without re-compression.
export function generateCoverDataUrl(args: GenerateCoverArgs): string {
  const width = args.width ?? 1200;
  const height = args.height ?? 1800;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const { bg, fg } = args.palette;

  // Solid background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle inner shadow on the spine side — mirrors the CSS inset shadow
  // on the marketing covers. Keeps the "printed paperback" feel.
  const spineGrad = ctx.createLinearGradient(0, 0, width * 0.1, 0);
  spineGrad.addColorStop(0, 'rgba(0,0,0,0.22)');
  spineGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spineGrad;
  ctx.fillRect(0, 0, width * 0.1, height);

  // Matching highlight on the front edge
  const edgeGrad = ctx.createLinearGradient(width * 0.92, 0, width, 0);
  edgeGrad.addColorStop(0, 'rgba(255,255,255,0)');
  edgeGrad.addColorStop(1, 'rgba(255,255,255,0.04)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(width * 0.92, 0, width * 0.08, height);

  // Spine hairline — matches the 1px dark line on the marketing covers
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(Math.round(width * 0.05), 0, 1, height);

  // ── Centered content stack ─────────────────────────────────────
  // Text is laid out around the vertical midpoint with fixed offsets,
  // so all 12 palettes produce covers that read as a family.
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const cx = width / 2;
  const cy = height / 2;

  const surname = extractSurname(args.author);
  const tag = (args.genre && args.genre.trim()) ? args.genre.trim() : 'makeEbook';

  // Author surname — small caps, wide tracking, 75% opacity
  const authorFont = `600 ${Math.round(height * 0.022)}px "Helvetica Neue", Arial, sans-serif`;
  drawTrackedText(ctx, surname.toUpperCase(), cx, cy - height * 0.12, authorFont, 6, fg, 0.75);

  // Rule
  drawRule(ctx, cx, cy - height * 0.085, width * 0.055, fg, 0.5);

  // Title — serif bold, large, wraps to up to 3 lines
  const titleFont = `bold ${Math.round(height * 0.052)}px Georgia, "Times New Roman", serif`;
  drawWrappedTitle(ctx, args.title || 'Untitled', cx, cy, width * 0.72, titleFont, fg, 1.05);

  // Rule
  drawRule(ctx, cx, cy + height * 0.085, width * 0.055, fg, 0.5);

  // Genre / makeEbook tag — small caps, wide tracking, 50% opacity
  const tagFont = `600 ${Math.round(height * 0.02)}px "Helvetica Neue", Arial, sans-serif`;
  drawTrackedText(ctx, tag.toUpperCase(), cx, cy + height * 0.12, tagFont, 6, fg, 0.5);

  return canvas.toDataURL('image/png');
}

// —— helpers ────────────────────────────────────────────────────────────

function extractSurname(author: string): string {
  const trimmed = (author || '').trim();
  if (!trimmed) return 'Author';
  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1];
}

// Canvas has no letter-spacing property, so we draw each glyph individually
// with an extra gap between them. Used for small-caps tracking on author +
// tag lines.
function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  font: string,
  tracking: number,
  color: string,
  alpha: number,
) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  const glyphs = Array.from(text);
  const widths = glyphs.map(g => ctx.measureText(g).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(glyphs.length - 1, 0);
  let x = cx - total / 2;
  for (let i = 0; i < glyphs.length; i++) {
    ctx.fillText(glyphs[i], x + widths[i] / 2, cy);
    x += widths[i] + tracking;
  }
  ctx.restore();
}

function drawRule(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  length: number,
  color: string,
  alpha: number,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - length / 2, cy);
  ctx.lineTo(cx + length / 2, cy);
  ctx.stroke();
  ctx.restore();
}

// Word-wrap a title into up to 3 lines, vertically centered on cy.
function drawWrappedTitle(
  ctx: CanvasRenderingContext2D,
  title: string,
  cx: number,
  cy: number,
  maxWidth: number,
  font: string,
  color: string,
  lineHeight: number,
) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;

  const words = title.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);

  // Collapse anything beyond 3 lines into the 3rd with ellipsis
  const MAX = 3;
  if (lines.length > MAX) {
    lines.length = MAX;
    lines[MAX - 1] = lines[MAX - 1].replace(/\s*\S*$/, '') + '…';
  }

  // Measure font size from the font string to compute vertical offsets
  const sizeMatch = /(\d+(?:\.\d+)?)px/.exec(font);
  const size = sizeMatch ? parseFloat(sizeMatch[1]) : 48;
  const step = size * lineHeight;
  const top = cy - ((lines.length - 1) * step) / 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], cx, top + i * step);
  }
  ctx.restore();
}
