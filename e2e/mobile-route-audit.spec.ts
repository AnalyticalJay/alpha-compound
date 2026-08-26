import { expect, test } from "@playwright/test";

const customerHeaders = { "x-e2e-role": "customer" };
const adminHeaders = { "x-e2e-role": "admin" };

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  await expect
    .poll(() => page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth })))
    .toMatchObject({ scrollWidth: expect.any(Number), viewportWidth: 390 });

  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }));
  expect(dimensions.scrollWidth, `${page.url()} should not require horizontal page scrolling at 390px`).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
}

test.describe("390px all-route mobile audit", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("public storefront and identity routes do not overflow", async ({ page }) => {
    for (const path of ["/", "/register", "/login", "/products", "/products/e2e-test-compound"]) {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  test("customer quote, account, notification, and order routes do not overflow", async ({ page, request }) => {
    const seeded = await request.post("/api/e2e/seed/quote-approved");
    expect(seeded.status()).toBe(201);
    await page.setExtraHTTPHeaders(customerHeaders);

    for (const path of ["/cart", "/checkout", "/account", "/account/orders", "/notifications", "/approval-pending", "/orders/42001", "/order-success/42001", "/order-cancelled"]) {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  test("administrator dashboard and operational routes do not overflow", async ({ page, request }) => {
    const seeded = await request.post("/api/e2e/seed/quote-approved");
    expect(seeded.status()).toBe(201);
    await page.setExtraHTTPHeaders(adminHeaders);

    for (const path of ["/admin", "/admin/users", "/admin/products", "/admin/products/new", "/admin/bulk-import", "/admin/bulk-images", "/admin/categories", "/admin/orders", "/admin/orders/42001", "/admin/payments", "/admin/notifications", "/admin/reports"]) {
      await page.goto(path);
      await expect(page.getByRole("main")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });
});
