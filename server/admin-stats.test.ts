import { describe, expect, it } from "vitest";
import { countPendingQuotes, countPaymentReadyQuotes, isPaymentReadyQuote } from "../shared/adminStats";

describe("countPendingQuotes", () => {
  it("counts only quote requests awaiting review", () => {
    expect(
      countPendingQuotes([
        { status: "quote_pending" },
        { status: "quote_approved" },
        { status: "paid" },
        { status: "quote_pending" },
      ]),
    ).toBe(2);
  });

  it("returns zero when there are no pending quotes", () => {
    expect(countPendingQuotes([{ status: "quote_rejected" }, { status: "paid" }])).toBe(0);
  });

  it("counts approved quotes that still need payment", () => {
    expect(countPaymentReadyQuotes([
      { status: "quote_approved", paymentStatus: "pending" },
      { status: "awaiting_payment", paymentStatus: "pending" },
      { status: "paid", paymentStatus: "paid" },
      { status: "quote_rejected", paymentStatus: "pending" },
    ])).toBe(2);
    expect(isPaymentReadyQuote({ status: "quote_approved", paymentStatus: "pending" })).toBe(true);
    expect(isPaymentReadyQuote({ status: "quote_approved", paymentStatus: "paid" })).toBe(false);
  });
});
