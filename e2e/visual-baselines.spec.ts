import { expect, test } from "@playwright/test";

test.describe("visual baselines", () => {
  test("public home page matches its stable visual baseline", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("public-home.png", { animations: "disabled", fullPage: false, maxDiffPixelRatio: 0.01 });
  });

  test("public catalogue matches its stable visual baseline", async ({ page }) => {
    await page.goto("/products");
    await expect(page).toHaveScreenshot("public-catalogue.png", { animations: "disabled", fullPage: false, maxDiffPixelRatio: 0.01 });
  });

  test("administrator category controls match their stable visual baseline", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-e2e-role": "admin" });
    await page.goto("/admin/categories");
    await expect(page).toHaveScreenshot("admin-categories.png", { animations: "disabled", fullPage: false, maxDiffPixelRatio: 0.01 });
  });

  test("customer quote detail matches its stable visual baseline", async ({ page, request }) => {
    const seeded = await request.post("/api/e2e/seed/quote-approved");
    expect(seeded.status()).toBe(201);
    await page.setExtraHTTPHeaders({ "x-e2e-role": "customer" });
    await page.goto("/orders/42001");
    await expect(page).toHaveScreenshot("customer-quote-detail.png", { animations: "disabled", fullPage: false, maxDiffPixelRatio: 0.01 });
  });

  test("administrator payments dashboard matches its stable visual baseline", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-e2e-role": "admin" });
    await page.goto("/admin/payments");
    await expect(page).toHaveScreenshot("admin-payments.png", { animations: "disabled", fullPage: false, maxDiffPixelRatio: 0.01 });
  });
});

test.describe("390px mobile visual baselines", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile member-benefit list is borderless and excludes removed blocks", async ({ page }) => {
    await page.goto("/");
    const heading = page.getByRole("heading", { name: "Clear at Every Step" });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    await expect(page.getByRole("heading", { name: "Gated Access" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Secure Payments" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Discreet Delivery" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "100+ Products" })).toBeVisible();
    await expect(page.getByText("HD Labs Exclusive", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Pharmaceutical Grade", { exact: true })).toHaveCount(0);
    await expect(heading.locator("..").locator("..")).toHaveScreenshot("mobile-home-member-benefits.png", {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
    });
  });

  test("mobile checkout journey matches its stable visual baseline", async ({ page, request }) => {
    const reset = await request.post("/api/e2e/reset");
    expect(reset.status()).toBe(204);
    await page.setExtraHTTPHeaders({ "x-e2e-role": "customer" });
    await page.goto("/products/e2e-test-compound");
    await page.getByRole("button", { name: "Add to Quote" }).click();
    await expect(page.getByText("added to quote cart")).toBeVisible();
    await page.goto("/cart");
    await page.getByRole("button", { name: "Submit Quote Request" }).click();
    await expect(page.getByRole("heading", { name: /Submit Quote Request/i })).toBeVisible();
    await expect(page).toHaveScreenshot("mobile-checkout.png", { animations: "disabled", fullPage: true, maxDiffPixelRatio: 0.01 });
  });

  test("mobile customer quote detail matches its stable visual baseline", async ({ page, request }) => {
    const seeded = await request.post("/api/e2e/seed/quote-approved");
    expect(seeded.status()).toBe(201);
    await page.setExtraHTTPHeaders({ "x-e2e-role": "customer" });
    await page.goto("/orders/42001");
    await expect(page).toHaveScreenshot("mobile-quote-detail.png", { animations: "disabled", fullPage: true, maxDiffPixelRatio: 0.01 });
  });
});
