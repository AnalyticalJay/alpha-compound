import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });
test.setTimeout(120_000);

type ImageAudit = {
  total: number;
  loaded: number;
  failed: Array<{ src: string; naturalWidth: number }>;
  storageResponses: Array<{ status: number; url: string }>;
};

async function loadFullCatalogue(page: Page): Promise<ImageAudit> {
  const storageResponses: Array<{ status: number; url: string }> = [];
  page.on("response", (response) => {
    if (response.url().includes("/manus-storage/")) {
      storageResponses.push({ status: response.status(), url: response.url() });
    }
  });

  await page.goto("/products");
  await expect(page.locator('[data-testid="product-card"]')).toHaveCount(12);

  while (await page.getByRole("button", { name: /Load \d+ more products/ }).count()) {
    const before = await page.locator('[data-testid="product-card"]').count();
    await page.getByRole("button", { name: /Load \d+ more products/ }).click();
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(Math.min(230, before + 12));
  }

  const images = page.locator('[data-product-image] img');
  await expect(images).toHaveCount(230);
  for (let index = 0; index < await images.count(); index += 1) {
    await images.nth(index).scrollIntoViewIfNeeded();
  }
  await expect.poll(async () => images.evaluateAll((elements) => elements.filter((element) => (element as HTMLImageElement).complete).length), { timeout: 90_000 }).toBe(230);

  return await images.evaluateAll((elements) => {
    const failed = elements
      .map((element) => ({ src: (element as HTMLImageElement).currentSrc || (element as HTMLImageElement).src, naturalWidth: (element as HTMLImageElement).naturalWidth }))
      .filter((image) => image.naturalWidth === 0);
    return { total: elements.length, loaded: elements.length - failed.length, failed, storageResponses: [] };
  }).then((audit) => ({ ...audit, storageResponses }));
}

test("public catalogue loads all 230 product images", async ({ page }) => {
  const audit = await loadFullCatalogue(page);
  expect(audit.total).toBe(230);
  expect(audit.failed, JSON.stringify(audit.storageResponses.filter((response) => response.status >= 400).slice(0, 10))).toEqual([]);
});

test("approved customer catalogue loads all 230 product images", async ({ page }) => {
  test.info().annotations.push({ type: "auth-path", description: "x-e2e-role customer" });
  await page.setExtraHTTPHeaders({ "x-e2e-role": "customer" });
  const audit = await loadFullCatalogue(page);
  expect(audit.total).toBe(230);
  expect(audit.failed, JSON.stringify(audit.storageResponses.filter((response) => response.status >= 400).slice(0, 10))).toEqual([]);
});

test("public-to-approved sign-in transition does not break catalogue images", async ({ page }) => {
  await page.goto("/products");
  await expect(page.locator('[data-testid="product-card"]')).toHaveCount(12);
  await page.setExtraHTTPHeaders({ "x-e2e-role": "customer" });
  await page.reload({ waitUntil: "networkidle" });
  const audit = await loadFullCatalogue(page);
  expect(audit.total).toBe(230);
  expect(audit.failed, JSON.stringify(audit.storageResponses.filter((response) => response.status >= 400).slice(0, 10))).toEqual([]);
});
