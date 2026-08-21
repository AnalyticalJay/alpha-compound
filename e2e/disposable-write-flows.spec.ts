import { expect, test } from "@playwright/test";

const customerHeaders = { "x-e2e-role": "customer" };
const adminHeaders = { "x-e2e-role": "admin" };

test.describe("disposable quote and PayFast payment write flows", () => {
  test.beforeEach(async ({ request }) => {
    const reset = await request.post("/api/e2e/reset");
    expect(reset.status()).toBe(204);
  });

  test("approved customer can use a payment-ready dashboard order to start PayFast Instant EFT through isolated in-memory state", async ({ page }) => {
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
    await page.goto("/account/orders");
    await expect(page.getByText("Payment required", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Pay now" }).click();
    await page.getByRole("button", { name: "Pay by PayFast Instant EFT" }).click();
    await expect(page.getByText("Disposable E2E PayFast Instant EFT success callback received.")).toBeVisible();
    await expect(page.getByText("paid", { exact: true }).first()).toBeVisible();
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
    await page.getByRole("button", { name: "Pay securely with PayFast" }).click();
    await page.waitForURL(/\/orders\/42001$/);
    await expect(page.getByText("Disposable E2E PayFast success callback received.")).toBeVisible();
    await expect(page.getByText("paid", { exact: true }).first()).toBeVisible();
  });

  test("customer sees clear failure messaging after a disposable failed PayFast callback", async ({ page }) => {
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

    await page.setExtraHTTPHeaders({ ...customerHeaders, "x-e2e-payfast-outcome": "failure" });
    await page.goto("/orders/42001");
    await page.getByRole("button", { name: "Pay securely with PayFast" }).click();
    await page.waitForURL(/\/orders\/42001$/);
    await expect(page.getByRole("alert")).toContainText("Payment was not completed");
    await expect(page.getByRole("alert")).toContainText("Your approved quote is still active and no amount has been recorded.");
    await expect(page.getByRole("button", { name: "Retry Payment with PayFast" })).toBeVisible();
    await page.getByRole("button", { name: "Retry Payment with PayFast" }).click();
    await expect(page.getByRole("dialog")).toContainText("Choose how you would like to retry payment");
    await expect(page.getByRole("button", { name: "Continue with PayFast checkout" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with PayFast Instant EFT" })).toBeVisible();
  });

  test("an invalid disposable PayFast signature is rejected without changing payment state", async ({ page, request }) => {
    const seeded = await request.post("/api/e2e/seed/awaiting-payfast");
    expect(seeded.status()).toBe(201);

    const rejected = await request.post("/api/e2e/payfast-invalid-signature/42001", { data: { signature: "invalid" } });
    expect(rejected.status()).toBe(400);
    await expect(rejected.json()).resolves.toMatchObject({ error: "Invalid PayFast signature", status: "awaiting_payment", paymentStatus: "pending" });

    await page.setExtraHTTPHeaders(customerHeaders);
    await page.goto("/orders/42001");
    await expect(page.getByText("awaiting payment", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("pending", { exact: true }).first()).toBeVisible();
  });

  test("customer receives an authorized invoice after a disposable PayFast Instant EFT payment", async ({ page }) => {
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
    await page.getByRole("button", { name: "Pay by PayFast Instant EFT" }).click();
    await expect(page.getByText("Disposable E2E PayFast Instant EFT success callback received.")).toBeVisible();

    const anonymousInvoice = await page.request.get("/api/invoices/42001.pdf");
    expect(anonymousInvoice.status()).toBe(401);
    const customerInvoice = await page.request.get("/api/invoices/42001.pdf", { headers: customerHeaders });
    expect(customerInvoice.status()).toBe(200);
    expect(customerInvoice.headers()["content-type"]).toContain("application/pdf");
    const adminInvoice = await page.request.get("/api/invoices/42001.pdf", { headers: adminHeaders });
    expect(adminInvoice.status()).toBe(200);
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
    await page.getByLabel("Shipping status").selectOption("out_for_delivery");
    await page.getByPlaceholder("e.g. The Courier Guy").fill("E2E Courier");
    await page.getByPlaceholder("Tracking reference").fill("E2E-TRACK-001");
    await page.getByPlaceholder("https://courier.example/track/...").fill("https://tracking.example.test/E2E-TRACK-001");
    await page.getByRole("button", { name: "Save shipping update" }).click();
    await expect(page.getByText("Shipping details updated")).toBeVisible();

    await page.setExtraHTTPHeaders(customerHeaders);
    await page.goto("/notifications");
    await expect(page.getByText("Shipping updated for Quote #42001")).toBeVisible();
    await expect(page.getByText("with tracking number E2E-TRACK-001.")).toBeVisible();

    await page.goto("/orders/42001");
    await expect(page.getByRole("heading", { name: "Delivery tracking" })).toBeVisible();
    await expect(page.getByText("E2E Courier", { exact: true })).toBeVisible();
    await expect(page.getByText("E2E-TRACK-001", { exact: true })).toBeVisible();
    await expect(page.getByText("out for delivery", { exact: true })).toBeVisible();
    await expect(page.getByText("The courier is on the way to the delivery address.")).toBeVisible();
    await page.getByRole("button", { name: "Copy waybill number E2E-TRACK-001" }).click();
    await expect(page.getByRole("button", { name: "Waybill copied E2E-TRACK-001" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Track shipment" })).toHaveAttribute("href", "https://tracking.example.test/E2E-TRACK-001");
  });
});
