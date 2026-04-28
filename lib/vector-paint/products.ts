export type VectorPaintProductId = 'a4_print' | 'canvas' | 'sticker_sheet' | 'mug'

export interface VectorPaintProduct {
  id: VectorPaintProductId
  label: string
  description: string
  sellPriceMinor: number
  currency: 'gbp'
  widthPx: number
  heightPx: number
  dpi: number
  // Gelato product UID — fetch from Gelato catalogue API and paste here.
  gelatoProductUid: string
}

export const MARGIN_FLOOR_MINOR = 500

export const VECTOR_PAINT_PRODUCTS: Partial<Record<VectorPaintProductId, VectorPaintProduct>> = {
  a4_print: {
    id: 'a4_print',
    label: 'A4 fine art print',
    description: 'Museum-quality 200gsm matte print, A4 (210 × 297 mm).',
    sellPriceMinor: 1499,
    currency: 'gbp',
    widthPx: 2480,
    heightPx: 3508,
    dpi: 300,
    // TODO: replace with real Gelato product UID from /v3/catalogs/posters/products
    gelatoProductUid: 'PLACEHOLDER_A4_PRINT_UID',
  },
}

export function getProduct(id: VectorPaintProductId): VectorPaintProduct {
  const product = VECTOR_PAINT_PRODUCTS[id]
  if (!product) throw new Error(`Vector Paint product not configured: ${id}`)
  return product
}
