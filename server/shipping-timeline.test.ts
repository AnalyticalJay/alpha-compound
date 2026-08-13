import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getShippingProgress, isShippingMilestoneComplete } from "@shared/shippingTimeline";

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

  it("is integrated into both customer and administrator tracking views", () => {
    const component = source("client/src/components/DeliveryTimeline.tsx");
    const customer = source("client/src/pages/OrderDetail.tsx");
    const admin = source("client/src/pages/admin/AdminOrderDetail.tsx");
    expect(component).toContain("Delivery journey");
    expect(component).toContain("Returned to sender");
    expect(customer).toContain("<DeliveryTimeline");
    expect(admin).toContain("<DeliveryTimeline");
    expect(customer).toContain("order.shipping.shippingStatus");
    expect(admin).toContain("order.shipping.shippingStatus");
  });
});
