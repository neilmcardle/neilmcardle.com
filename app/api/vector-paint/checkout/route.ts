export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getProduct, type VectorPaintProductId } from '@/lib/vector-paint/products'
import { rasteriseAndUpload } from '@/lib/vector-paint/render'

const SHIPPING_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = [
  'GB', 'IE', 'US', 'CA', 'AU', 'NZ',
  'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'SE', 'DK', 'NO', 'FI', 'PT', 'AT', 'CH',
]

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const { svg, productId } = (await req.json()) as {
      svg?: string
      productId?: VectorPaintProductId
    }

    if (!svg || typeof svg !== 'string' || svg.length < 50) {
      return NextResponse.json({ error: 'Invalid SVG payload' }, { status: 400 })
    }
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
    }

    const product = getProduct(productId)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })

    const { url: printFileUrl, objectPath } = await rasteriseAndUpload(svg, product)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
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
      phone_number_collection: { enabled: true },
      success_url: `${appUrl}/vector-paint/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/vector-paint?checkout=canceled`,
      metadata: {
        purchase_type: 'vector_paint_print',
        product_id: product.id,
        print_file_url: printFileUrl,
        print_object_path: objectPath,
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
