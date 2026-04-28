export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getProduct, isProductActive, type VectorPaintProductId } from '@/lib/vector-paint/products'
import { rasteriseAndUpload } from '@/lib/vector-paint/render'

// UK only for the first release. Expand once tiered shipping rates are in.
const SHIPPING_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = ['GB']

const SHIPPING_AMOUNT_MINOR = 499
const MAX_QUANTITY = 10

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const { svg, productId, quantity: rawQuantity } = (await req.json()) as {
      svg?: string
      productId?: VectorPaintProductId
      quantity?: number
    }

    if (!svg || typeof svg !== 'string' || svg.length < 50) {
      return NextResponse.json({ error: 'Invalid SVG payload' }, { status: 400 })
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

    // Vector Paint's canonical home is neilmcardle.com — distinct from
    // makeEbook.ink which NEXT_PUBLIC_APP_URL points at. We use a dedicated
    // env var so Stripe's back arrow / success page don't drop the customer
    // onto the wrong brand.
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
              name: product.label,
              description: product.description,
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
