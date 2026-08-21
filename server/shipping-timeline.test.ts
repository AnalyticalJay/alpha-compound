import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getShippingProgress, isShippingMilestoneComplete, SHIPPING_MILESTONES } from "@shared/shippingTimeline";

const root = resolve(import.meta.dirname, "..");
const source = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("shipping delivery timeline", () => {
  it("marks completed milestones through the persisted current status", () => {
    expect(getShippingProgress("in_transit")).toEqual({ currentIndex: 3, isReturned: false });
    expect(isShippingMilestoneComplete("in_transit", 0)).toBe(true);
    expect(isShippingMilestoneComplete("in_transit", 3)).toBe(true);
    expect(isShippingMilestoneComplete("in_transit", 4)).toBe(false);
  });

  it("uses a dedicated returned state instead of presenting delivery as complete", () => {
    expect(getShippingProgress("returned")).toEqual({ currentIndex: -1, isReturned: true });
    expect(isShippingMilestoneComplete("returned", 4)).toBe(false);
  });

  it("adds Out for delivery as the final active step before delivered", () => {
    expect(SHIPPING_MILESTONES.map((milestone) => milestone.status)).toEqual([
      "pending", "packed", "dispatched", "in_transit", "out_for_delivery", "delivered",
    ]);
    expect(getShippingProgress("out_for_delivery")).toEqual({ currentIndex: 4, isReturned: false });
    expect(isShippingMilestoneComplete("out_for_delivery", 4)).toBe(true);
    expect(isShippingMilestoneComplete("out_for_delivery", 5)).toBe(false);
  });

  it("is integrated into both customer and administrator tracking views", () => {
    const component = source("client/src/components/DeliveryTimeline.tsx");
    const customer = source("client/src/pages/OrderDetail.tsx");
    const admin = source("client/src/pages/admin/AdminOrderDetail.tsx");
    expect(component).toContain("Delivery journey");
    expect(component).toContain("Returned to sender");
    expect(customer).toContain("<DeliveryTimeline");
    expect(admin).toContain("<DeliveryTimeline");
    expect(customer).toContain("<DeliveryTrackingPanel");
    expect(customer).toContain("shipping.shippingStatus");
    expect(admin).toContain("order.shipping.shippingStatus");
    expect(customer).toContain("Copy waybill number");
    expect(admin).toContain('value="out_for_delivery"');
  });
});
