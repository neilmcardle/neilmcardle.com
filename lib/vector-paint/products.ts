export type VectorPaintOrientation = "portrait" | "landscape";

export type VectorPaintSize = "small" | "medium" | "large";

export type VectorPaintProductId =
  `canvas_${VectorPaintSize}_${VectorPaintOrientation}`;

export interface VectorPaintProduct {
  id: VectorPaintProductId;
  size: VectorPaintSize;
  sizeLabel: "Small" | "Medium" | "Large";
  orientation: VectorPaintOrientation;
  widthMm: number;
  heightMm: number;
  sellPriceMinor: number;
  quotedCostMinor: number;
  currency: "gbp";
  gelatoProductUid: string;
  fitsAbove: string;
}

export const ORDERS_ENABLED =
  process.env.NEXT_PUBLIC_VECTOR_PAINT_ORDERS === "on";

export const WRAP_MM = 45;
export const PRINT_DPI = 200;
export const MARGIN_FLOOR_MINOR = 500;
const VAT_ALLOWANCE = 1.2;
const STRIPE_FEE_RATE = 0.015;
const STRIPE_FEE_FIXED_MINOR = 20;

const SIZES: Record<
  VectorPaintSize,
  {
    label: VectorPaintProduct["sizeLabel"];
    shortMm: number;
    longMm: number;
    price: number;
    cost: number;
    fitsAbove: string;
  }
> = {
  small: {
    label: "Small",
    shortMm: 300,
    longMm: 400,
    price: 3900,
    cost: 2428,
    fitsAbove: "a bedside table or a bookshelf",
  },
  medium: {
    label: "Medium",
    shortMm: 450,
    longMm: 600,
    price: 5900,
    cost: 3608,
    fitsAbove: "a chest of drawers or a bed",
  },
  large: {
    label: "Large",
    shortMm: 600,
    longMm: 800,
    price: 7900,
    cost: 4808,
    fitsAbove: "a sofa or a fireplace",
  },
};

function build(
  size: VectorPaintSize,
  orientation: VectorPaintOrientation,
): VectorPaintProduct {
  const s = SIZES[size];
  const portrait = orientation === "portrait";
  return {
    id: `canvas_${size}_${orientation}`,
    size,
    sizeLabel: s.label,
    orientation,
    widthMm: portrait ? s.shortMm : s.longMm,
    heightMm: portrait ? s.longMm : s.shortMm,
    sellPriceMinor: s.price,
    quotedCostMinor: s.cost,
    currency: "gbp",
    gelatoProductUid: `canvas_product_cf_${s.shortMm}x${s.longMm}-mm_cm_canvas_cfrm_wood-fsc-4-cm_cl_4-0_${portrait ? "ver" : "hor"}`,
    fitsAbove: s.fitsAbove,
  };
}

export const SIZE_ORDER: VectorPaintSize[] = ["small", "medium", "large"];

export const VECTOR_PAINT_PRODUCTS = Object.fromEntries(
  SIZE_ORDER.flatMap((size) =>
    (["portrait", "landscape"] as const).map((o) => {
      const p = build(size, o);
      return [p.id, p];
    }),
  ),
) as Record<VectorPaintProductId, VectorPaintProduct>;

export function findProduct(
  size: VectorPaintSize,
  orientation: VectorPaintOrientation,
): VectorPaintProduct {
  return VECTOR_PAINT_PRODUCTS[`canvas_${size}_${orientation}`];
}

export function isProductId(value: unknown): value is VectorPaintProductId {
  return typeof value === "string" && value in VECTOR_PAINT_PRODUCTS;
}

export function marginMinor(product: VectorPaintProduct): number {
  const cost = Math.ceil(product.quotedCostMinor * VAT_ALLOWANCE);
  const fee =
    Math.ceil(product.sellPriceMinor * STRIPE_FEE_RATE) +
    STRIPE_FEE_FIXED_MINOR;
  return product.sellPriceMinor - cost - fee;
}

export function formatPrice(minor: number): string {
  return `£${(minor / 100).toFixed(minor % 100 === 0 ? 0 : 2)}`;
}

export function formatCm(product: VectorPaintProduct): string {
  return `${product.widthMm / 10} × ${product.heightMm / 10} cm`;
}
