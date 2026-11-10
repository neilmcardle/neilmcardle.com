import type Stripe from "stripe";
import type { VectorPaintProduct } from "./products";

const GELATO_ORDERS_BASE = "https://order.gelatoapis.com/v4";
const GELATO_TIMEOUT_MS = 20_000;

export class GelatoUnconfirmedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GelatoUnconfirmedError";
  }
}

interface GelatoShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postCode: string;
  state?: string;
  country: string;
  email: string;
  phone?: string;
}

export interface GelatoOrderResult {
  id: string;
  fulfillmentStatus: string;
  dryRun: boolean;
}

export function isGelatoDryRun(): boolean {
  return process.env.GELATO_DRY_RUN === "true";
}

function shippingAddressFromSession(
  session: Stripe.Checkout.Session,
): GelatoShippingAddress {
  const details = session.collected_information?.shipping_details;
  if (!details?.address || !details.name) {
    throw new Error("Stripe session has no shipping address");
  }
  const [firstName, ...rest] = details.name.trim().split(/\s+/);
  return {
    firstName,
    lastName: rest.join(" ") || firstName,
    addressLine1: details.address.line1 ?? "",
    addressLine2: details.address.line2 ?? undefined,
    city: details.address.city ?? "",
    postCode: details.address.postal_code ?? "",
    state: details.address.state ?? undefined,
    country: details.address.country ?? "GB",
    email: session.customer_details?.email ?? "",
    phone: session.customer_details?.phone ?? undefined,
  };
}

export async function cancelGelatoOrder(gelatoOrderId: string): Promise<void> {
  const apiKey = process.env.GELATO_API_KEY;
  if (!apiKey) throw new Error("GELATO_API_KEY not configured");
  const res = await fetch(
    `${GELATO_ORDERS_BASE}/orders/${encodeURIComponent(gelatoOrderId)}:cancel`,
    {
      method: "POST",
      headers: { "X-API-KEY": apiKey },
      signal: AbortSignal.timeout(GELATO_TIMEOUT_MS),
    },
  );
  if (!res.ok) {
    throw new Error(
      `Gelato cancel failed (${res.status}): ${(await res.text()).slice(0, 300)}`,
    );
  }
}

export async function createGelatoOrder(args: {
  orderId: string;
  session: Stripe.Checkout.Session;
  product: VectorPaintProduct;
  quantity: number;
  printFileUrl: string;
}): Promise<GelatoOrderResult> {
  const body = {
    orderType: "order",
    orderReferenceId: args.orderId,
    customerReferenceId: args.session.customer_details?.email ?? args.orderId,
    currency: "GBP",
    items: [
      {
        itemReferenceId: `${args.orderId}-1`,
        productUid: args.product.gelatoProductUid,
        files: [{ type: "default", url: args.printFileUrl }],
        quantity: args.quantity,
      },
    ],
    shippingAddress: shippingAddressFromSession(args.session),
  };

  if (isGelatoDryRun()) {
    console.log(
      "[Gelato dry run] would POST /v4/orders",
      JSON.stringify({
        ...body,
        customerReferenceId: "[redacted]",
        shippingAddress: "[redacted]",
        items: body.items.map((item) => ({
          ...item,
          files: item.files.map((file) => ({ ...file, url: "[redacted]" })),
        })),
      }),
    );
    return {
      id: `dry-run-${args.orderId}`,
      fulfillmentStatus: "dry_run",
      dryRun: true,
    };
  }

  const apiKey = process.env.GELATO_API_KEY;
  if (!apiKey) throw new Error("GELATO_API_KEY not configured");

  let res: Response;
  try {
    res = await fetch(`${GELATO_ORDERS_BASE}/orders`, {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(GELATO_TIMEOUT_MS),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new GelatoUnconfirmedError(
      `No answer from Gelato (${reason}). Check Gelato for order reference ${args.orderId} before resubmitting.`,
    );
  }
  if (!res.ok) {
    throw new Error(
      `Gelato order create failed (${res.status}): ${(await res.text()).slice(0, 500)}`,
    );
  }
  let json: { id: string; fulfillmentStatus: string };
  try {
    json = (await res.json()) as { id: string; fulfillmentStatus: string };
  } catch {
    throw new GelatoUnconfirmedError(
      `Gelato accepted the request but the reply could not be read. Check Gelato for order reference ${args.orderId} before resubmitting.`,
    );
  }
  return {
    id: json.id,
    fulfillmentStatus: json.fulfillmentStatus,
    dryRun: false,
  };
}
