import { expect, test } from "@playwright/test";

test.describe("public catalogue stability", () => {
  test("home page renders image-backed featured content and live category navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Featured Products" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Main Categories" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Injectables.*Browse/i })).toBeVisible();
    await expect(page.getByText("Featured product").first()).toBeVisible();
  });

  test("catalogue keeps prices gated and supports HD Labs filtering without a session", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByText("Prices are hidden")).toBeVisible();
    const filterButton = page.getByRole("button", { name: /Filter HD Labs/i });
    await expect(filterButton).toBeVisible();
    await filterButton.click();
    await expect(page.getByRole("button", { name: /Showing HD Labs Only/i })).toBeVisible();
    await expect(page.getByText("Approval required").first()).toBeVisible();
  });

  test("BP Pharma shortcut reveals verified supplier image cards without a session", async ({ page }) => {
    await page.goto("/products");
    const bpShortcut = page.getByRole("button", { name: /Browse BP Pharma/i });
    await expect(bpShortcut).toBeVisible();
    await bpShortcut.click();
    await expect(page.getByRole("button", { name: /Showing BP Pharma/i })).toBeVisible();
    await expect(page.locator('img[alt="BP Anapolin 25mg"]')).toBeVisible();
  });

  test("home category cards remain stable without horizontal overflow on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Main Categories" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Injectables.*Browse/i })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test("administrator can find the imported BP Pharma product with its normalized strength", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-e2e-role": "admin" });
    await page.goto("/admin/products");
    await page.getByPlaceholder("Search products...").fill("BP Anapolin 25mg");
    await expect(page.getByText("BP Anapolin 25mg", { exact: true })).toBeVisible();
    await expect(page.getByText("R200.00", { exact: true })).toBeVisible();
  });
});
