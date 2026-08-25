import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { normalizeOrderLineItems } from "./db";

describe("order persistence safeguards", () => {
  it("normalizes durable order line values and rejects malformed items before any order header can be created", () => {
    expect(normalizeOrderLineItems([{ productId: 12, quantity: 2, priceAtPurchase: "10" }])).toEqual([
      { productId: 12, quantity: 2, priceAtPurchase: "10.00" },
    ]);
    expect(() => normalizeOrderLineItems([])).toThrow("Order requires at least one item");
    expect(() => normalizeOrderLineItems([{ productId: 0, quantity: 1, priceAtPurchase: "10" }])).toThrow("Invalid product");
    expect(() => normalizeOrderLineItems([{ productId: 12, quantity: 0, priceAtPurchase: "10" }])).toThrow("Invalid quantity");
    expect(() => normalizeOrderLineItems([{ productId: 12, quantity: 1, priceAtPurchase: "invalid" }])).toThrow("Invalid price");
  });

  it("keeps order headers, line items, shipping, submission events, and cart clearing in one transaction", () => {
    const source = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
    expect(source).toContain("return db.transaction(async (tx) => {");
    expect(source).toContain("await tx.insert(orderItems).values(lineItems.map");
    expect(source).toContain("await tx.insert(shippingDetails).values({ orderId, ...data.shipping })");
    expect(source).toContain("await tx.insert(paymentEvents).values({");
    expect(source).toContain("await tx.delete(cartItems).where(eq(cartItems.userId, data.userId))");
  });
});
