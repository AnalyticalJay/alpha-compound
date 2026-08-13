import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildPaymentHistory } from "../shared/paymentHistory";

const orderDetailSource = readFileSync(new URL("../client/src/pages/OrderDetail.tsx", import.meta.url), "utf8");
const adminOrderDetailSource = readFileSync(new URL("../client/src/pages/admin/AdminOrderDetail.tsx", import.meta.url), "utf8");
const adminPaymentsSource = readFileSync(new URL("../client/src/pages/admin/AdminPayments.tsx", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const adminLayoutSource = readFileSync(new URL("../client/src/pages/admin/AdminLayout.tsx", import.meta.url), "utf8");

function baseOrder(overrides: Partial<Parameters<typeof buildPaymentHistory>[0]> = {}) {
  return {
    id: 44,
    totalAmount: "450.00",
    status: "awaiting_payment",
    paymentStatus: "pending",
    paymentMethod: "payfast" as const,
    payfastReference: "AA-44-123",
    createdAt: "2026-08-13T08:00:00.000Z",
    updatedAt: "2026-08-13T08:05:00.000Z",
    reviewedAt: "2026-08-13T08:02:00.000Z",
    ...overrides,
  };
}

describe("payment history", () => {
  it("sorts recorded events chronologically and preserves real references", () => {
    const history = buildPaymentHistory(baseOrder(), [
      { id: 2, orderId: 44, eventType: "payfast_handoff", paymentStatus: "pending", paymentMethod: "payfast", amount: "450.00", reference: "AA-44-123", createdAt: "2026-08-13T08:05:00.000Z" },
      { id: 1, orderId: 44, eventType: "payment_method_selected", paymentStatus: "pending", paymentMethod: "payfast", amount: "450.00", reference: "AA-44-123", createdAt: "2026-08-13T08:03:00.000Z" },
    ]);

    expect(history.map((entry) => entry.eventType)).toEqual(["payment_method_selected", "payfast_handoff"]);
    expect(history[1].reference).toBe("AA-44-123");
    expect(history.every((entry) => entry.source === "recorded")).toBe(true);
  });

  it("derives a transparent legacy snapshot when no event rows exist", () => {
    const history = buildPaymentHistory(baseOrder(), []);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].source).toBe("derived");
    expect(history.some((entry) => entry.description.includes("legacy quote"))).toBe(true);
    expect(history.some((entry) => entry.eventType === "quote_approved")).toBe(true);
    expect(history.some((entry) => entry.eventType === "payment_method_selected")).toBe(true);
  });

  it("mounts the customer and administrator history panels and admin ledger route", () => {
    expect(orderDetailSource).toContain("PaymentHistoryPanel");
    expect(orderDetailSource).toContain('audience="customer"');
    expect(adminOrderDetailSource).toContain('audience="admin"');
    expect(adminPaymentsSource).toContain("Transaction ledger");
    expect(adminPaymentsSource).toContain("adminList");
    expect(adminLayoutSource).toContain('href: "/admin/payments"');
    expect(appSource).toContain('path="/admin/payments"');
  });
});
