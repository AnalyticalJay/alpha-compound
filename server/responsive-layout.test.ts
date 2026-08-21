import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

function source(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("responsive layout contracts", () => {
  it("keeps the product catalog usable on mobile", () => {
    const products = source("client/src/pages/Products.tsx");
    expect(products).toContain("lg:hidden");
    expect(products).toContain("w-[min(88vw,360px)]");
    expect(products).toContain("grid-cols-1 gap-5 sm:grid-cols-2");
  });

  it("stacks checkout content and disables sticky summary behavior on mobile", () => {
    const checkout = source("client/src/pages/Checkout.tsx");
    expect(checkout).toContain("grid gap-6 lg:grid-cols-3");
    expect(checkout).toContain("lg:sticky lg:top-24");
    expect(checkout).toContain("min-h-11 w-full");
  });

  it("keeps the admin navigation in a mobile drawer with bounded width", () => {
    const adminLayout = source("client/src/pages/admin/AdminLayout.tsx");
    expect(adminLayout).toContain("w-[min(82vw,15rem)]");
    expect(adminLayout).toContain("lg:hidden");
    expect(adminLayout).toContain("overflow-x-hidden");
  });

  it("stacks payment history content and switches the admin ledger to mobile cards", () => {
    const paymentPanel = source("client/src/components/PaymentHistoryPanel.tsx");
    const adminPayments = source("client/src/pages/admin/AdminPayments.tsx");
    expect(paymentPanel).toContain("flex-col gap-3 sm:flex-row");
    expect(paymentPanel).toContain("min-w-0 flex-1");
    expect(adminPayments).toContain("hidden overflow-x-auto md:block");
    expect(adminPayments).toContain("space-y-3 md:hidden");
    expect(adminPayments).toContain("w-40");
  });

  it("keeps tracking, notification, and report cards responsive", () => {
    const orderDetail = source("client/src/pages/OrderDetail.tsx");
    const notifications = source("client/src/components/NotificationList.tsx");
    const reports = source("client/src/pages/admin/AdminReports.tsx");
    const timeline = source("client/src/components/DeliveryTimeline.tsx");
    const home = source("client/src/pages/Home.tsx");
    expect(orderDetail).toContain("grid gap-3 text-sm sm:grid-cols-2");
    expect(notifications).toContain("flex items-start gap-3");
    expect(reports).toContain("grid gap-6 lg:grid-cols-2");
    expect(reports).toContain("grid gap-3 sm:grid-cols-2 lg:grid-cols-4");
    expect(timeline).toContain("grid gap-4 sm:grid-cols-6 sm:gap-2");
    expect(timeline).toContain("sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.8fr)]");
    expect(timeline).toContain('role="progressbar"');
    expect(timeline).toContain("sm:text-center");
    expect(home).toContain("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4");
    expect(home).toContain("grid-cols-1 sm:grid-cols-2 lg:grid-cols-4");
    expect(home).toContain("grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-16 md:gap-y-10");
    expect(home).toContain("relative flex gap-5 py-1 sm:gap-6");
    expect(home).toContain("grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-16");
    expect(home).toContain("grid gap-8 sm:grid-cols-2 sm:gap-10");
  });
});
