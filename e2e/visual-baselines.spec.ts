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
