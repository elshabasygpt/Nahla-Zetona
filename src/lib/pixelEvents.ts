/**
 * Pixel Event Utilities
 * 
 * Import and call these helpers from any client component to fire
 * Facebook & TikTok conversion events automatically.
 *
 * Events supported:
 *   trackViewContent  → when user views a product page
 *   trackAddToCart    → when user adds item to cart
 *   trackInitCheckout → when user starts checkout
 *   trackPurchase     → when order is confirmed (highest value!)
 */

interface ProductEventPayload {
  id: string | number;
  name: string;
  price: number;
  currency?: string;
  quantity?: number;
  category?: string;
}

interface PurchasePayload {
  orderId: string;
  totalAmount: number;
  currency?: string;
  items?: ProductEventPayload[];
}

// ─── Facebook Pixel (fbq) ────────────────────────────────────

function fbTrack(event: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', event, params);
  }
}

// ─── TikTok Pixel (ttq) ─────────────────────────────────────

function ttTrack(event: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.ttq?.track === 'function') {
    window.ttq.track(event, params);
  }
}

// ─── Exported Event Helpers ──────────────────────────────────

/**
 * Fire when user opens a product page.
 * Facebook: ViewContent | TikTok: ViewContent
 */
export function trackViewContent(product: ProductEventPayload) {
  const currency = product.currency || 'EGP';
  fbTrack('ViewContent', {
    content_ids: [String(product.id)],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency,
  });
  ttTrack('ViewContent', {
    content_id: String(product.id),
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency,
  });
}

/**
 * Fire when user clicks "Add to Cart".
 * Facebook: AddToCart | TikTok: AddToCart
 */
export function trackAddToCart(product: ProductEventPayload) {
  const currency = product.currency || 'EGP';
  const quantity = product.quantity || 1;
  fbTrack('AddToCart', {
    content_ids: [String(product.id)],
    content_name: product.name,
    content_type: 'product',
    value: product.price * quantity,
    currency,
    num_items: quantity,
  });
  ttTrack('AddToCart', {
    content_id: String(product.id),
    content_name: product.name,
    content_type: 'product',
    value: product.price * quantity,
    currency,
    quantity,
  });
}

/**
 * Fire when user starts the checkout process.
 * Facebook: InitiateCheckout | TikTok: InitiateCheckout
 */
export function trackInitiateCheckout(totalAmount: number, currency = 'EGP') {
  fbTrack('InitiateCheckout', { value: totalAmount, currency });
  ttTrack('InitiateCheckout', { value: totalAmount, currency });
}

/**
 * Fire after successful order placement — THIS IS THE MOST VALUABLE EVENT.
 * Facebook: Purchase | TikTok: CompletePayment
 */
export function trackPurchase(payload: PurchasePayload) {
  const currency = payload.currency || 'EGP';
  fbTrack('Purchase', {
    order_id: payload.orderId,
    value: payload.totalAmount,
    currency,
    content_type: 'product',
    content_ids: payload.items?.map(i => String(i.id)) || [],
  });
  ttTrack('CompletePayment', {
    order_id: payload.orderId,
    value: payload.totalAmount,
    currency,
    content_type: 'product',
  });
}
