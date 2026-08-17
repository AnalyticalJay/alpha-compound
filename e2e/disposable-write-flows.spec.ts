import { expect, test } from "@playwright/test";

const customerHeaders = { "x-e2e-role": "customer" };
const adminHeaders = { "x-e2e-role": "admin" };

test.describe("disposable quote and EFT proof write flows", () => {
  test.beforeEach(async ({ request }) => {
    const reset = await request.post("/api/e2e/reset");
    expect(reset.status()).toBe(204);
  });

  test("approved customer submits a quote and uploads an EFT proof through isolated in-memory state", async ({ page }) => {
    await page.setExtraHTTPHeaders(customerHeaders);
    await page.goto("/products/e2e-test-compound");
    await expect(page.getByRole("heading", { name: "E2E Test Compound" })).toBeVisible();
    await page.getByRole("button", { name: "Add to Quote" }).click();
    await expect(page.getByText("added to quote cart")).toBeVisible();

    await page.goto("/cart");
    await expect(page.getByText("E2E Test Compound")).toBeVisible();
    await page.getByRole("button", { name: "Submit Quote Request" }).click();
    await expect(page.getByRole("heading", { name: /Submit Quote Request/i })).toBeVisible();

    await page.locator('input[name="fullName"]').fill("E2E Customer");
    await page.locator('input[name="phone"]').fill("0123456789");
    await page.locator('input[name="city"]').fill("Port Elizabeth");
    await page.locator('input[name="addressLine1"]').fill("42 Test Street");
    await page.locator('input[name="postalCode"]').fill("6001");
    await page.getByRole("button", { name: "Submit Quote Request" }).click();
    await page.waitForURL(/\/orders\/42001$/);
    await expect(page.getByText("Payment will become available after an admin reviews and approves this quote.")).toBeVisible();

    await page.setExtraHTTPHeaders(adminHeaders);
    await page.goto("/admin/orders/42001");
    await expect(page.getByRole("heading", { name: /Order #42001/i })).toBeVisible();
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "quote_approved", exact: true }).click();
    await page.getByRole("button", { name: "Update Status" }).click();
    await expect(page.getByText("Order status updated")).toBeVisible();

    await page.setExtraHTTPHeaders(customerHeaders);
    await page.goto("/orders/42001");
    await page.getByRole("button", { name: "Pay via EFT" }).click();
    await expect(page.getByText("EFT payment selected")).toBeVisible();
    await page.locator('input[type="file"]').setInputFiles({
      name: "e2e-proof.png",
      mimeType: "image/png",
      buffer: Buffer.from("disposable-e2e-proof"),
    });
    await expect(page.getByText("Proof of payment uploaded for verification.")).toBeVisible();
    await expect(page.getByText("Submitted for review")).toBeVisible();
    await expect(page.getByText("e2e-proof.png", { exact: true })).toBeVisible();
  });

  test("customer completes a disposable PayFast success callback without contacting the real gateway", async ({ page }) => {
    await page.setExtraHTTPHeaders(customerHeaders);
    await page.goto("/products/e2e-test-compound");
    await page.getByRole("button", { name: "Add to Quote" }).click();
    await expect(page.getByText("added to quote cart")).toBeVisible();
    await page.goto("/cart");
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
    await expect(page.getByText("Order status updated")).toBeVisible();

    await page.setExtraHTTPHeaders(customerHeaders);
    await page.goto("/orders/42001");
    await page.getByRole("button", { name: "Pay via PayFast" }).click();
    await page.waitForURL(/\/orders\/42001$/);
    await expect(page.getByText("Disposable E2E PayFast success callback received.")).toBeVisible();
    await expect(page.getByText("paid", { exact: true }).first()).toBeVisible();
  });

  test("administrator updates disposable shipping and the customer receives a notification", async ({ page }) => {
    await page.setExtraHTTPHeaders(customerHeaders);
    await page.goto("/products/e2e-test-compound");
    await page.getByRole("button", { name: "Add to Quote" }).click();
    await expect(page.getByText("added to quote cart")).toBeVisible();
    await page.goto("/cart");
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
    await page.getByLabel("Shipping status").selectOption("dispatched");
    await page.getByPlaceholder("e.g. The Courier Guy").fill("E2E Courier");
    await page.getByPlaceholder("Tracking reference").fill("E2E-TRACK-001");
    await page.getByRole("button", { name: "Save shipping update" }).click();
    await expect(page.getByText("Shipping details updated")).toBeVisible();

    await page.setExtraHTTPHeaders(customerHeaders);
    await page.goto("/notifications");
    await expect(page.getByText("Shipping updated for Quote #42001")).toBeVisible();
    await expect(page.getByText("with tracking number E2E-TRACK-001.")).toBeVisible();
  });
});
