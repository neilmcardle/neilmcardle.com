export type VectorPaintProductId =
  | 'canvas_small_portrait'
  | 'canvas_small_landscape'
  | 'canvas_medium_portrait'
  | 'canvas_medium_landscape'
  | 'canvas_large_portrait'
  | 'canvas_large_landscape'

export type VectorPaintProductStatus = 'active' | 'coming_soon'

export type VectorPaintSizeTier = 'small' | 'medium' | 'large'

export type VectorPaintOrientation = 'portrait' | 'landscape'

export interface VectorPaintProduct {
  id: VectorPaintProductId
  label: string
  shortLabel: string
  tier: VectorPaintSizeTier
  tierLabel: 'Small' | 'Medium' | 'Large'
  orientation: VectorPaintOrientation
  description: string
  status: VectorPaintProductStatus
  sellPriceMinor: number
  currency: 'gbp'
  // Drawing canvas aspect ratio (width / height). Each product uses its
  // real-world aspect so the editor matches the physical canvas the
  // customer will receive. Switching size or orientation mid-draw
  // reshapes the pad; existing strokes keep their pixel coordinates
  // (may appear shifted, but not stretched).
  aspect: { w: number; h: number }
  // Visual scale of the editor page relative to the largest product.
  // Same scale across orientations within a tier — the canvas is the
  // same physical area, just rotated.
  sizeScale: number
  // Pixel dimensions of the rendered print file at 300 DPI.
  widthPx: number
  heightPx: number
  dpi: number
  // Canvas thickness fixed at 4 cm (Thick) for a premium gallery feel.
  thickness: 'thick'
  gelatoProductUid: string
}

export const MARGIN_FLOOR_MINOR = 500

