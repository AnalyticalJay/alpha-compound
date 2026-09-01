import { expect, test } from "@playwright/test";

const productDetailBaseUrl = process.env.PRODUCT_DETAIL_BASE_URL;

test("shows the detail-image skeleton until the eager product image loads", async ({ page }) => {
  test.skip(!productDetailBaseUrl, "PRODUCT_DETAIL_BASE_URL must reference a catalogue environment with the verified product fixture");

  await page.route("**/manus-storage/**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.continue();
  });

  await page.goto(
    new URL("/products/hd-testoviron-250mg-1ml-amp", productDetailBaseUrl).toString(),
    { waitUntil: "domcontentloaded" },
  );

  const skeleton = page.locator('[data-product-image-skeleton="true"]');
  const primaryImage = page.locator('[data-product-image="watermarked"] > img').first();

  await expect(skeleton).toBeVisible();
  await expect(skeleton).toHaveClass(/opacity-0/, { timeout: 15_000 });
  await expect(primaryImage).toHaveClass(/opacity-100/);
});
