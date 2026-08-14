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

  test("home category cards remain stable without horizontal overflow on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Main Categories" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Injectables.*Browse/i })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});
