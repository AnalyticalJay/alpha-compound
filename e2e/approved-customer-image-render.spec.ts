import { expect, test } from "@playwright/test";

test.describe("approved customer product-image rendering", () => {
  test.use({ extraHTTPHeaders: { "x-e2e-role": "customer" } });

  test("renders the product image beneath the watermark in the catalogue", async ({ page }) => {
    await page.goto("/products");

    const image = page.locator('[data-product-image] img').first();
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("src", /.+/);
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  });

  test("renders the product image beneath the watermark on the detail page", async ({ page }) => {
    await page.goto("/products/e2e-test-compound");

    const image = page.locator('[data-product-image] img').first();
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("src", /.+/);
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  });
});
