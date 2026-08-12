import { describe, expect, it } from "vitest";
import { buildAdminAnalytics } from "../shared/adminAnalytics";

describe("admin analytics", () => {
  const now = new Date(2026, 7, 12);

  it("summarises quote stages without exposing product prices to unapproved users", () => {
    const analytics = buildAdminAnalytics([
      { status: "quote_pending", paymentStatus: "pending", totalAmount: "1200", createdAt: new Date(2026, 7, 1) },
      { status: "quote_approved", paymentStatus: "pending", totalAmount: "2500", createdAt: new Date(2026, 6, 20) },
      { status: "awaiting_payment", paymentStatus: "awaiting_eft", totalAmount: "800", createdAt: new Date(2026, 5, 20) },
      { status: "paid", paymentStatus: "paid", totalAmount: "3750.50", createdAt: new Date(2026, 7, 5) },
      { status: "quote_rejected", paymentStatus: "failed", totalAmount: "900", createdAt: new Date(2026, 4, 20) },
    ], now);

    expect(analytics.pipeline).toEqual({ submitted: 1, approved: 1, awaitingPayment: 1, paid: 1, rejected: 1 });
    expect(analytics.statusBreakdown.map((item) => item.count)).toEqual([1, 1, 1, 1, 1]);
  });

  it("groups the latest six months and counts paid revenue from payment status", () => {
    const analytics = buildAdminAnalytics([
      { status: "paid", paymentStatus: "paid", totalAmount: "1000", createdAt: new Date(2026, 2, 2) },
      { status: "paid", paymentStatus: "paid", totalAmount: "2500.25", createdAt: new Date(2026, 7, 1) },
      { status: "quote_pending", paymentStatus: "pending", totalAmount: "9999", createdAt: new Date(2026, 7, 2) },
      { status: "paid", paymentStatus: "paid", totalAmount: "400", createdAt: new Date(2025, 11, 31) },
    ], now);

    expect(analytics.monthlyRevenue).toHaveLength(6);
    expect(analytics.monthlyRevenue[0]).toMatchObject({ month: "2026-03", orders: 1, paidOrders: 1, revenue: 1000 });
    expect(analytics.monthlyRevenue[5]).toMatchObject({ month: "2026-08", orders: 2, paidOrders: 1, revenue: 2500.25 });
  });

  it("ignores malformed dates and non-numeric amounts instead of breaking the dashboard", () => {
    const analytics = buildAdminAnalytics([
      { status: "paid", paymentStatus: "paid", totalAmount: "not-a-number", createdAt: "not-a-date" },
      { status: "paid", paymentStatus: "paid", totalAmount: null, createdAt: new Date(2026, 7, 3) },
    ], now);

    expect(analytics.monthlyRevenue[5]).toMatchObject({ orders: 1, paidOrders: 1, revenue: 0 });
  });
});