export const VECTOR_PAINT_PRODUCTS: Record<VectorPaintProductId, VectorPaintProduct> = {
  canvas_small_portrait: {
    id: 'canvas_small_portrait',
    label: 'Small canvas · 30 × 40 cm',
    shortLabel: '30 × 40 cm',
    tier: 'small',
    tierLabel: 'Small',
    orientation: 'portrait',
    description: '30 × 40 cm (12 × 16 in). Canvas on 4 cm stretcher bars · sides mirror the front edge.',
    status: 'active',
    sellPriceMinor: 2999,
    currency: 'gbp',
    aspect: { w: 30, h: 40 },
    sizeScale: 0.5,
    widthPx: 3543,
    heightPx: 4724,
    dpi: 300,
    thickness: 'thick',
    gelatoProductUid: 'PLACEHOLDER_CANVAS_SMALL_PORTRAIT_UID',
  },
  canvas_small_landscape: {
    id: 'canvas_small_landscape',
    label: 'Small canvas · 40 × 30 cm',
    shortLabel: '40 × 30 cm',
    tier: 'small',
    tierLabel: 'Small',
    orientation: 'landscape',
    description: '40 × 30 cm (16 × 12 in). Canvas on 4 cm stretcher bars · sides mirror the front edge.',
    status: 'active',
    sellPriceMinor: 2999,
    currency: 'gbp',
    aspect: { w: 40, h: 30 },
    sizeScale: 0.5,
    widthPx: 4724,
    heightPx: 3543,
    dpi: 300,
    thickness: 'thick',
    gelatoProductUid: 'PLACEHOLDER_CANVAS_SMALL_LANDSCAPE_UID',
  },
  canvas_medium_portrait: {
    id: 'canvas_medium_portrait',
    label: 'Medium canvas · 50 × 70 cm',
    shortLabel: '50 × 70 cm',
    tier: 'medium',
    tierLabel: 'Medium',
    orientation: 'portrait',
    description: '50 × 70 cm (20 × 28 in). Canvas on 4 cm stretcher bars · sides mirror the front edge.',
    status: 'active',
    sellPriceMinor: 5999,
    currency: 'gbp',
    aspect: { w: 50, h: 70 },
    sizeScale: 0.75,
    widthPx: 5906,
    heightPx: 8268,
    dpi: 300,
    thickness: 'thick',
    gelatoProductUid: 'PLACEHOLDER_CANVAS_MEDIUM_PORTRAIT_UID',
  },
  canvas_medium_landscape: {
    id: 'canvas_medium_landscape',
    label: 'Medium canvas · 70 × 50 cm',
    shortLabel: '70 × 50 cm',
    tier: 'medium',
    tierLabel: 'Medium',
    orientation: 'landscape',
    description: '70 × 50 cm (28 × 20 in). Canvas on 4 cm stretcher bars · sides mirror the front edge.',
    status: 'active',
    sellPriceMinor: 5999,
    currency: 'gbp',
    aspect: { w: 70, h: 50 },
    sizeScale: 0.75,
    widthPx: 8268,
    heightPx: 5906,
    dpi: 300,
    thickness: 'thick',
    gelatoProductUid: 'PLACEHOLDER_CANVAS_MEDIUM_LANDSCAPE_UID',
  },
  canvas_large_portrait: {
    id: 'canvas_large_portrait',
    label: 'Large canvas · 70 × 100 cm',
    shortLabel: '70 × 100 cm',
    tier: 'large',
    tierLabel: 'Large',
    orientation: 'portrait',
    description: '70 × 100 cm (28 × 40 in). Canvas on 4 cm stretcher bars · sides mirror the front edge.',
    status: 'active',
    sellPriceMinor: 9999,
    currency: 'gbp',
    aspect: { w: 70, h: 100 },
    sizeScale: 1.0,
    widthPx: 8268,
    heightPx: 11811,
    dpi: 300,
    thickness: 'thick',
    gelatoProductUid: 'PLACEHOLDER_CANVAS_LARGE_PORTRAIT_UID',
  },
  canvas_large_landscape: {
    id: 'canvas_large_landscape',
    label: 'Large canvas · 100 × 70 cm',
    shortLabel: '100 × 70 cm',
    tier: 'large',
    tierLabel: 'Large',
    orientation: 'landscape',
    description: '100 × 70 cm (40 × 28 in). Canvas on 4 cm stretcher bars · sides mirror the front edge.',
    status: 'active',
    sellPriceMinor: 9999,
    currency: 'gbp',
    aspect: { w: 100, h: 70 },
    sizeScale: 1.0,
    widthPx: 11811,
    heightPx: 8268,
    dpi: 300,
    thickness: 'thick',
    gelatoProductUid: 'PLACEHOLDER_CANVAS_LARGE_LANDSCAPE_UID',
  },
}

export const PRODUCT_ORDER: VectorPaintProductId[] = [
  'canvas_small_portrait',
  'canvas_medium_portrait',
  'canvas_large_portrait',
]

export const DEFAULT_PRODUCT_ID: VectorPaintProductId = 'canvas_large_landscape'

/**
 * Find the matching product variant for a given tier + orientation.
 * Lets the size dropdown and orientation toggle stay independent —
 * each writes a fully-resolved product id to localStorage.
 */
export function findProductByTierAndOrientation(
  tier: VectorPaintSizeTier,
  orientation: VectorPaintOrientation,
): VectorPaintProduct {
  const match = Object.values(VECTOR_PAINT_PRODUCTS).find(
    (p) => p.tier === tier && p.orientation === orientation,
  )
  if (!match) throw new Error(`No product for ${tier} / ${orientation}`)
  return match
}

/** Flip a product to its other-orientation sibling. */
export function flipOrientation(id: VectorPaintProductId): VectorPaintProduct {
  const current = VECTOR_PAINT_PRODUCTS[id]
  const other: VectorPaintOrientation =
    current.orientation === 'portrait' ? 'landscape' : 'portrait'
  return findProductByTierAndOrientation(current.tier, other)
}

export function getProduct(id: VectorPaintProductId): VectorPaintProduct {
  const product = VECTOR_PAINT_PRODUCTS[id]
  if (!product) throw new Error(`Vector Paint product not configured: ${id}`)
  return product
}

export function isProductActive(id: VectorPaintProductId): boolean {
  return VECTOR_PAINT_PRODUCTS[id].status === 'active'
}
