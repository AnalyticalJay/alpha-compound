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
});
