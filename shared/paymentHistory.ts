export type PaymentHistoryEventType =
  | "quote_submitted"
  | "quote_approved"
  | "quote_rejected"
  | "payment_method_selected"
  | "payfast_handoff"
  | "payment_received"
  | "payment_failed"
  | "eft_proof_uploaded";

export type PaymentHistoryEventLike = {
  id: number | string;
  orderId: number;
  eventType: string;
  paymentStatus: string;
  paymentMethod?: "eft" | "payfast" | null;
  amount?: string | number | null;
  reference?: string | null;
  note?: string | null;
  actorUserId?: number | null;
  createdAt: Date | string;
};

export type PaymentHistoryOrderLike = {
  id: number;
  totalAmount: string | number;
  status: string;
  paymentStatus: string;
  paymentMethod?: "eft" | "payfast" | null;
  payfastReference?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
  reviewedAt?: Date | string | null;
};

export type PaymentHistoryEntry = PaymentHistoryEventLike & {
  label: string;
  description: string;
  source: "recorded" | "derived";
};

export const PAYMENT_EVENT_LABELS: Record<string, string> = {
  quote_submitted: "Quote submitted",
  quote_approved: "Quote approved",
  quote_rejected: "Quote rejected",
  payment_method_selected: "Payment method selected",
  payfast_handoff: "PayFast handoff started",
  payment_received: "Payment received",
  payment_failed: "Payment failed",
  eft_proof_uploaded: "EFT proof uploaded",
};

function formatMethod(method?: string | null) {
  return method === "payfast" ? "PayFast" : method === "eft" ? "EFT" : "payment";
}

function describeEvent(eventType: string, paymentStatus: string, paymentMethod?: string | null) {
  if (eventType === "quote_submitted") return "Your quote request was recorded for review.";
  if (eventType === "quote_approved") return "An administrator approved this quote for payment.";
  if (eventType === "quote_rejected") return "An administrator rejected this quote.";
  if (eventType === "payment_method_selected") return `${formatMethod(paymentMethod)} was selected for this quote.`;
  if (eventType === "payfast_handoff") return "The secure PayFast payment handoff was prepared.";
  if (eventType === "payment_received") return `${formatMethod(paymentMethod)} payment was received and recorded.`;
  if (eventType === "payment_failed") return `${formatMethod(paymentMethod)} payment was not completed.`;
  if (eventType === "eft_proof_uploaded") return "Customer uploaded proof of payment for administrative verification.";
  return `Payment status updated to ${paymentStatus.replaceAll("_", " ")}.`;
}

function eventTimestamp(value: Date | string | null | undefined) {
  return value ? new Date(value) : new Date(0);
}

export function buildPaymentHistory(
  order: PaymentHistoryOrderLike,
  events: PaymentHistoryEventLike[],
): PaymentHistoryEntry[] {
  if (events.length > 0) {
    return events
      .map((event) => ({
        ...event,
        label: PAYMENT_EVENT_LABELS[event.eventType] ?? "Payment status updated",
        description: event.note || describeEvent(event.eventType, event.paymentStatus, event.paymentMethod),
        source: "recorded" as const,
      }))
      .sort((a, b) => eventTimestamp(a.createdAt).getTime() - eventTimestamp(b.createdAt).getTime());
  }

  const derived: PaymentHistoryEntry[] = [
    {
      id: `derived-submitted-${order.id}`,
      orderId: order.id,
      eventType: "quote_submitted",
      paymentStatus: "pending",
      paymentMethod: null,
      amount: order.totalAmount,
      reference: null,
      note: null,
      actorUserId: null,
      createdAt: order.createdAt,
      label: PAYMENT_EVENT_LABELS.quote_submitted,
      description: "This legacy quote predates event logging; the entry is derived from the original quote timestamp.",
      source: "derived",
    },
  ];

  const quoteWasApproved = ["quote_approved", "awaiting_payment", "paid", "processing", "shipped", "completed"].includes(order.status);
  const reviewEventType = quoteWasApproved ? "quote_approved" : order.status === "quote_rejected" ? "quote_rejected" : null;
  if (order.reviewedAt && reviewEventType) {
    derived.push({
      id: `derived-review-${order.id}`,
      orderId: order.id,
      eventType: reviewEventType,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod ?? null,
      amount: order.totalAmount,
      reference: null,
      note: null,
      actorUserId: null,
      createdAt: order.reviewedAt,
      label: PAYMENT_EVENT_LABELS[reviewEventType] ?? "Quote reviewed",
      description: reviewEventType === "quote_approved" ? "The quote was approved before payment-event logging was enabled." : "The quote was rejected before payment-event logging was enabled.",
      source: "derived",
    });
  }

  if (order.paymentMethod) {
    derived.push({
      id: `derived-payment-${order.id}`,
      orderId: order.id,
      eventType: order.paymentStatus === "paid" ? "payment_received" : order.paymentStatus === "failed" ? "payment_failed" : "payment_method_selected",
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      amount: order.totalAmount,
      reference: order.payfastReference ?? null,
      note: null,
      actorUserId: null,
      createdAt: order.updatedAt ?? order.createdAt,
      label: PAYMENT_EVENT_LABELS[order.paymentStatus === "paid" ? "payment_received" : order.paymentStatus === "failed" ? "payment_failed" : "payment_method_selected"],
      description: `Current ${formatMethod(order.paymentMethod)} state derived from the quote record; future changes will be recorded as events.`,
      source: "derived",
    });
  }

  return derived.sort((a, b) => eventTimestamp(a.createdAt).getTime() - eventTimestamp(b.createdAt).getTime());
}
