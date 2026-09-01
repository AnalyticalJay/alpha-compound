import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

describe("order-line availability workflow", () => {
  it("persists an explicit availability state on every quote line", () => {
    const schema = source("drizzle/schema.ts");
    expect(schema).toContain('availabilityStatus: mysqlEnum("availabilityStatus", ["pending", "in_stock", "out_of_stock"])');
    expect(schema).toContain('availabilityNotes: varchar("availabilityNotes", { length: 512 })');
  });

  it("blocks approval and payment until lines are confirmed in stock", () => {
    const db = source("server/db.ts");
    expect(db).toContain('inArray(orderItems.availabilityStatus, ["pending", "out_of_stock"])');
    expect(db).toContain("Confirm every quote item as in stock before approval");
    expect(db).toContain("Payment is unavailable until every quote item is confirmed in stock");
    expect(db).toContain("innerJoin(orders, eq(orderItems.orderId, orders.id))");
    expect(db).toContain("Only quotes awaiting review can change item availability");
  });

  it("exposes admin editing and customer-safe status messaging", () => {
    const admin = source("client/src/pages/admin/AdminOrderDetail.tsx");
    const customer = source("client/src/pages/OrderDetail.tsx");
    expect(admin).toContain("adminUpdateItemAvailability");
    expect(admin).toContain("Save item");
    expect(admin).toContain("Approve quote");
    expect(customer).toContain("Out of stock");
    expect(customer).toContain("Availability pending");
    expect(customer).toContain("Payment will become available after every item is confirmed as in stock.");
  });
});
