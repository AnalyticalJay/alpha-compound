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
});
