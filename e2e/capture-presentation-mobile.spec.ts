import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const customerHeaders = { "x-e2e-role": "customer" };
const adminHeaders = { "x-e2e-role": "admin" };
const captureDirectory = "/home/ubuntu/webdev-static-assets/presentation-mobile-viewports";

test.describe("presentation mobile viewport captures", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeAll(async () => {
    await mkdir(captureDirectory, { recursive: true });
  });

  test("captures genuine mobile home and catalogue viewports", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Unlock your next phase/i })).toBeVisible();
    await page.screenshot({ path: path.join(captureDirectory, "mobile-home-390.png"), fullPage: false });

    await page.goto("/products");
    await expect(page.locator("main").first()).toBeVisible();
    await page.screenshot({ path: path.join(captureDirectory, "mobile-catalogue-390.png"), fullPage: false });
  });

  test("captures genuine mobile dashboard, payment, and delivery viewports", async ({ page, request }) => {
    const reset = await request.post("/api/e2e/reset");
    expect(reset.status()).toBe(204);

    await page.setExtraHTTPHeaders(customerHeaders);
    await page.goto("/products/e2e-test-compound");
    await page.getByRole("button", { name: "Add to Quote" }).click();
    await page.goto("/cart");
    await expect(page.getByText("E2E Test Compound", { exact: true })).toBeVisible();
    await page.screenshot({ path: path.join(captureDirectory, "mobile-quote-build-390.png"), fullPage: false });
    await page.getByRole("button", { name: "Submit Quote Request" }).click();
    await page.locator('input[name="fullName"]').fill("E2E Customer");
    await page.locator('input[name="phone"]').fill("0123456789");
    await page.locator('input[name="city"]').fill("Port Elizabeth");
    await page.locator('input[name="addressLine1"]').fill("42 Test Street");
    await page.locator('input[name="postalCode"]').fill("6001");
    await page.getByRole("button", { name: "Submit Quote Request" }).click();
    await page.waitForURL(/\/orders\/42001$/);

    await page.setExtraHTTPHeaders(adminHeaders);
    await page.goto("/admin/orders/42001");
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "quote_approved", exact: true }).click();
    await page.getByRole("button", { name: "Update Status" }).click();

    await page.setExtraHTTPHeaders(customerHeaders);
    await page.goto("/account/orders");
    await expect(page.getByText("Payment required", { exact: true })).toBeVisible();
    await page.screenshot({ path: path.join(captureDirectory, "mobile-dashboard-390.png"), fullPage: false });

    await page.goto("/orders/42001");
    await expect(page.getByRole("button", { name: "Pay securely with PayFast" })).toBeVisible();
    await page.screenshot({ path: path.join(captureDirectory, "mobile-payment-390.png"), fullPage: false });

    await page.setExtraHTTPHeaders(adminHeaders);
    await page.goto("/admin/orders/42001");
    await page.getByLabel("Shipping status").selectOption("out_for_delivery");
    await page.getByPlaceholder("e.g. The Courier Guy").fill("E2E Courier");
    await page.getByPlaceholder("Tracking reference").fill("E2E-TRACK-001");
    await page.getByPlaceholder("https://courier.example/track/...").fill("https://tracking.example.test/E2E-TRACK-001");
    await page.getByRole("button", { name: "Save shipping update" }).click();

    await page.setExtraHTTPHeaders(customerHeaders);
    await page.goto("/orders/42001");
    await expect(page.getByRole("heading", { name: "Delivery tracking" })).toBeVisible();
    await page.screenshot({ path: path.join(captureDirectory, "mobile-delivery-390.png"), fullPage: false });
  });
});
