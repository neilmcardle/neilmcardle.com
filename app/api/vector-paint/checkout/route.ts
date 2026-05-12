export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getProduct, isProductActive, type VectorPaintProductId } from '@/lib/vector-paint/products'
import { rasteriseAndUpload } from '@/lib/vector-paint/render'
import { checkOrigin } from '@/lib/auth/checkOrigin'

// UK only for now; expand once tiered shipping rates are in.
const SHIPPING_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = ['GB']

const SHIPPING_AMOUNT_MINOR = 499
const MAX_QUANTITY = 10

const SVG_MIN_BYTES = 200
const SVG_MAX_BYTES = 2_000_000
// Block SVG payloads that smuggle script execution or remote loads. Phase 2
// of SECURITY-FIXES.md adds a Turnstile token + Upstash rate limit.
const SVG_BLOCKLIST = [
  '<script',
  '<foreignobject',
  'xlink:href="http',
  'href="http',
  'data:text/html',
  'javascript:',
]

const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 5
const ipBuckets = new Map<string, { count: number; resetAt: number }>()

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) {
    const first = fwd.split(',')[0]?.trim()
    if (first) return first
  }
  return req.headers.get('x-real-ip') || 'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipBuckets.get(ip)
  if (!entry || now >= entry.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const originError = checkOrigin(req)
  if (originError) return originError

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const ip = getClientIp(req)
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 })
    }

    const { svg, productId, quantity: rawQuantity } = (await req.json()) as {
      svg?: string
      productId?: VectorPaintProductId
      quantity?: number
    }

    if (!svg || typeof svg !== 'string' || svg.length < SVG_MIN_BYTES || svg.length > SVG_MAX_BYTES) {
      return NextResponse.json({ error: 'Invalid SVG payload' }, { status: 400 })
    }
    const lowered = svg.toLowerCase()
    if (SVG_BLOCKLIST.some((token) => lowered.includes(token))) {
      return NextResponse.json({ error: 'Unsupported SVG content' }, { status: 400 })
    }
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
    }
    if (!isProductActive(productId)) {
      return NextResponse.json({ error: 'This product is not available yet.' }, { status: 400 })
    }

    const quantity = Math.max(1, Math.min(MAX_QUANTITY, Math.floor(rawQuantity ?? 1)))

    const product = getProduct(productId)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })

    const { url: printFileUrl, objectPath } = await rasteriseAndUpload(svg, product)

    // Use a dedicated origin so checkout return URLs stay on this product.
    const vectorPaintUrl =
      process.env.NEXT_PUBLIC_VECTOR_PAINT_URL ||
      req.nextUrl.origin ||
      'https://neilmcardle.com'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity,
          price_data: {
            currency: product.currency,
            unit_amount: product.sellPriceMinor,
            product_data: {
              name: `Vector Paint canvas · ${product.shortLabel}`,
              description: `${product.description} A Vector Paint product by Neil McArdle.`,
              images: [printFileUrl],
            },
          },
        },
      ],
      shipping_address_collection: { allowed_countries: SHIPPING_COUNTRIES },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: SHIPPING_AMOUNT_MINOR, currency: product.currency },
            display_name: 'Standard UK delivery',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 10 },
            },
          },
        },
      ],
      phone_number_collection: { enabled: true },
      success_url: `${vectorPaintUrl}/vector-paint/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${vectorPaintUrl}/vector-paint?checkout=canceled`,
      metadata: {
        purchase_type: 'vector_paint_print',
        product_id: product.id,
        print_file_url: printFileUrl,
        print_object_path: objectPath,
        quantity: String(quantity),
      },
    })

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (error: any) {
    console.error('Vector Paint checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}
