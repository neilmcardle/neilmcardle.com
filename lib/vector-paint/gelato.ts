import type Stripe from 'stripe'
import type { VectorPaintProduct } from './products'

const GELATO_ORDERS_BASE = 'https://order.gelatoapis.com/v4'

interface GelatoShippingAddress {
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string
  city: string
  postCode: string
  state?: string
  country: string
  email: string
  phone?: string
}

interface GelatoOrderResponse {
  id: string
  orderReferenceId: string
  fulfillmentStatus: string
}

function shippingAddressFromSession(
  session: Stripe.Checkout.Session
): GelatoShippingAddress {
  const details = session.collected_information?.shipping_details
  if (!details?.address || !details.name) {
    throw new Error('Stripe session has no shipping address')
  }
  const [firstName, ...rest] = details.name.split(' ')
  const lastName = rest.join(' ') || firstName

  return {
    firstName,
    lastName,
    addressLine1: details.address.line1 ?? '',
    addressLine2: details.address.line2 ?? undefined,
    city: details.address.city ?? '',
    postCode: details.address.postal_code ?? '',
    state: details.address.state ?? undefined,
    country: details.address.country ?? 'GB',
    email: session.customer_details?.email ?? '',
    phone: session.customer_details?.phone ?? undefined,
  }
}

export async function createGelatoOrder(args: {
  session: Stripe.Checkout.Session
  product: VectorPaintProduct
  printFileUrl: string
}): Promise<GelatoOrderResponse> {
  const apiKey = process.env.GELATO_API_KEY
  if (!apiKey) throw new Error('GELATO_API_KEY not configured')

  const dryRun = process.env.GELATO_DRY_RUN === 'true'

  const body = {
    orderType: 'order',
    orderReferenceId: args.session.id,
    customerReferenceId: args.session.customer_details?.email ?? args.session.id,
    currency: (args.session.currency ?? 'gbp').toUpperCase(),
    items: [
      {
        itemReferenceId: `${args.session.id}-${args.product.id}`,
        productUid: args.product.gelatoProductUid,
        files: [{ type: 'default', url: args.printFileUrl }],
        quantity: 1,
      },
    ],
    shippingAddress: shippingAddressFromSession(args.session),
  }

  if (dryRun) {
    console.log('[Gelato DRY RUN] Would POST /v4/orders:', JSON.stringify(body, null, 2))
    return {
      id: 'dry-run-' + args.session.id,
      orderReferenceId: args.session.id,
      fulfillmentStatus: 'dry_run',
    }
  }

  const res = await fetch(`${GELATO_ORDERS_BASE}/orders`, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gelato order create failed (${res.status}): ${text}`)
  }

  return (await res.json()) as GelatoOrderResponse
}
