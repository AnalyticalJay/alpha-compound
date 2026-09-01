import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("Shiplogic delivery UI contracts", () => {
  it("keeps waybill save and refresh actions administrator-only and payment-gated", () => {
    const router = read("server/routers.ts");
    const admin = read("client/src/pages/admin/AdminOrderDetail.tsx");
    expect(router).toContain("adminRefreshShiplogicTracking: adminProcedure");
    expect(router).toContain("order.paymentStatus !== \"paid\"");
    expect(router).toContain("Save a waybill only after payment is confirmed.");
    expect(admin).toContain("Refresh Flash tracking");
    expect(admin).toContain("order.paymentStatus === \"paid\"");
  });

  it("exposes provider status and safe event history to the customer order view", () => {
    const db = read("server/db.ts");
    const customer = read("client/src/pages/OrderDetail.tsx");
    expect(db).toContain("const trackingEvents = await getShipmentTrackingEvents(orderId)");
    expect(db).toContain("trackingEvents };");
    expect(customer).toContain("Flash Parcels live lookup");
    expect(customer).toContain("trackingEvents.slice(0, 5)");
    expect(customer).toContain("trackingLastCheckedAt");
  });
});
