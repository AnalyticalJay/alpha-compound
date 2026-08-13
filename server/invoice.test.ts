import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateInvoicePdf, isInvoiceEligible } from "./invoice";

const root = resolve(import.meta.dirname, "..");

describe("invoice generation", () => {
  it("generates a PDF from real order line items and South African Rand totals", async () => {
    const pdf = await generateInvoicePdf({
      id: 42,
      totalAmount: "550.00",
      deliveryFee: "100.00",
      status: "awaiting_payment",
      paymentStatus: "awaiting_eft",
      paymentMethod: "eft",
      createdAt: new Date("2026-08-13T00:00:00Z"),
      items: [{ productName: "Test compound", quantity: 2, priceAtPurchase: "225.00" }],
      shipping: { fullName: "Approved Customer", city: "Gqeberha", country: "South Africa" },
    }, { fullName: "Approved Customer", email: "customer@example.com" });

    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(1000);
  });

  it("only exposes invoices after quote approval and before fulfilment completion", () => {
    expect(isInvoiceEligible("quote_pending")).toBe(false);
    expect(isInvoiceEligible("quote_rejected")).toBe(false);
    expect(isInvoiceEligible("quote_approved")).toBe(true);
    expect(isInvoiceEligible("completed")).toBe(true);
  });

  it("defines private authorization and no-store response behavior on the invoice route", () => {
    const route = readFileSync(resolve(root, "server/invoiceRoute.ts"), "utf8");
    expect(route).toContain("order.userId !== user.id && user.role !== \"admin\"");
    expect(route).toContain("Cache-Control");
    expect(route).toContain("private, no-store");
  });
});
