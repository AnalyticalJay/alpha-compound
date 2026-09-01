import { expect, test } from "@playwright/test";

test("approved customer sees a branded recovery state when a product image fails", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-e2e-role": "customer" });
  await page.route("**/manus-storage/products/30047/**", async (route) => {
    await route.fulfill({ status: 503, contentType: "text/plain", body: "simulated storage failure" });
  });

  await page.goto("/products");
  const firstCardImage = page.locator('[data-testid="product-card"]').first().locator('[data-product-image]');
  await expect(firstCardImage.locator('[data-image-status="fallback"]')).toBeVisible();
  await expect(firstCardImage.locator('img[data-image-status="fallback"]')).toHaveAttribute("src", /anabolics-africa-product-image-pending/);
  await expect.poll(() => firstCardImage.locator('img[data-image-status="fallback"]').evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(firstCardImage.locator('[data-image-status="unavailable"]')).toHaveCount(0);
});
