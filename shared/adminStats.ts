export type AdminOrderStatus =
  | "pending"
  | "quote_pending"
  | "quote_approved"
  | "quote_rejected"
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export function countPendingQuotes(orders: Array<{ status: AdminOrderStatus | string }>) {
  return orders.reduce((count, order) => count + (order.status === "quote_pending" ? 1 : 0), 0);
}

export function isPaymentReadyQuote(order: { status: string; paymentStatus?: string | null }) {
  return (order.status === "quote_approved" || order.status === "awaiting_payment") && order.paymentStatus !== "paid";
}

export function countPaymentReadyQuotes(orders: Array<{ status: string; paymentStatus?: string | null }>) {
  return orders.reduce((count, order) => count + (isPaymentReadyQuote(order) ? 1 : 0), 0);
}
