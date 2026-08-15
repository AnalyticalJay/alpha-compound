/**
 * Disposable write-flow state used only when E2E_TEST_MODE=true.
 * It lives in process memory, is recreated whenever the isolated Playwright
 * server starts, and never opens a database or storage connection.
 */

export const E2E_CUSTOMER_ID = 9901;
export const E2E_ADMIN_ID = 9902;
export const E2E_PRODUCT_ID = 9901;
export const E2E_PRODUCT_SLUG = "e2e-test-compound";

const product = {
  id: E2E_PRODUCT_ID,
  name: "E2E Test Compound",
  slug: E2E_PRODUCT_SLUG,
  description: "Disposable browser-test product.",
  dosageInfo: "Test only",
  price: "100.00",
  stockQuantity: 10,
  isActive: true,
  isFeatured: false,
  categoryId: 9901,
  category: { id: 9901, name: "E2E Category", slug: "e2e-category" },
  images: [{ id: 9901, imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Crect width='100%25' height='100%25' fill='%230ea5e9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='24'%3EE2E%3C/text%3E%3C/svg%3E", isPrimary: true }],
};

type CartItem = {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productPrice: string;
  productStock: number;
  primaryImage: string;
  quantity: number;
};

type E2EOrder = {
  id: number;
  userId: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  totalAmount: string;
  deliveryFee: string;
  deliveryType: "free" | "flat_rate";
  quoteNotes: string | null;
  rejectionReason: string | null;
  payfastReference: string | null;
  eftProofUrl: string | null;
  eftProofKey: string | null;
  eftProofName: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt: Date | null;
  items: Array<{ id: number; productId: number; productName: string; quantity: number; priceAtPurchase: string }>;
  shipping: Record<string, unknown>;
  paymentHistory: Array<Record<string, unknown>>;
  comments: Array<Record<string, unknown>>;
};

const carts = new Map<number, CartItem[]>();
const orders = new Map<number, E2EOrder>();
let nextOrderId = 42001;

export function resetE2EStore() {
  carts.clear();
  orders.clear();
  nextOrderId = 42001;
}

export function isE2ETestMode() {
  return process.env.E2E_TEST_MODE === "true";
}

export function getE2EProductBySlug(slug: string) {
  return slug === E2E_PRODUCT_SLUG ? product : null;
}

export function getE2ECart(userId: number) {
  return carts.get(userId) ?? [];
}

export function upsertE2ECart(userId: number, productId: number, quantity: number) {
  if (productId !== E2E_PRODUCT_ID) throw new Error("E2E product not found");
  const items = getE2ECart(userId).filter((item) => item.productId !== productId);
  items.push({
    id: E2E_PRODUCT_ID,
    productId,
    productName: product.name,
    productSlug: product.slug,
    productPrice: product.price,
    productStock: product.stockQuantity,
    primaryImage: product.images[0].imageUrl,
    quantity,
  });
  carts.set(userId, items);
}

export function clearE2ECart(userId: number) {
  carts.set(userId, []);
}

export function createE2EQuote(userId: number, input: { shipping: Record<string, unknown>; notes?: string }) {
  const items = getE2ECart(userId);
  if (!items.length) throw new Error("Quote cart is empty");
  const subtotal = items.reduce((sum, item) => sum + Number(item.productPrice) * item.quantity, 0);
  const deliveryFee = String(input.shipping.city).toLowerCase().includes("port elizabeth") ? 0 : 150;
  const id = nextOrderId++;
  const now = new Date();
  const order: E2EOrder = {
    id,
    userId,
    status: "quote_pending",
    paymentStatus: "pending",
    paymentMethod: null,
    totalAmount: (subtotal + deliveryFee).toFixed(2),
    deliveryFee: deliveryFee.toFixed(2),
    deliveryType: deliveryFee === 0 ? "free" : "flat_rate",
    quoteNotes: input.notes ?? null,
    rejectionReason: null,
    payfastReference: null,
    eftProofUrl: null,
    eftProofKey: null,
    eftProofName: null,
    createdAt: now,
    updatedAt: now,
    reviewedAt: null,
    items: items.map((item) => ({ id: item.id, productId: item.productId, productName: item.productName, quantity: item.quantity, priceAtPurchase: item.productPrice })),
    shipping: { ...input.shipping, shippingStatus: "pending", courierName: null, trackingNumber: null, trackingUrl: null, shippingNotes: null },
    paymentHistory: [{ id: 1, eventType: "quote_submitted", paymentStatus: "pending", createdAt: now, note: "Disposable E2E quote submitted." }],
    comments: [],
  };
  orders.set(id, order);
  clearE2ECart(userId);
  return { quoteId: id, total: order.totalAmount, deliveryFee: order.deliveryFee, status: "quote_pending" as const };
}

export function getE2EOrder(orderId: number) {
  return orders.get(orderId) ?? null;
}

export function getE2EOrdersForUser(userId: number) {
  return Array.from(orders.values()).filter((order) => order.userId === userId);
}

export function getAllE2EOrders() {
  return Array.from(orders.values());
}

export function updateE2EOrderStatus(orderId: number, status: string) {
  const order = getE2EOrder(orderId);
  if (!order) throw new Error("Order not found");
  order.status = status;
  order.reviewedAt = status === "quote_approved" ? new Date() : order.reviewedAt;
  order.updatedAt = new Date();
  order.paymentHistory.push({ id: order.paymentHistory.length + 1, eventType: status, paymentStatus: order.paymentStatus, createdAt: order.updatedAt, note: `Disposable E2E status updated to ${status}.` });
}

export function chooseE2EPayment(orderId: number, userId: number, method: "eft" | "payfast") {
  const order = getE2EOrder(orderId);
  if (!order || order.userId !== userId) throw new Error("Order not found");
  if (order.status !== "quote_approved") throw new Error("Quote must be approved before payment");
  order.status = "awaiting_payment";
  order.paymentMethod = method;
  order.paymentStatus = method === "eft" ? "awaiting_eft" : "pending";
  order.updatedAt = new Date();
  order.paymentHistory.push({ id: order.paymentHistory.length + 1, eventType: "payment_method_selected", paymentStatus: order.paymentStatus, paymentMethod: method, createdAt: order.updatedAt, note: `Disposable E2E payment method selected: ${method}.` });
  return {
    success: true,
    orderId,
    method,
    payfastReference: method === "payfast" ? `E2E-${orderId}` : null,
  };
}

export function uploadE2EProof(orderId: number, userId: number, fileName: string) {
  const order = getE2EOrder(orderId);
  if (!order || order.userId !== userId) throw new Error("Order not found");
  if (order.status !== "awaiting_payment" || order.paymentMethod !== "eft") throw new Error("EFT is not ready for this quote");
  order.eftProofName = fileName;
  order.eftProofKey = `e2e/${orderId}/${fileName}`;
  order.eftProofUrl = `/e2e-storage/${order.eftProofKey}`;
  order.paymentStatus = "awaiting_eft";
  order.updatedAt = new Date();
  order.paymentHistory.push({ id: order.paymentHistory.length + 1, eventType: "eft_proof_uploaded", paymentStatus: order.paymentStatus, createdAt: order.updatedAt, note: `Disposable E2E proof uploaded: ${fileName}.` });
  return { success: true, url: order.eftProofUrl, fileName };
}
